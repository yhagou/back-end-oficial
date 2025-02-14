import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Message } from '@prisma/client';
import { apiOpenia } from 'src/webapi/apiOpenia';
import { PromptDto } from './dto/prompt.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ChatMessage,
  ChatResponse,
  AIApiResponse,
  ChatHistoryResponse,
} from '../interfaces/chat.interfaces';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private currentChatId: string;

  constructor(private readonly prisma: PrismaService) {}

  async openia(promptDto: PromptDto): Promise<ChatResponse> {
    try {
      const { chatId, userId, prompt } = promptDto;

      // Obtém histórico do chat
      const chatHistory = await this.getChatHistory(chatId);
      const formattedMessages = this.formatMessagesForAPI(chatHistory, prompt);

      // Obtém resposta da IA
      const aiResponse = await this.getAIResponse(formattedMessages);

      // Gerencia o chat e salva mensagens
      const finalChatId = await this.handleChatAndMessages(
        chatId,
        userId,
        prompt,
        aiResponse,
      );

      // Obtém histórico atualizado
      const updatedHistory = await this.getChatHistory(finalChatId);

      return {
        id: aiResponse.id,
        content: this.formatMessagesForAPI(updatedHistory, ''),
        chatId: finalChatId,
      };
    } catch (error) {
      this.logger.error('Erro no processamento do chat:', error);
      throw new BadRequestException('Erro ao processar a solicitação do chat');
    }
  }

  private async handleChatAndMessages(
    chatId: string | undefined,
    userId: number,
    prompt: string,
    aiResponse: AIApiResponse,
  ): Promise<string> {
    // Se já existe um chatId, use-o. Caso contrário, crie um novo
    if (chatId) {
      this.currentChatId = chatId;
    } else {
      this.currentChatId = (await this.createChat(aiResponse.id, userId)).id;
    }

    // Salva mensagem do usuário e resposta do assistente em ordem
    const messages = [
      { role: 'user', content: prompt },
      {
        role: 'assistant' as const,
        content: aiResponse.choices[0].message.content,
      },
    ];

    await this.saveMessage(messages as ChatMessage[], this.currentChatId);

    return this.currentChatId;
  }

  private async getChatHistory(chatId?: string): Promise<Message[]> {
    if (!chatId) return [];

    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
  }

  private formatMessagesForAPI(
    messages: Message[],
    newPrompt: string,
  ): ChatMessage[] {
    const formattedMessages = messages
      .map((message) => {
        try {
          const parsedContent = JSON.parse(message.content as string);
          return Array.isArray(parsedContent)
            ? parsedContent
            : [
                {
                  role: parsedContent.role || 'user',
                  content: parsedContent.content,
                },
              ];
        } catch {
          return [{ role: 'user', content: message.content as string }];
        }
      })
      .flat();

    return newPrompt
      ? [...formattedMessages, { role: 'user', content: newPrompt }]
      : formattedMessages;
  }

  private async getAIResponse(messages: ChatMessage[]): Promise<AIApiResponse> {
    if (!messages.length) {
      throw new BadRequestException('Mensagens não podem estar vazias');
    }
    const response = await apiOpenia(messages);

    return response;
  }

  private async createChat(responseId: string, userId: number) {
    try {
      return await this.prisma.chat.create({
        data: { id: responseId, userId },
      });
    } catch (error) {
      this.logger.error('Erro ao criar chat:', error);
      throw new BadRequestException('Erro ao criar chat');
    }
  }

  private async saveMessage(messages: ChatMessage[], chatId: string) {
    const cleanMessages = messages.map(({ role, content }) => ({
      role: role as 'user' | 'assistant' | 'system',
      content,
    }));

    // Busca mensagem existente
    const existingMessage = await this.prisma.message.findFirst({
      where: { chatId },
    });

    if (existingMessage) {
      // Se existe, faz parse e adiciona novas mensagens
      const existingContent = JSON.parse(existingMessage.content as string);
      const updatedContent = [...existingContent, ...cleanMessages];

      return this.prisma.message.update({
        where: { id: existingMessage.id },
        data: {
          content: JSON.stringify(updatedContent),
        },
      });
    }

    // Se não existe, cria nova mensagem
    return this.prisma.message.create({
      data: {
        content: JSON.stringify(cleanMessages),
        chatId,
      },
    });
  }

  async getChatHistoryById(chatId: string): Promise<ChatHistoryResponse> {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!chat) {
        throw new BadRequestException('Chat não encontrado');
      }
      const returnMessages = {
        chatId: chat.id,
        messages: this.formatMessagesForAPI(chat.messages, ''),
      };
      return returnMessages;
    } catch (error) {
      this.logger.error(`Erro ao buscar histórico do chat ${chatId}:`, error);
      throw new BadRequestException('Erro ao buscar histórico do chat');
    }
  }

  async getUserChats(userId: number): Promise<ChatHistoryResponse[]> {
    try {
      const chats = await this.prisma.chat.findMany({
        where: {
          userId,
          messages: {
            some: {}, // Filtra apenas chats que têm pelo menos uma mensagem
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return chats.map((chat) => ({
        chatId: chat.id,
        messages: this.formatMessagesForAPI(chat.messages, ''),
      }));
    } catch (error) {
      this.logger.error(`Erro ao buscar chats do usuário ${userId}:`, error);
      throw new BadRequestException('Erro ao buscar chats do usuário');
    }
  }
}

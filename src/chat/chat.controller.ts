import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PromptDto } from './dto/prompt.dto';
import { ChatHistoryResponse } from '../interfaces/chat.interfaces';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  openia(@Body() promptDto: PromptDto): Promise<any> {
    return this.chatService.openia(promptDto);
  }

  @Get('history/:id')
  getChatHistory(@Param('id') chatId: string): Promise<ChatHistoryResponse> {
    return this.chatService.getChatHistoryById(chatId);
  }

  @Get('user/:userId')
  getUserChats(
    @Param('userId') userId: string,
  ): Promise<ChatHistoryResponse[]> {
    return this.chatService.getUserChats(Number(userId));
  }
}

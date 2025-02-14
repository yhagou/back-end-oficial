import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? 'chave-API',
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const apiOpenia = async (
  messages: ChatMessage[],
): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messages,
  });

  return response;
};

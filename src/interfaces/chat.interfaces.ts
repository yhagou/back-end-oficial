export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  id: string;
  content: ChatMessage[];
  chatId: string;
}

export interface AIApiResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

export interface ChatHistoryResponse {
  chatId: string;
  messages: ChatMessage[];
}

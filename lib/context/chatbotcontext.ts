import { createContext, useContext } from 'react';

export interface IMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  display: React.ReactNode;
}

export interface IChatbotContext {
  messages: IMessage[];
  sendMessage: (messageText: string) => Promise<void>;
  fetchMessages: () => Promise<void>;
}


const ChatbotContext = createContext<IChatbotContext>({ messages: [], sendMessage: async () => { }, fetchMessages: async () => { } });

export const useChatbotMessages = () => useContext(ChatbotContext);

export default ChatbotContext;

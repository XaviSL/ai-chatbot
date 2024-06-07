import React, { useState, useCallback } from 'react';
import ChatbotContext, { IMessage } from './chatbotcontext';
import { BotMessage, UserMessage } from '@/components/stocks/message';
import { nanoid } from 'nanoid';

interface IChatbotProviderProps {
  children: React.ReactNode;
}

const endpoint = 'https://supertruth-chatbot.azurewebsites.net/api/supertruthchat'
const headers = {
  'Content-Type': 'application/json',
  'x-functions-key': 'up-Yzd1Zc-mpfYEO7zGARGMv0COmR_1yjkzBgDfhsDEcAzFumDEQLA=='
}

const ChatbotProvider: React.FC<IChatbotProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  const fetchMessages = useCallback(async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(endpoint, {
        method: 'GET',
        headers
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, []);

  const sendMessage = useCallback(async (messageText: string) => {
    try {
      const humanMessage = {
        id: nanoid(),
        content: messageText,
        type: 'user' as const,
        timestamp: new Date(),
        display: <UserMessage>{messageText}</UserMessage>
      };
      


      setMessages([...messages, humanMessage]);

      // Replace with your actual API endpoint
      const history = messages.map(m => ({ content: m.content, type: m.type  === 'user' ? 'human' : 'ai'}))
      console.log('history', history)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: messageText,
          history
        }),
      });

      console.log('response',response)

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const readStream = async () => {
          const { done, value } = await reader.read();

          if (done) {
            return;
          }

          const decodedChunk = decoder.decode(value, { stream: true });

          const botMessage =  {
            id: nanoid(),
            content: decodedChunk,
            type: 'assistant' as const,
            timestamp: new Date(),
            display: <BotMessage content={decodedChunk} />
          };
          setMessages([...messages, humanMessage, botMessage])
          await readStream();
        };

        await readStream();
      }

    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [messages]);

  return (
    <ChatbotContext.Provider value={{ messages, sendMessage, fetchMessages }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export default ChatbotProvider;

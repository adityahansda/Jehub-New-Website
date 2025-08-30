import React from 'react';
import AIChatComponent from './AIChatComponent';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatPageProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  isAiLoading: boolean;
  setIsAiLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AIChatPage: React.FC<AIChatPageProps> = (props) => {
  return <AIChatComponent {...props} />;
};

export default AIChatPage;

import React, { useState } from 'react';
import { Bot, Send, X, MessageCircle, Minimize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatWidgetProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ isOpen = false, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(isOpen);

  const handleToggle = () => {
    setWidgetOpen(!widgetOpen);
    if (onToggle) onToggle();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Hello! I'm your AI assistant. I can help you with engineering topics, study tips, and platform navigation. What would you like to know?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Widget */}
      {widgetOpen ? (
        <div className="w-80 h-96 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
          {/* Widget Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggle}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleToggle}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 h-64 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-900">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Hi! I&apos;m here to help. Ask me anything!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600'
                  }`}>
                    {message.text}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-slate-400">
                  AI is typing...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 dark:border-slate-700">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Floating Chat Button */
        <button
          onClick={handleToggle}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default AIChatWidget;

import React from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatComponentProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  isAiLoading: boolean;
  setIsAiLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AIChatComponent: React.FC<AIChatComponentProps> = ({
  messages,
  setMessages,
  inputMessage,
  setInputMessage,
  isAiLoading,
  setIsAiLoading
}) => {

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsAiLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I&apos;m here to help you with your engineering studies! While I&apos;m still learning about JEHUB&apos;s resources, I can help answer questions about general engineering topics, study strategies, and platform navigation. What would you like to know?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsAiLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* AI Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="text-center">
          <Bot className="h-16 w-16 mx-auto mb-4 text-blue-200" />
          <h2 className="text-3xl font-bold mb-2">AI Chat Assistant 🤖</h2>
          <p className="text-blue-100 text-lg">
            Get instant help with your engineering studies and platform navigation
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-800/50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Welcome to AI Chat! 👋
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                I&apos;m your AI study companion. Ask me anything about engineering topics,
                study strategies, or how to use JEHUB effectively.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                {[
                  "Help me find Data Structures notes",
                  "Explain thermodynamics basics",
                  "How to upload my notes?",
                  "Study tips for exams"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(suggestion)}
                    className="text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-all duration-200 border border-slate-600/50 hover:border-slate-500"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user'
                    ? 'bg-blue-600'
                    : 'bg-purple-600'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`max-w-xs lg:max-w-md ${
                  message.sender === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/50 text-slate-200 border border-slate-600/50'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                  <p className={`text-xs text-slate-400 mt-1 ${
                    message.sender === 'user' ? 'text-right' : ''
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {/* Loading Indicator */}
          {isAiLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-6 border-t border-slate-700/50 bg-slate-800/30">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about engineering or JEHUB..."
              className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              disabled={isAiLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isAiLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isAiLoading ? 'Sending...' : 'Send'}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* AI Capabilities Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Bot className="h-5 w-5 mr-2 text-blue-400" />
            What I Can Help With
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Engineering concepts and explanations
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Study strategies and tips
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Platform navigation and features
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Assignment and project guidance
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Career advice and opportunities
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-purple-400" />
            Tips for Better Conversations
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2 mt-0.5">•</span>
              Be specific in your questions
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2 mt-0.5">•</span>
              Provide context when needed
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2 mt-0.5">•</span>
              Ask follow-up questions
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2 mt-0.5">•</span>
              Share your study level and goals
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIChatComponent;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Brain, User, X, Send } from 'lucide-react';

interface AIChatComponentProps {
  messages: Array<{id: string, text: string, sender: 'user' | 'ai', timestamp: Date}>;
  setMessages: React.Dispatch<React.SetStateAction<Array<{id: string, text: string, sender: 'user' | 'ai', timestamp: Date}>>>;
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
  // Chat states
  const [chatLanguage, setChatLanguage] = useState('english');
  const [showGreeting, setShowGreeting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiLoading]);
  
  // Initialize with greeting message
  useEffect(() => {
    if (showGreeting && messages.length === 0) {
      const greetings = {
        english: "Hello! 👋 I'm your AI Study Mentor. I'm here to help you with engineering studies, career guidance, and academic questions. How can I assist you today?",
        hindi: "नमस्ते! 👋 मैं आपका AI स्टडी मेंटर हूं। मैं आपकी इंजीनियरिंग की पढ़ाई, करियर गाइडेंस और शैक्षणिक सवालों में मदद करने के लिए यहां हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
        hinglish: "Hello! 👋 Main aapka AI Study Mentor hun. Main aapki engineering studies, career guidance, aur academic questions mein help karne ke liye yahan hun. Aaj main aapki kaise madad kar sakta hun?"
      };
      
      const greetingMessage = {
        id: 'greeting-' + Date.now().toString(),
        text: greetings[chatLanguage as keyof typeof greetings],
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages([greetingMessage]);
      }, 500);
    }
  }, [chatLanguage, showGreeting, messages.length, setMessages]);
  
  const sendMessage = async () => {
    if (!inputMessage.trim() || isAiLoading) return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsAiLoading(true);
    
    try {
      console.log('Sending message to AI API:', currentInput);
      
      // Include language preference in the request
      const languageInstruction = {
        english: "Please respond in clear, simple English.",
        hindi: "कृपया स्पष्ट और सरल हिंदी में उत्तर दें।",
        hinglish: "Please respond in Hinglish (Hindi-English mix) that's easy to understand."
      };
      
      const messageWithLanguage = `${languageInstruction[chatLanguage as keyof typeof languageInstruction]}\n\nUser: ${currentInput}`;
      
      // Call Google AI API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageWithLanguage,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        }),
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);
      
      const data = await response.json();
      console.log('API Response data:', data);
      
      let aiResponseText = '';
      let responseMetadata = null;
      
      if (response.ok && data.response) {
        aiResponseText = data.response;
        responseMetadata = data.metadata; // Enhanced search metadata
        
        // Log enhanced search results
        if (responseMetadata) {
          console.log('📊 Enhanced search results:', {
            source: responseMetadata.source,
            confidence: responseMetadata.confidence,
            relevanceScore: responseMetadata.relevanceScore,
            knowledgeEntries: responseMetadata.knowledgeEntriesCount
          });
          
          // Add metadata info to response if from knowledge base
          if (responseMetadata.source === 'knowledge_base' && responseMetadata.knowledgeEntriesCount > 0) {
            const confidenceEmoji: Record<string, string> = {
              'high': '🎯',
              'medium': '📚', 
              'low': '🔍'
            };
            const emoji = confidenceEmoji[responseMetadata.confidence as string] || '🤖';
            
            aiResponseText += `\n\n---\n${emoji} *Found ${responseMetadata.knowledgeEntriesCount} relevant ${responseMetadata.knowledgeEntriesCount === 1 ? 'entry' : 'entries'} from our knowledge base (${responseMetadata.confidence} confidence)*`;
          }
        }
      } else if (data.error) {
        aiResponseText = `Error: ${data.error}`;
      } else if (data.response) {
        // Even if status is not OK, use the response if available
        aiResponseText = data.response;
        responseMetadata = data.metadata;
      } else {
        aiResponseText = `API Error: ${response.status} - ${response.statusText || 'Unknown error'}`;
      }
      
      // Add a small delay to show the typing animation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai' as const,
        timestamp: new Date(),
        metadata: responseMetadata // Store metadata for potential future use
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Network/Parse Error:', error);
      
      // Add delay even for error messages
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const errorMessages = {
        english: `Connection Error: ${error instanceof Error ? error.message : 'Network error occurred'}. Please check your internet connection and try again.`,
        hindi: `कनेक्शन एरर: ${error instanceof Error ? error.message : 'नेटवर्क एरर हुआ है'}। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।`,
        hinglish: `Connection Error: ${error instanceof Error ? error.message : 'Network error hua hai'}. Please apna internet connection check karke phir try kariye.`
      };
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: errorMessages[chatLanguage as keyof typeof errorMessages],
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const quickReplies = {
    english: [
      "Explain thermodynamics concepts",
      "Help with programming problems",
      "Career guidance after diploma",
      "Study tips for exams",
      "Math problem solving",
      "Project ideas"
    ],
    hindi: [
      "थर्मोडायनामिक्स की अवधारणा समझाएं",
      "प्रोग्रामिंग की समस्याओं में मदद करें",
      "डिप्लोमा के बाद करियर गाइडेंस",
      "परीक्षा के लिए अध्ययन के टिप्स",
      "गणित की समस्या का समाधान",
      "प्रोजेक्ट के विचार"
    ],
    hinglish: [
      "Thermodynamics concepts explain kariye",
      "Programming problems mein help chahiye",
      "Diploma ke baad career guidance",
      "Exam ke liye study tips",
      "Math problems solve karne mein help",
      "Project ideas dijiye"
    ]
  };
  
  return (
    <div className="flex flex-col h-screen max-h-[calc(100vh-2rem)] bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      {/* Modern Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 flex-shrink-0 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Study Mentor</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-blue-100 text-sm">Online • Ready to help</p>
              </div>
            </div>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <select
              value={chatLanguage}
              onChange={(e) => setChatLanguage(e.target.value)}
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="english" className="text-gray-900">🇺🇸 English</option>
              <option value="hindi" className="text-gray-900">🇮🇳 हिंदी</option>
              <option value="hinglish" className="text-gray-900">🌐 Hinglish</option>
            </select>
            <button
              onClick={() => {
                setMessages([]);
                setShowGreeting(true);
              }}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
              title="Clear chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" style={{scrollBehavior: 'smooth'}}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-2xl">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Welcome to AI Study Mentor! 🚀</h3>
            <p className="text-slate-300 mb-8 max-w-md leading-relaxed">
              {chatLanguage === 'hindi' 
                ? 'मैं आपकी इंजीनियरिंग की पढ़ाई, करियर गाइडेंस और शैक्षणिक सवालों में मदद करने के लिए यहां हूं।'
                : chatLanguage === 'hinglish'
                ? 'Main aapki engineering studies, career guidance, aur academic questions mein help karne ke liye yahan hun.'
                : "I'm here to help you with engineering studies, career guidance, and academic questions."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
              {quickReplies[chatLanguage as keyof typeof quickReplies].map((reply, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(reply)}
                  className="p-4 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 hover:border-blue-500/50 rounded-xl text-left text-slate-300 hover:text-white text-sm transition-all duration-200 backdrop-blur-sm hover:scale-105"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>{reply}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 25,
                    duration: 0.3 
                  }}
                  className={`flex items-start space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Brain className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm border ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400/30 rounded-br-md'
                          : 'bg-slate-800/80 text-slate-100 border-slate-600/30 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.text.split(/\*\*(.*?)\*\*/g).map((part, partIndex) => {
                          return partIndex % 2 === 0 ? (
                            part
                          ) : (
                            <span key={partIndex} className="font-semibold">{part}</span>
                          );
                        })}
                      </p>
                    </div>
                    <p className={`text-xs mt-1 px-1 ${
                      message.sender === 'user' ? 'text-blue-300' : 'text-slate-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            {isAiLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/30 px-4 py-3 rounded-2xl rounded-bl-md shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                    </div>
                    <span className="text-xs text-slate-300 ml-2">
                      {chatLanguage === 'hindi' ? 'AI सोच रहा है...' : 
                       chatLanguage === 'hinglish' ? 'AI soch raha hai...' : 
                       'AI is thinking...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Auto-scroll reference */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input Area */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-t border-slate-600/30 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                  }
                }}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyPress={handleKeyPress}
                placeholder={
                  chatLanguage === 'hindi' ? "यहाँ अपना संदेश लिखें..." :
                  chatLanguage === 'hinglish' ? "Yahan apna message type kariye..." :
                  "Type your message here..."
                }
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none min-h-[44px] max-h-[120px] backdrop-blur-sm"
                disabled={isAiLoading}
                rows={1}
              />
              
              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isAiLoading}
                className={`absolute right-2 bottom-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  !inputMessage.trim() || isAiLoading
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-110'
                }`}
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 mt-2 text-center">
            {chatLanguage === 'hindi' 
              ? 'भेजने के लिए Enter दबाएं, नई लाइन के लिए Shift + Enter'
              : chatLanguage === 'hinglish' 
              ? 'Send karne ke liye Enter dabayiye, nayi line ke liye Shift + Enter'
              : 'Press Enter to send, Shift + Enter for new line'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatComponent;

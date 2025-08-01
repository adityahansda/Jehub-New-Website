import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';

interface NewsletterSubscriptionProps {
  source?: string;
  className?: string;
  darkMode?: boolean;
}

const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({ 
  source = 'newsletter', 
  className = '',
  darkMode = true 
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          source 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
        // Auto-hide success message after 5 seconds
        setTimeout(() => setIsSubscribed(false), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
        <div className={`${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'} rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4`}>
          <Check className="h-8 w-8" />
        </div>
        <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Successfully Subscribed! 🎉
        </h3>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-center`}>
          Thank you for subscribing! Check your email for a welcome message with important updates and community links.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} className={`w-full ${className}`}>
      {errorMessage && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          darkMode 
            ? 'bg-red-900/20 border border-red-800/50 text-red-400' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {errorMessage}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
        <div className="relative flex-1">
          <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={isSubmitting}
            className={`w-full pl-10 pr-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              darkMode 
                ? 'bg-[#0e0e10]/80 backdrop-blur-sm border border-[#2d2d30] text-white placeholder-[#666] focus:outline-none focus:border-[#9333ea]'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
          />
        </div>
        <button 
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            darkMode
              ? 'bg-[#9333ea] text-white hover:bg-[#7c3aed]'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Subscribing...
            </div>
          ) : (
            'Subscribe'
          )}
        </button>
      </div>
      
      <p className={`text-xs text-center mt-4 ${
        darkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        No spam, unsubscribe anytime. We respect your privacy.
      </p>
    </form>
  );
};

export default NewsletterSubscription;

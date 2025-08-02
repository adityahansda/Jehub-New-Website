import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: number; // Auto close after milliseconds
}

const SuccessToast: React.FC<SuccessToastProps> = ({ 
  message, 
  isVisible, 
  onClose, 
  autoClose = 5000 
}) => {
  useEffect(() => {
    if (isVisible && autoClose > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-green-800">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              className="inline-flex text-green-400 hover:text-green-600 focus:outline-none"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Animated progress bar */}
        <div className="mt-2 w-full bg-green-200 rounded-full h-1 overflow-hidden">
          <div 
            className="h-1 bg-green-500 rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: isVisible ? '0%' : '100%',
              transition: `width ${autoClose}ms linear`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SuccessToast;

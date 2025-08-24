import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export default function ThemeToggle({ variant = 'default', className = '' }: ThemeToggleProps) {
  const { darkMode } = useTheme();
  
  // Since theme is always dark mode, no toggle functionality
  const handleToggle = () => {
    // No-op since theme switching is disabled
  };

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleToggle}
        className={`p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-200 ${className}`}
        aria-label="Dark mode active"
        disabled
      >
        <Moon className="h-5 w-5 text-blue-400" />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggle}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-200 ${className}`}
        disabled
      >
        <Moon className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-medium text-gray-300">Dark</span>
      </button>
    );
  }

  // Default toggle switch style - always in dark mode position
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Sun className="h-5 w-5 text-gray-400 transition-colors duration-200" />
      
      <button
        onClick={handleToggle}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        role="switch"
        aria-checked={true}
        aria-label="Dark mode active"
        disabled
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 translate-x-6"
        />
      </button>
      
      <Moon className="h-5 w-5 text-blue-400 transition-colors duration-200" />
    </div>
  );
}

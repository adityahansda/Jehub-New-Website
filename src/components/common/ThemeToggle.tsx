import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export default function ThemeToggle({ variant = 'default', className = '' }: ThemeToggleProps) {
  const { darkMode, toggleDarkMode } = useTheme();

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleDarkMode}
        className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 ${className}`}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-gray-700" />
        )}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleDarkMode}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 ${className}`}
      >
        {darkMode ? (
          <>
            <Sun className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Light</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark</span>
          </>
        )}
      </button>
    );
  }

  // Default toggle switch style
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Sun className={`h-5 w-5 transition-colors duration-200 ${!darkMode ? 'text-yellow-500' : 'text-gray-400'}`} />
      
      <button
        onClick={toggleDarkMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          darkMode ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={darkMode}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            darkMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      
      <Moon className={`h-5 w-5 transition-colors duration-200 ${darkMode ? 'text-blue-400' : 'text-gray-400'}`} />
    </div>
  );
}

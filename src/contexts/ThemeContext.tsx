import React, { createContext, useContext } from 'react';

interface ThemeContextType {
  theme: 'dark';
  darkMode: true;
  isDarkMode: true;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always dark mode - no theme switching functionality
  const value: ThemeContextType = {
    theme: 'dark',
    darkMode: true,
    isDarkMode: true,
  };

  // Ensure dark class is always applied on the document
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


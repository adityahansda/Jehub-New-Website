import React from 'react';

interface AuthLoaderProps {
  className?: string;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="animate-pulse flex items-center space-x-2">
        <div className="rounded-full bg-white/10 h-8 w-8"></div>
        <div className="hidden sm:block w-16 h-4 bg-white/10 rounded"></div>
        <div className="w-4 h-4 bg-white/10 rounded"></div>
      </div>
    </div>
  );
};

export default AuthLoader;

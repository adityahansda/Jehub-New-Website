import React from 'react';
import { BookOpen, Database, Monitor, FileText, Code, Cpu, Terminal, Layers } from 'lucide-react';

interface NoteThumbnailProps {
  title: string;
  subject: string;
  className?: string;
}

const NoteThumbnail: React.FC<NoteThumbnailProps> = ({ title, subject, className = '' }) => {
  // Generate thumbnail based on subject
  const getThumbnailConfig = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'dsa':
        return {
          icon: Code,
          gradient: 'from-purple-600 to-pink-600',
          secondaryGradient: 'from-purple-700 to-pink-700',
          iconColor: 'text-white',
          title: 'Data Structures & Algorithms',
          shortTitle: 'DSA',
          accentColor: 'bg-purple-400'
        };
      case 'dbms':
        return {
          icon: Database,
          gradient: 'from-blue-600 to-cyan-600',
          secondaryGradient: 'from-blue-700 to-cyan-700',
          iconColor: 'text-white',
          title: 'Database Management System',
          shortTitle: 'DBMS',
          accentColor: 'bg-blue-400'
        };
      case 'os':
        return {
          icon: Monitor,
          gradient: 'from-green-600 to-teal-600',
          secondaryGradient: 'from-green-700 to-teal-700',
          iconColor: 'text-white',
          title: 'Operating Systems',
          shortTitle: 'OS',
          accentColor: 'bg-green-400'
        };
      default:
        return {
          icon: FileText,
          gradient: 'from-gray-600 to-slate-600',
          secondaryGradient: 'from-gray-700 to-slate-700',
          iconColor: 'text-white',
          title: subject.toUpperCase(),
          shortTitle: subject.toUpperCase(),
          accentColor: 'bg-gray-400'
        };
    }
  };

  const config = getThumbnailConfig(subject);
  const Icon = config.icon;

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <div 
        className={`w-full h-full bg-gradient-to-br ${config.gradient} flex flex-col items-center justify-center p-4 relative`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
          {/* Geometric pattern */}
          <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white/30 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border border-white/20 rounded-lg rotate-45"></div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10 text-center">
          {/* Icon with background circle */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <Icon className={`h-8 w-8 ${config.iconColor}`} />
          </div>
          
          {/* Subject label */}
          <div>
            <h3 className="text-white font-bold text-lg mb-1 leading-tight">{config.shortTitle}</h3>
            <p className="text-white/90 text-sm font-medium mb-1">Complete Notes</p>
            <div className={`w-12 h-1 ${config.accentColor} mx-auto rounded-full`}></div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <BookOpen className="h-3 w-3 text-white/70" />
        </div>
        
        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-white/30 via-white/20 to-white/30"></div>
        
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
      </div>
    </div>
  );
};

export default NoteThumbnail;

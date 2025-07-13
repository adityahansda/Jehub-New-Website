import React from 'react';
import { BookOpen, Star, Award, GraduationCap } from 'lucide-react';

interface NoteBadgeProps {
  type: 'degree' | 'semester' | 'subject' | 'branch' | 'points' | 'featured';
  value: string | number;
  variant?: 'default' | 'premium' | 'featured';
}

const NoteBadge: React.FC<NoteBadgeProps> = ({ type, value, variant = 'default' }) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'degree':
        return {
          icon: <GraduationCap className="h-3 w-3 mr-1" />,
          className: variant === 'premium' 
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
            : 'bg-orange-100 text-orange-800 border border-orange-200',
          label: value
        };
      case 'semester':
        return {
          icon: <BookOpen className="h-3 w-3 mr-1" />,
          className: 'bg-green-100 text-green-800 border border-green-200',
          label: `${value} Semester`
        };
      case 'subject':
        return {
          icon: <BookOpen className="h-3 w-3 mr-1" />,
          className: 'bg-purple-100 text-purple-800 border border-purple-200',
          label: value
        };
      case 'branch':
        return {
          icon: <BookOpen className="h-3 w-3 mr-1" />,
          className: 'bg-blue-100 text-blue-800 border border-blue-200',
          label: value
        };
      case 'points':
        return {
          icon: <Star className="h-3 w-3 mr-1" />,
          className: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md',
          label: `${value} pts`
        };
      case 'featured':
        return {
          icon: <Award className="h-3 w-3 mr-1" />,
          className: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg animate-pulse',
          label: 'Featured'
        };
      default:
        return {
          icon: null,
          className: 'bg-gray-100 text-gray-800 border border-gray-200',
          label: value
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default NoteBadge;

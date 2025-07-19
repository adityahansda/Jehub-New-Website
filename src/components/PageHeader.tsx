import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Menu } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onMenuClick?: () => void;
  showBackButton?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  icon: Icon, 
  onMenuClick, 
  showBackButton = true 
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section - Back Button */}
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <button
              onClick={handleBackClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}
          
          {/* Page Title and Icon */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
        </div>

        {/* Right Section - Menu Button (Mobile Only) */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

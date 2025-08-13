import React from 'react';
import { FileText, FileImage, FileVideo, FileAudio, FileCode, FileArchive, File } from 'lucide-react';

export interface FileIconProps {
  fileName: string;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  onLoad?: (success: boolean) => void;
  onError?: (error: string) => void;
  fallbackIcon?: React.ReactNode;
  showLoadingText?: boolean;
  lazy?: boolean;
}

const FileIcon: React.FC<FileIconProps> = ({
  fileName,
  width = 160,
  height = 200,
  className = '',
  alt = 'File Icon',
  onLoad,
  onError,
  fallbackIcon,
  showLoadingText = false,
  lazy = true,
}) => {
  // Determine file type and icon based on file extension
  const getFileIcon = () => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="w-full h-full text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return <FileImage className="w-full h-full text-green-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
        return <FileVideo className="w-full h-full text-purple-500" />;
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
        return <FileAudio className="w-full h-full text-blue-500" />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
        return <FileCode className="w-full h-full text-yellow-500" />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <FileArchive className="w-full h-full text-orange-500" />;
      default:
        return <File className="w-full h-full text-gray-500" />;
    }
  };

  // Determine background color based on file type
  const getBackgroundColor = () => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return 'bg-red-50 border-red-200';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return 'bg-green-50 border-green-200';
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
        return 'bg-purple-50 border-purple-200';
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
        return 'bg-blue-50 border-blue-200';
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
        return 'bg-yellow-50 border-yellow-200';
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  React.useEffect(() => {
    // Simulate load success since we're not actually loading anything
    if (onLoad) {
      onLoad(true);
    }
  }, [onLoad]);

  return (
    <div 
      className={`flex items-center justify-center ${getBackgroundColor()} border-2 rounded-lg ${className}`}
      style={{ width, height }}
      title={fileName}
    >
      {fallbackIcon || getFileIcon()}
    </div>
  );
};

export default FileIcon;

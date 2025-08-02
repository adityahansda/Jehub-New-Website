import React from 'react';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { profilePictureService } from '../services/profilePictureService';

interface ProfilePictureProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ size = 'md', className = '' }) => {
  const { user, userProfile } = useAuth();

  if (!user || !userProfile) {
    return null;
  }

  const profileImageUrl = userProfile.profileImageUrl;
  
  // Size configurations
  const sizeConfig = {
    sm: { 
      className: 'h-7 w-7', 
      width: 28, 
      height: 28, 
      textSize: 'text-xs' 
    },
    md: { 
      className: 'h-9 w-9', 
      width: 36, 
      height: 36, 
      textSize: 'text-sm' 
    },
    lg: { 
      className: 'h-10 w-10', 
      width: 40, 
      height: 40, 
      textSize: 'text-base' 
    }
  };
  
  const config = sizeConfig[size];
  const finalClassName = `${config.className} rounded-full ${className}`;

  if (profileImageUrl) {
    // Display actual profile picture if available
    return (
      <Image
        src={profileImageUrl}
        alt={userProfile.name || user.name}
        className={finalClassName}
        width={config.width}
        height={config.height}
      />
    );
  }

  // Fallback to initials if profile picture doesn't exist
  const initials = profilePictureService.generateInitials(userProfile.name || user.name);

  return (
    <div className={`${config.className} bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center ${className}`}>
      <span className={`text-white font-semibold ${config.textSize}`}>
        {initials}
      </span>
    </div>
  );
};

export default ProfilePicture;


import React from 'react';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { getBestProfilePictureUrl, generateUserInitials } from '../lib/profileUtils';

interface ProfilePictureProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ size = 'md', className = '' }) => {
  const { user, userProfile } = useAuth();

  if (!user) {
    return null;
  }

  // Get the best available profile picture URL
  const profileImageUrl = getBestProfilePictureUrl(
    userProfile || undefined,
    user.$id,
    userProfile?.name || user.name
  );
  
  // Generate user initials for fallback
  const initials = generateUserInitials(userProfile?.name || user.name);
  
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

  // Check if we have a valid profile image URL (not just a fallback)
  const hasRealProfilePicture = userProfile?.profileImageUrl && (
    userProfile.profileImageUrl.includes('googleusercontent.com') ||
    userProfile.profileImageUrl.includes('googleapis.com') ||
    userProfile.profileImageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );

  if (hasRealProfilePicture) {
    // Display actual profile picture if available
    return (
      <Image
        src={userProfile.profileImageUrl!}
        alt={userProfile.name || user.name}
        className={finalClassName}
        width={config.width}
        height={config.height}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    );
  }

  // Fallback to generated avatar or initials
  if (profileImageUrl && !hasRealProfilePicture) {
    return (
      <Image
        src={profileImageUrl}
        alt={userProfile?.name || user.name}
        className={finalClassName}
        width={config.width}
        height={config.height}
        onError={(e) => {
          // If generated avatar fails, show initials
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    );
  }

  // Ultimate fallback to initials
  return (
    <div className={`${config.className} bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center ${className}`}>
      <span className={`text-white font-semibold ${config.textSize}`}>
        {initials}
      </span>
    </div>
  );
};

export default ProfilePicture;


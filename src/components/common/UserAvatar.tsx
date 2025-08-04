import React from 'react';
import Image from 'next/image';
import { getBestProfilePictureUrl, generateUserInitials } from '../../lib/profileUtils';

interface UserAvatarProps {
  user?: {
    $id?: string;
    id?: string;
    name?: string;
    email?: string;
    profileImageUrl?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackColor?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '',
  fallbackColor = 'orange'
}) => {
  if (!user) {
    return null;
  }

  // Size configurations
  const sizeConfig = {
    xs: { 
      className: 'h-6 w-6', 
      width: 24, 
      height: 24, 
      textSize: 'text-xs' 
    },
    sm: { 
      className: 'h-8 w-8', 
      width: 32, 
      height: 32, 
      textSize: 'text-xs' 
    },
    md: { 
      className: 'h-10 w-10', 
      width: 40, 
      height: 40, 
      textSize: 'text-sm' 
    },
    lg: { 
      className: 'h-12 w-12', 
      width: 48, 
      height: 48, 
      textSize: 'text-base' 
    },
    xl: { 
      className: 'h-16 w-16', 
      width: 64, 
      height: 64, 
      textSize: 'text-lg' 
    }
  };

  // Color configurations for fallback
  const colorConfig = {
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500',
    purple: 'bg-gradient-to-r from-purple-500 to-violet-500',
    orange: 'bg-gradient-to-r from-amber-500 to-orange-500',
    red: 'bg-gradient-to-r from-red-500 to-rose-500'
  };
  
  const config = sizeConfig[size];
  const colorClass = colorConfig[fallbackColor];
  const finalClassName = `${config.className} rounded-full ${className}`;

  // Get the best available profile picture URL
  const profileImageUrl = getBestProfilePictureUrl(
    user,
    user.$id || user.id,
    user.name
  );
  
  // Generate user initials for fallback
  const initials = generateUserInitials(user.name || 'Unknown User');

  // Check if we have a real profile picture (not just a generated avatar)
  const hasRealProfilePicture = user.profileImageUrl && (
    user.profileImageUrl.includes('googleusercontent.com') ||
    user.profileImageUrl.includes('googleapis.com') ||
    user.profileImageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );

  if (hasRealProfilePicture) {
    // Display actual profile picture if available
    return (
      <div className={`${finalClassName} relative overflow-hidden`}>
        <Image
          src={user.profileImageUrl!}
          alt={user.name || 'User'}
          className="object-cover w-full h-full"
          width={config.width}
          height={config.height}
          onError={(e) => {
            // Hide image on error and show fallback
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {/* Fallback initials (hidden by default, shown when image fails) */}
        <div className={`absolute inset-0 ${colorClass} flex items-center justify-center`} style={{ display: 'none' }}>
          <span className={`text-white font-semibold ${config.textSize}`}>
            {initials}
          </span>
        </div>
      </div>
    );
  }

  // Fallback to generated avatar or initials
  if (profileImageUrl && !hasRealProfilePicture) {
    return (
      <div className={`${finalClassName} relative overflow-hidden`}>
        <Image
          src={profileImageUrl}
          alt={user.name || 'User'}
          className="object-cover w-full h-full"
          width={config.width}
          height={config.height}
          onError={(e) => {
            // Hide image on error and show initials fallback
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        {/* Fallback initials */}
        <div className={`absolute inset-0 ${colorClass} flex items-center justify-center`} style={{ display: 'none' }}>
          <span className={`text-white font-semibold ${config.textSize}`}>
            {initials}
          </span>
        </div>
      </div>
    );
  }

  // Ultimate fallback to initials only
  return (
    <div className={`${finalClassName} ${colorClass} flex items-center justify-center`}>
      <span className={`text-white font-semibold ${config.textSize}`}>
        {initials}
      </span>
    </div>
  );
};

export default UserAvatar;

import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profilePictureService } from '../services/profilePictureService';
import { storage } from '../lib/appwrite';
import { ID } from 'appwrite';
import { Camera, Upload, X } from 'lucide-react';
import ProfilePicture from './ProfilePicture';

const ProfilePictureUpload: React.FC = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !userProfile) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload file to Appwrite storage
      const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '686d369e003c78073cc9';
      const fileName = `profile_${user.$id}_${Date.now()}.${file.name.split('.').pop()}`;
      
      const uploadedFile = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file
      );

      // Get the file URL
      const fileUrl = storage.getFileView(STORAGE_BUCKET_ID, uploadedFile.$id);

      // Update user profile with new image URL
      await profilePictureService.saveProfilePictureFromGoogle(
        user.$id,
        user.email,
        fileUrl.toString()
      );

      // Refresh user profile to show new image
      await refreshUserProfile();

      setSuccess('Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      setError(`Failed to upload profile picture: ${error.message}`);
    } finally {
      setIsUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
      
      {/* Current Profile Picture */}
      <div className="flex flex-col items-center mb-6">
        <div className="mb-4">
          <ProfilePicture size="lg" className="w-20 h-20" />
        </div>
        <p className="text-sm text-gray-600 text-center">
          {userProfile.profileImageUrl ? 'Current profile picture' : 'Using initials as profile picture'}
        </p>
      </div>

      {/* Upload Button */}
      <div className="space-y-4">
        <button
          onClick={handleButtonClick}
          disabled={isUploading}
          className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium transition-colors ${
            isUploading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Change Profile Picture
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* File Requirements */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Supported formats: JPG, PNG, GIF, WebP</p>
          <p>• Maximum file size: 5MB</p>
          <p>• Recommended size: 400x400 pixels</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-4 w-4 bg-green-400 rounded-full"></div>
            </div>
            <p className="ml-2 text-sm text-green-800">{success}</p>
          </div>
          <button
            onClick={clearMessages}
            className="text-green-400 hover:text-green-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-4 w-4 bg-red-400 rounded-full"></div>
            </div>
            <p className="ml-2 text-sm text-red-800">{error}</p>
          </div>
          <button
            onClick={clearMessages}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;

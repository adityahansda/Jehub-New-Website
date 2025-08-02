import React from 'react';
import Link from 'next/link';
import { useAuth } from '../src/contexts/AuthContext';
import ProfilePicture from '../src/components/ProfilePicture';
import ProfilePictureUpload from '../src/components/ProfilePictureUpload';

const TestProfile: React.FC = () => {
  const { user, userProfile } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Profile Picture</h1>
          <p className="text-gray-600 mb-4">Please login to test the profile picture</p>
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Picture Test</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">User Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Name:</strong> {userProfile?.name || user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Profile Image URL:</strong> {userProfile?.profileImageUrl || 'None'}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Profile Picture Sizes</h2>
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <ProfilePicture size="sm" />
                  <p className="text-sm text-gray-600 mt-2">Small (28px)</p>
                </div>
                <div className="text-center">
                  <ProfilePicture size="md" />
                  <p className="text-sm text-gray-600 mt-2">Medium (36px)</p>
                </div>
                <div className="text-center">
                  <ProfilePicture size="lg" />
                  <p className="text-sm text-gray-600 mt-2">Large (40px)</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Profile Picture in Navigation</h2>
              <p className="text-gray-600 mb-4">
                Check the navigation bar at the top of the page to see how the profile picture looks in context.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Upload Profile Picture</h2>
              <ProfilePictureUpload />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Future Enhancements</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Fetch Google profile picture during OAuth (requires Google API setup)</li>
                <li>Implement Gravatar integration as fallback</li>
                <li>Add profile picture editing features</li>
                <li>Sync with social media profile pictures</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestProfile;

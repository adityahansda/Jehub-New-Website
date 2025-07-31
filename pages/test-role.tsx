import React, { useEffect, useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useRoleVerification } from '../src/hooks/useRoleVerification';
import { userService } from '../src/services/userService';
import { Shield, User, Eye, RefreshCw } from 'lucide-react';

const TestRole: React.FC = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { userRole, isAdmin, loading: roleLoading, hasAccess } = useRoleVerification();
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchProfileDirectly = async () => {
    if (!user?.email) return;
    
    setProfileLoading(true);
    setError('');
    try {
      const profile = await userService.getUserProfile(user.email);
      setProfileData(profile);
      console.log('Direct profile fetch:', profile);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchProfileDirectly();
    }
  }, [user?.email]);

  const roleTests = [
    { role: 'admin', level: 5 },
    { role: 'manager', level: 4 },
    { role: 'intern', level: 3 },
    { role: 'student', level: 2 },
    { role: 'user', level: 1 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-600" />
            Role Testing Dashboard
          </h1>
          <p className="text-gray-600 mb-6">
            This page helps debug role verification issues for admin access.
          </p>

          {/* Current User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Authentication Status</h3>
              <div className="space-y-2 text-sm">
                <div>Auth Loading: <span className="font-mono">{authLoading.toString()}</span></div>
                <div>User Exists: <span className="font-mono">{(!!user).toString()}</span></div>
                <div>User Email: <span className="font-mono">{user?.email || 'N/A'}</span></div>
                <div>User Name: <span className="font-mono">{user?.name || 'N/A'}</span></div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Role Verification</h3>
              <div className="space-y-2 text-sm">
                <div>Role Loading: <span className="font-mono">{roleLoading.toString()}</span></div>
                <div>Detected Role: <span className="font-mono">{userRole || 'N/A'}</span></div>
                <div>Is Admin: <span className="font-mono">{isAdmin.toString()}</span></div>
                <div>Has Admin Access: <span className="font-mono">{hasAccess('admin').toString()}</span></div>
              </div>
            </div>
          </div>

          {/* Profile Data */}
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-yellow-900">Profile Data</h3>
              <button
                onClick={fetchProfileDirectly}
                disabled={profileLoading}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50 flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${profileLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm mb-2">Error: {error}</div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>From Context:</strong>
                <pre className="bg-white p-2 rounded mt-1 text-xs overflow-auto">
                  {JSON.stringify(userProfile, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Direct Fetch:</strong>
                <pre className="bg-white p-2 rounded mt-1 text-xs overflow-auto">
                  {JSON.stringify(profileData, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Role Access Tests */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-4">Role Access Tests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roleTests.map((test) => (
                <div key={test.role} className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{test.role}</span>
                    <span className="text-xs text-gray-500">Level {test.level}</span>
                  </div>
                  <div className="text-sm">
                    Access: {hasAccess(test.role as any) ? (
                      <span className="text-green-600 font-semibold">✓ Granted</span>
                    ) : (
                      <span className="text-red-600 font-semibold">✗ Denied</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Dashboard Test */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Admin Dashboard Access Test</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Current role <strong>{userRole}</strong> should {isAdmin ? 'have' : 'NOT have'} access to admin dashboard.
              </p>
              
              <div className="flex gap-3">
                <a
                  href="/admin-dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Test Admin Dashboard Access
                </a>
                
                <a
                  href="/dashboard"
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Go to Regular Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRole;

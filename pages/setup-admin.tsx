import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { userService } from '../src/services/userService';
import { Shield, Save, AlertCircle, CheckCircle } from 'lucide-react';

const SetupAdmin: React.FC = () => {
  const { user, refreshUserProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'intern' | 'student' | 'user'>('admin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSetRole = async () => {
    if (!user?.email) {
      setMessage({ type: 'error', text: 'No user email found' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await userService.setUserRoleByEmail(user.email, selectedRole);
      await refreshUserProfile(); // Refresh the user profile in context
      setMessage({ 
        type: 'success', 
        text: `Successfully set role to ${selectedRole}. Please refresh the page to see changes.` 
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to set role' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Setup Admin Role</h1>
          <p className="text-gray-600 mt-2">
            Set your user role for testing admin dashboard access
          </p>
        </div>

        {user && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Current User</h3>
            <div className="text-sm space-y-1">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Name:</strong> {user.name}</div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="admin">Admin (Level 5)</option>
              <option value="manager">Manager (Level 4)</option>
              <option value="intern">Intern (Level 3)</option>
              <option value="student">Student (Level 2)</option>
              <option value="user">User (Level 1)</option>
            </select>
          </div>

          {message && (
            <div className={`p-3 rounded-lg flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <button
            onClick={handleSetRole}
            disabled={loading || !user}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Setting Role...' : `Set Role to ${selectedRole}`}
          </button>

          <div className="flex gap-2">
            <a
              href="/test-role"
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-center"
            >
              Test Roles
            </a>
            <a
              href="/admin-dashboard"
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 text-center"
            >
              Admin Dashboard
            </a>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• This is for testing purposes only</li>
            <li>• Role changes take effect immediately</li>
            <li>• You may need to refresh pages to see changes</li>
            <li>• Admin role gives access to all features</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SetupAdmin;

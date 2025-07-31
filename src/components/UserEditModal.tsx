import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { userService, UserProfile } from '../services/userService';
import { UserRole } from '../hooks/useRoleVerification';

type UserStatus = 'active' | 'banned' | 'inactive';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onUserUpdated: (updatedUser: UserProfile) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, userId, onUserUpdated }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as UserRole,
    status: 'active' as UserStatus,
    phone: '',
    college: '',
    branch: '',
    semester: '',
    totalPoints: 0,
    rank: 0,
    notesUploaded: 0,
    notesDownloaded: 0,
    requestsFulfilled: 0,
    bio: '',
    city: '',
    state: '',
    country: 'India'
  });

  useEffect(() => {
    if (isOpen && userId) {
      fetchUser();
    }
  }, [isOpen, userId]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const userData = await userService.getUserById(userId);
      if (userData) {
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          role: (userData.role || 'user') as UserRole,
          status: (userData.status || 'active') as UserStatus,
          phone: userData.phone || '',
          college: userData.college || '',
          branch: userData.branch || '',
          semester: userData.semester || '',
          totalPoints: userData.totalPoints || 0,
          rank: userData.rank || 0,
          notesUploaded: userData.notesUploaded || 0,
          notesDownloaded: userData.notesDownloaded || 0,
          requestsFulfilled: userData.requestsFulfilled || 0,
          bio: userData.bio || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || 'India'
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field === 'role') {
      setFormData(prev => ({ ...prev, [field]: value as UserRole }));
    } else if (field === 'status') {
      setFormData(prev => ({ ...prev, [field]: value as UserStatus }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      const updatedUser = await userService.adminUpdateUserProfile(userId, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        phone: formData.phone,
        college: formData.college,
        branch: formData.branch,
        semester: formData.semester,
        totalPoints: formData.totalPoints,
        rank: formData.rank,
        notesUploaded: formData.notesUploaded,
        notesDownloaded: formData.notesDownloaded,
        requestsFulfilled: formData.requestsFulfilled,
        bio: formData.bio,
        city: formData.city,
        state: formData.state,
        country: formData.country
      });
      
      onUserUpdated(updatedUser);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Failed to save user data');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="student">Student</option>
                      <option value="intern">Intern</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="banned">Banned</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Academic & Gamification */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Academic & Stats</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => handleInputChange('college', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => handleInputChange('branch', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <input
                      type="text"
                      value={formData.semester}
                      onChange={(e) => handleInputChange('semester', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Points</label>
                    <input
                      type="number"
                      value={formData.totalPoints}
                      onChange={(e) => handleInputChange('totalPoints', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rank</label>
                    <input
                      type="number"
                      value={formData.rank}
                      onChange={(e) => handleInputChange('rank', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Gamification Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Activity Stats</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes Uploaded</label>
                    <input
                      type="number"
                      value={formData.notesUploaded}
                      onChange={(e) => handleInputChange('notesUploaded', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes Downloaded</label>
                    <input
                      type="number"
                      value={formData.notesDownloaded}
                      onChange={(e) => handleInputChange('notesDownloaded', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requests Fulfilled</label>
                    <input
                      type="number"
                      value={formData.requestsFulfilled}
                      onChange={(e) => handleInputChange('requestsFulfilled', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Location & Bio */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Location & Bio</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;

import React, { useState, useEffect } from 'react';
import { Users, Ban, Search, Shield, Eye, AlertTriangle, RefreshCw, Calendar, Mail, Phone, GraduationCap, Trash2, Edit, Save, X, UserCog } from 'lucide-react';
import { databases } from '../../lib/appwrite';
import { appwriteConfig } from '../../lib/appwriteConfig';
import { authService } from '../../services/auth';
import { Query } from 'appwrite';

interface DatabaseUser {
  $id: string;
  email: string;
  name: string;
  role: string;
  isProfileComplete: boolean;
  referralCode: string;
  college?: string;
  branch?: string;
  semester?: string;
  year?: string;
  phone?: string;
  telegramUsername?: string;
  profileImageUrl?: string;
  $createdAt: string;
  $updatedAt: string;
}

interface CombinedUser {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'unverified' | 'incomplete';
  role: string;
  isProfileComplete: boolean;
  emailVerified: boolean;
  lastLogin: string;
  joinDate: string;
  college?: string;
  branch?: string;
  semester?: string;
  year?: string;
  phone?: string;
  profileImageUrl?: string;
  hasAppwriteAccount: boolean;
  hasDatabaseProfile: boolean;
}

const UserAccountManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<CombinedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<CombinedUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<CombinedUser | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unverified: 0,
    incomplete: 0
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching users from database...');

      // Fetch all users from the database
      const databaseUsers = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [
          Query.limit(100), // Fetch up to 100 users at a time
          Query.orderDesc('$createdAt')
        ]
      );

      console.log('Database users fetched:', databaseUsers.documents.length);

      // Process and combine user data
      const combinedUsers: CombinedUser[] = databaseUsers.documents.map((user: any) => {
        const dbUser = user as DatabaseUser;

        // Determine status based on profile completion and verification
        let status: 'active' | 'suspended' | 'unverified' | 'incomplete' = 'active';

        if (!dbUser.isProfileComplete) {
          status = 'incomplete';
        }

        return {
          id: dbUser.$id,
          name: dbUser.name || 'Unknown User',
          email: dbUser.email,
          status,
          role: dbUser.role || 'user',
          isProfileComplete: dbUser.isProfileComplete || false,
          emailVerified: true, // Assume verified if in database
          lastLogin: dbUser.$updatedAt ? new Date(dbUser.$updatedAt).toLocaleString() : 'Never',
          joinDate: new Date(dbUser.$createdAt).toLocaleDateString(),
          college: dbUser.college,
          branch: dbUser.branch,
          semester: dbUser.semester,
          year: dbUser.year,
          phone: dbUser.phone,
          profileImageUrl: dbUser.profileImageUrl,
          hasAppwriteAccount: true, // Assume true if in database
          hasDatabaseProfile: true
        };
      });

      // Calculate statistics
      const newStats = {
        total: combinedUsers.length,
        active: combinedUsers.filter(u => u.status === 'active').length,
        unverified: combinedUsers.filter(u => u.status === 'unverified').length,
        incomplete: combinedUsers.filter(u => u.status === 'incomplete').length
      };

      setUsers(combinedUsers);
      setStats(newStats);
      console.log('Users processed:', combinedUsers.length);

    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (user: CombinedUser) => {
    setSelectedUser(user);
    setEditedUser({ ...user });
    setIsEditing(false);
    setShowUserModal(true);
  };

  const handleEditUser = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedUser(selectedUser ? { ...selectedUser } : null);
    setIsEditing(false);
  };

  const handleUpdateUser = async () => {
    if (!editedUser || !selectedUser) return;

    try {
      setLoading(true);

      // Update user role in database
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        selectedUser.id,
        {
          name: editedUser.name,
          email: editedUser.email,
          role: editedUser.role,
          college: editedUser.college || '',
          branch: editedUser.branch || '',
          semester: editedUser.semester || '',
          year: editedUser.year || '',
          phone: editedUser.phone || '',
        }
      );

      // Refresh users list
      await fetchUsers();
      alert('User updated successfully.');
      setIsEditing(false);
      setShowUserModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof CombinedUser, value: string) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [field]: value });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setLoading(true);

        // Delete user from both database and authentication system via API
        const response = await fetch('/api/admin/delete-user', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete user');
        }

        // Refresh users list
        await fetchUsers();
        alert(result.message || 'User deleted successfully from database and authentication system.');
        setShowUserModal(false);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      setLoading(true);
      // Update user role in database
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        userId,
        { role: newRole }
      );

      // Refresh users list
      await fetchUsers();
      alert(`User role changed to ${newRole} successfully.`);

      setShowUserModal(false);
    } catch (error) {
      console.error('Error changing user role:', error);
      alert('Failed to change user role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (confirm('Are you sure you want to suspend this user?')) {
      // TODO: Implement user suspension logic
      console.log('Suspending user:', userId);
      alert('User suspension functionality will be implemented soon.');
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'unverified':
        return 'bg-yellow-100 text-yellow-800';
      case 'incomplete':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'intern':
        return 'bg-green-100 text-green-800';
      case 'team':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Account Manager</h2>
          <p className="text-gray-600">Loading users...</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Account Manager</h2>
          <p className="text-gray-600">Manage registered users and their accounts</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center h-64 flex-col">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 text-center mb-4">{error}</p>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Account Manager</h2>
          <p className="text-gray-600">Manage registered users and their accounts</p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unverified</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unverified}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Incomplete</p>
              <p className="text-2xl font-bold text-gray-900">{stats.incomplete}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{user.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{user.email}</p>
                      <div className="flex space-x-4">
                        <span>Joined: {user.joinDate}</span>
                        <span>Last active: {user.lastLogin}</span>
                        {user.college && <span>College: {user.college}</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View & Edit Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleSuspendUser(user.id)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Suspend Account"
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserAccountManager;

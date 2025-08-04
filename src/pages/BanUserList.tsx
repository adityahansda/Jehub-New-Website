import React, { useState, useEffect } from 'react';
import { UserX, Send, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface BannedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  banReason: string;
  banDate: string;
  banDuration: 'permanent' | 'temporary';
  banEndDate?: string;
  bannedBy: string;
  violations: number;
  previousBans: number;
  userType: 'student' | 'faculty' | 'admin';
}

const BanUserList = () => {
  const [unbanRequests, setUnbanRequests] = useState<{ [key: string]: boolean }>({});
  const [isClient, setIsClient] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDate = (dateString: string) => {
    if (!isClient) return dateString; // Return raw string on server
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const bannedUsers: BannedUser[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91-9876543210',
      banReason: 'Spam messages and inappropriate content sharing in community groups',
      banDate: '2024-12-15',
      banDuration: 'temporary',
      banEndDate: '2025-03-15',
      bannedBy: 'Admin Team',
      violations: 3,
      previousBans: 1,
      userType: 'student',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@college.edu',
      phone: '+91-8765432109',
      banReason: 'Harassment and bullying of other community members',
      banDate: '2024-11-20',
      banDuration: 'permanent',
      bannedBy: 'Community Manager',
      violations: 5,
      previousBans: 2,
      userType: 'student',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@university.edu',
      phone: '+91-7654321098',
      banReason: 'Sharing fake academic information and misleading content',
      banDate: '2025-01-10',
      banDuration: 'temporary',
      banEndDate: '2025-04-10',
      bannedBy: 'Content Moderator',
      violations: 2,
      previousBans: 0,
      userType: 'faculty',
    }
  ];

  const handleUnbanRequest = (userId: string) => {
    setUnbanRequests(prev => ({
      ...prev,
      [userId]: true
    }));
    alert('Unban request sent. An admin will review it.');
  };

  const toggleUserDetails = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full mb-6">
            <UserX className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Banned Users</h1>
          <p className="text-gray-600">Click to view ban details and request unban</p>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Banned Users ({bannedUsers.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {bannedUsers.map((user) => (
              <div key={user.id} className="p-6">
                <div
                  onClick={() => toggleUserDetails(user.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {expandedUser === user.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                {expandedUser === user.id && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <div className="p-4">
                      <p className="text-sm text-gray-600">Phone: {user.phone}</p>
                      <p className="text-sm text-gray-600">Reason: {user.banReason}</p>
                      <p className="text-sm text-gray-600">Banned By: {user.bannedBy}</p>
                      <p className="text-sm text-gray-600">Type: {user.banDuration}</p>
                      {user.banDuration === 'temporary' && user.banEndDate && (
                        <p className="text-sm text-gray-600">Ban ends on: {formatDate(user.banEndDate)}</p>
                      )}
                      <div className="mt-4">
                        <button
                          onClick={() => handleUnbanRequest(user.id)}
                          disabled={unbanRequests[user.id]}
                          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center justify-center"
                        >
                          <Send className="h-5 w-5" />
                          <span>{unbanRequests[user.id] ? 'Request Sent' : 'Request Unban'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {bannedUsers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <UserX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No banned users found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BanUserList;


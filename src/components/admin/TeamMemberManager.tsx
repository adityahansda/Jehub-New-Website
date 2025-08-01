import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Plus,
  Mail,
  Phone,
  Calendar,
  Shield,
  Ban,
  UnlockKeyhole,
  Activity,
  Star,
  Eye
} from 'lucide-react';

interface TeamMemberManagerProps {
  userRole: string;
}

const TeamMemberManager: React.FC<TeamMemberManagerProps> = ({ userRole }) => {
  const [activeView, setActiveView] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@jehub.com',
      role: 'Manager',
      status: 'active',
      joinDate: '2023-08-15',
      lastActivity: '2 hours ago',
      points: 2450,
      uploads: 45,
      avatar: 'SJ',
      phone: '+1234567890',
      permissions: ['manage_users', 'approve_notes', 'view_analytics']
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike@jehub.com',
      role: 'Developer',
      status: 'active',
      joinDate: '2023-09-01',
      lastActivity: '30 minutes ago',
      points: 1980,
      uploads: 32,
      avatar: 'MC',
      phone: '+1234567891',
      permissions: ['manage_content', 'technical_support']
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily@jehub.com',
      role: 'Content Creator',
      status: 'active',
      joinDate: '2023-07-20',
      lastActivity: '1 day ago',
      points: 1750,
      uploads: 28,
      avatar: 'ED',
      phone: '+1234567892',
      permissions: ['create_content', 'moderate_community']
    },
    {
      id: 4,
      name: 'Alex Wilson',
      email: 'alex@jehub.com',
      role: 'Intern',
      status: 'inactive',
      joinDate: '2023-10-10',
      lastActivity: '1 week ago',
      points: 520,
      uploads: 8,
      avatar: 'AW',
      phone: '+1234567893',
      permissions: ['basic_access']
    }
  ]);

  const [joinRequests, setJoinRequests] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john@email.com',
      role: 'Developer',
      experience: '3 years',
      motivation: 'I want to contribute to educational technology and help students succeed.',
      skills: ['React', 'Node.js', 'Python'],
      portfolio: 'github.com/johnsmith',
      appliedDate: '2024-01-15',
      resume: 'john_smith_resume.pdf'
    },
    {
      id: 2,
      name: 'Lisa Brown',
      email: 'lisa@email.com',
      role: 'Content Creator',
      experience: '2 years',
      motivation: 'Passionate about creating educational content and helping students learn better.',
      skills: ['Content Writing', 'Video Editing', 'Graphic Design'],
      portfolio: 'behance.net/lisabrown',
      appliedDate: '2024-01-12',
      resume: 'lisa_brown_resume.pdf'
    }
  ]);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleApproveRequest = (requestId: number) => {
    console.log('Approving request:', requestId);
    const request = joinRequests.find(req => req.id === requestId);
    if (request) {
      const newMember = {
        id: Date.now(),
        name: request.name,
        email: request.email,
        role: request.role,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        lastActivity: 'Just joined',
        points: 0,
        uploads: 0,
        avatar: request.name.split(' ').map(n => n[0]).join(''),
        phone: '+1234567890',
        permissions: ['basic_access']
      };
      setTeamMembers(prev => [...prev, newMember]);
      setJoinRequests(prev => prev.filter(req => req.id !== requestId));
      alert(`${request.name} has been approved and added to the team!`);
    }
  };

  const handleRejectRequest = (requestId: number) => {
    console.log('Rejecting request:', requestId);
    const request = joinRequests.find(req => req.id === requestId);
    if (request) {
      setJoinRequests(prev => prev.filter(req => req.id !== requestId));
      alert(`${request.name}'s request has been rejected.`);
    }
  };

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const handleBanMember = (memberId: number) => {
    console.log('Banning member:', memberId);
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, status: 'banned' } : member
    ));
    alert('Member has been banned.');
  };

  const handleUnbanMember = (memberId: number) => {
    console.log('Unbanning member:', memberId);
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, status: 'active' } : member
    ));
    alert('Member has been unbanned.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'banned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Manager': return 'bg-purple-100 text-purple-800';
      case 'Developer': return 'bg-blue-100 text-blue-800';
      case 'Content Creator': return 'bg-green-100 text-green-800';
      case 'Intern': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600">Manage team members, roles, and join requests</p>
        </div>
        {userRole === 'admin' && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveView('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'members'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Team Members ({teamMembers.length})
          </button>
          <button
            onClick={() => setActiveView('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Join Requests ({joinRequests.length})
          </button>
        </nav>
      </div>

      {activeView === 'members' ? (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="Manager">Manager</option>
                <option value="Developer">Developer</option>
                <option value="Content Creator">Content Creator</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <div key={member.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-semibold text-gray-900">{member.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(member.role)}`}>
                            {member.role}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)}`}>
                            {member.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {member.email}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Joined {member.joinDate}
                          </span>
                          <span className="flex items-center">
                            <Activity className="h-4 w-4 mr-1" />
                            Last seen {member.lastActivity}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1" />
                            {member.points} points
                          </span>
                          <span>{member.uploads} uploads</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditMember(member)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Member"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Activity"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {userRole === 'admin' && (
                        <>
                          {member.status === 'active' ? (
                            <button
                              onClick={() => handleBanMember(member.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Ban Member"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnbanMember(member.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Unban Member"
                            >
                              <UnlockKeyhole className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Join Requests */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Join Requests</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {joinRequests.map((request) => (
                <div key={request.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{request.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(request.role)}`}>
                          {request.role}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Email:</strong> {request.email}</p>
                        <p><strong>Experience:</strong> {request.experience}</p>
                        <p><strong>Skills:</strong> {request.skills.join(', ')}</p>
                        <p><strong>Portfolio:</strong> <a href={`https://${request.portfolio}`} className="text-blue-600 hover:underline">{request.portfolio}</a></p>
                        <p><strong>Applied:</strong> {request.appliedDate}</p>
                      </div>
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700"><strong>Motivation:</strong></p>
                        <p className="text-sm text-gray-600 mt-1">{request.motivation}</p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <UserCheck className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <UserX className="h-4 w-4" />
                        Reject
                      </button>
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Resume
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMemberManager;

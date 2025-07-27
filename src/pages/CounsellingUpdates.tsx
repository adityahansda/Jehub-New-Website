import React, { useState } from 'react';
import { Users, Calendar, MapPin, Clock, AlertTriangle, CheckCircle, Info, Download, Filter, Search, UserCheck } from 'lucide-react';

const CounsellingUpdates = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const counsellingUpdates = [
    {
      id: 1,
      title: 'Diploma Admission Counselling 2024 - Round 1',
      description: 'First round of counselling for diploma course admissions. Bring all required documents.',
      date: '2024-08-10',
      time: '10:00 AM - 04:00 PM',
      venue: 'State Counselling Center, Ranchi',
      status: 'upcoming',
      priority: 'high',
      category: 'Admission',
      eligibility: ['10th Pass', '12th Pass'],
      seats: 2500,
      downloadUrl: '#'
    },
    {
      id: 2,
      title: 'Document Verification Schedule',
      description: 'Document verification for qualified candidates. Ensure all documents are properly attested.',
      date: '2024-08-05',
      time: '09:00 AM - 05:00 PM',
      venue: 'Regional Centers',
      status: 'ongoing',
      priority: 'high',
      category: 'Verification',
      eligibility: ['Qualified Candidates'],
      seats: null,
      downloadUrl: '#'
    },
    {
      id: 3,
      title: 'Counselling Guidelines and Instructions',
      description: 'Detailed guidelines for the counselling process including required documents and procedures.',
      date: '2024-07-25',
      time: 'Available 24/7',
      venue: 'Online Portal',
      status: 'active',
      priority: 'medium',
      category: 'Guidelines',
      eligibility: ['All Candidates'],
      seats: null,
      downloadUrl: '#'
    },
    {
      id: 4,
      title: 'Special Category Counselling',
      description: 'Separate counselling session for SC/ST/OBC and physically challenged candidates.',
      date: '2024-08-15',
      time: '11:00 AM - 03:00 PM',
      venue: 'Special Counselling Center',
      status: 'scheduled',
      priority: 'high',
      category: 'Special',
      eligibility: ['SC/ST/OBC', 'PH Candidates'],
      seats: 500,
      downloadUrl: '#'
    },
    {
      id: 5,
      title: 'Spot Admission Round',
      description: 'Final spot admission round for remaining vacant seats in various diploma courses.',
      date: '2024-08-25',
      time: '10:00 AM - 02:00 PM',
      venue: 'Multiple Centers',
      status: 'scheduled',
      priority: 'medium',
      category: 'Spot Admission',
      eligibility: ['Eligible Candidates'],
      seats: 300,
      downloadUrl: '#'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'ongoing': return <Users className="h-5 w-5 text-blue-600" />;
      case 'upcoming': return <Clock className="h-5 w-5 text-orange-600" />;
      case 'scheduled': return <Calendar className="h-5 w-5 text-purple-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const filteredUpdates = counsellingUpdates.filter(update => {
    const matchesFilter = selectedFilter === 'all' || update.status === selectedFilter;
    const matchesSearch = update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         update.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Counselling Updates</h1>
              <p className="text-gray-600">Get the latest information about counselling schedules, procedures, and important notices</p>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-8 w-8 bg-purple-100 text-purple-600 p-2 rounded-full" />
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search counselling updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Updates</option>
                <option value="active">Active</option>
                <option value="ongoing">Ongoing</option>
                <option value="upcoming">Upcoming</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600 mb-1">{counsellingUpdates.filter(u => u.status === 'active').length}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">{counsellingUpdates.filter(u => u.status === 'ongoing').length}</div>
              <div className="text-sm text-gray-600">Ongoing</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-orange-600 mb-1">{counsellingUpdates.filter(u => u.status === 'upcoming').length}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {counsellingUpdates.reduce((sum, u) => sum + (u.seats || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Seats</div>
            </div>
          </div>
        </div>

        {/* Counselling Updates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUpdates.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No counselling updates found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredUpdates.map((update) => (
              <div
                key={update.id}
                className={`bg-white rounded-lg border-l-4 ${getPriorityColor(update.priority)} shadow-sm hover:shadow-md transition-shadow duration-200 p-6`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(update.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(update.status)}`}>
                    {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 leading-relaxed">{update.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{update.date}</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>{update.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{update.venue}</span>
                  </div>
                  {update.seats && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{update.seats} seats available</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Eligible Candidates:</div>
                  <div className="flex flex-wrap gap-1">
                    {update.eligibility.map((criteria, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {criteria}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    update.priority === 'high' ? 'bg-red-100 text-red-800' :
                    update.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {update.priority.charAt(0).toUpperCase() + update.priority.slice(1)} Priority
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {update.category}
                    </span>
                    <button className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Important Guidelines */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Counselling Guidelines</h3>
              <ul className="text-blue-700 leading-relaxed space-y-1 text-sm">
                <li>• Bring all original documents along with photocopies</li>
                <li>• Report to the counselling center at least 30 minutes before your scheduled time</li>
                <li>• Keep multiple college preferences ready</li>
                <li>• Check document verification requirements beforehand</li>
                <li>• Contact helpline for any queries: 1800-XXX-XXXX</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h3>
              <p className="text-yellow-700 leading-relaxed">
                Candidates are advised to regularly check this page for any last-minute changes in counselling schedules. 
                For emergency queries during counselling hours, contact the helpdesk at the respective centers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounsellingUpdates;

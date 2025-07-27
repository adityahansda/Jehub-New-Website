import React, { useState } from 'react';
import { Calendar, Clock, MapPin, AlertTriangle, CheckCircle, FileText, Download, Filter, Search, BookOpen } from 'lucide-react';

const ExamUpdates = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const examUpdates = [
    {
      id: 1,
      title: 'Final Semester Examination Schedule 2024',
      description: 'Complete examination schedule for all diploma courses final semester examinations.',
      date: '2024-08-15',
      time: '09:00 AM',
      venue: 'Various Examination Centers',
      status: 'scheduled',
      priority: 'high',
      category: 'Schedule',
      subjects: ['Computer Science', 'Electronics', 'Mechanical', 'Civil'],
      downloadUrl: '#'
    },
    {
      id: 2,
      title: 'Mid-Term Examination Results',
      description: 'Results for mid-term examinations are now available for download.',
      date: '2024-07-28',
      time: '10:00 AM',
      venue: 'Online Portal',
      status: 'completed',
      priority: 'medium',
      category: 'Results',
      subjects: ['All Branches'],
      downloadUrl: '#'
    },
    {
      id: 3,
      title: 'Practical Examination Guidelines',
      description: 'Updated guidelines and procedures for upcoming practical examinations.',
      date: '2024-08-05',
      time: '11:00 AM',
      venue: 'College Laboratories',
      status: 'upcoming',
      priority: 'high',
      category: 'Guidelines',
      subjects: ['Engineering Branches'],
      downloadUrl: '#'
    },
    {
      id: 4,
      title: 'Supplementary Examination Notice',
      description: 'Notice for supplementary examinations for students who missed regular exams.',
      date: '2024-08-20',
      time: '02:00 PM',
      venue: 'Regional Centers',
      status: 'scheduled',
      priority: 'medium',
      category: 'Notice',
      subjects: ['All Branches'],
      downloadUrl: '#'
    },
    {
      id: 5,
      title: 'Online Examination System Demo',
      description: 'Demonstration session for the new online examination system.',
      date: '2024-07-30',
      time: '03:00 PM',
      venue: 'Virtual Meeting',
      status: 'upcoming',
      priority: 'low',
      category: 'Demo',
      subjects: ['All Students'],
      downloadUrl: '#'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'scheduled': return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'upcoming': return <Clock className="h-5 w-5 text-orange-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming': return 'bg-orange-100 text-orange-800 border-orange-200';
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

  const filteredUpdates = examUpdates.filter(update => {
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
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Exam Updates</h1>
              <p className="text-gray-600">Stay informed about examination schedules, results, and important notices</p>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 bg-blue-100 text-blue-600 p-2 rounded-full" />
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exam updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Updates</option>
                <option value="scheduled">Scheduled</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">{examUpdates.filter(u => u.status === 'scheduled').length}</div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-orange-600 mb-1">{examUpdates.filter(u => u.status === 'upcoming').length}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600 mb-1">{examUpdates.filter(u => u.status === 'completed').length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-red-600 mb-1">{examUpdates.filter(u => u.priority === 'high').length}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
          </div>
        </div>

        {/* Exam Updates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUpdates.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No exam updates found</h3>
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
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Applicable to:</div>
                  <div className="flex flex-wrap gap-1">
                    {update.subjects.map((subject, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {subject}
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
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {update.category}
                    </span>
                    <button className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Important Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h3>
              <p className="text-yellow-700 leading-relaxed">
                Please regularly check this page for the latest exam updates. All students are advised to download 
                admit cards at least 3 days before the examination date. For any queries, contact your respective 
                college examination cell.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamUpdates;

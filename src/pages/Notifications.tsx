import React, { useState } from 'react';
import { Bell, Calendar, AlertCircle, CheckCircle, Info, X, Clock, Filter, Search, Bookmark, BookmarkCheck } from 'lucide-react';

const Notifications = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    {
      id: 1,
      type: 'exam',
      title: 'Semester End Examination Schedule Released',
      message: 'The examination schedule for all diploma courses has been published. Check your exam dates and prepare accordingly.',
      timestamp: '2 hours ago',
      read: false,
      priority: 'high',
      category: 'Academic'
    },
    {
      id: 2,
      type: 'admission',
      title: 'New Admission Notifications Available',
      message: 'Latest admission notifications for various diploma courses are now available. Apply before the deadline.',
      timestamp: '4 hours ago',
      read: false,
      priority: 'medium',
      category: 'Admission'
    },
    {
      id: 3,
      type: 'general',
      title: 'JEHUB Community Update',
      message: 'New features added to the platform. Explore the updated interface and enhanced functionality.',
      timestamp: '1 day ago',
      read: true,
      priority: 'low',
      category: 'Platform'
    },
    {
      id: 4,
      type: 'result',
      title: 'Semester Results Declared',
      message: 'Results for the recent semester examinations have been declared. Check your results now.',
      timestamp: '2 days ago',
      read: true,
      priority: 'high',
      category: 'Results'
    },
    {
      id: 5,
      type: 'counselling',
      title: 'Counselling Session Schedule Updated',
      message: 'The counselling schedule has been updated. New dates and venues have been added.',
      timestamp: '3 days ago',
      read: false,
      priority: 'medium',
      category: 'Counselling'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'exam': return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'admission': return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'result': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'counselling': return <Info className="h-5 w-5 text-purple-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
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

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = selectedFilter === 'all' || notification.type === selectedFilter;
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Stay updated with the latest announcements and important information</p>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-8 w-8 bg-blue-100 text-blue-600 p-2 rounded-full" />
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
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
                <option value="all">All Notifications</option>
                <option value="exam">Exam Updates</option>
                <option value="admission">Admissions</option>
                <option value="result">Results</option>
                <option value="counselling">Counselling</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-red-600 mb-1">{notifications.filter(n => !n.read).length}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-orange-600 mb-1">{notifications.filter(n => n.priority === 'high').length}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600 mb-1">{notifications.filter(n => n.read).length}</div>
              <div className="text-sm text-gray-600">Read</div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border-l-4 ${getPriorityColor(notification.priority)} shadow-sm hover:shadow-md transition-shadow duration-200 p-6 ${
                  !notification.read ? 'ring-2 ring-blue-100' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-lg font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{notification.timestamp}</span>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {notification.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            {notification.read ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

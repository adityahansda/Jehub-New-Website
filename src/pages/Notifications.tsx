import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Calendar, AlertCircle, CheckCircle, Info, X, Clock, Filter, Search, Bookmark, BookmarkCheck } from 'lucide-react';

interface Notification {
  $id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  priority: string;
  isActive: boolean;
  targetAudience: string;
  expiryDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const Notifications = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?type=${selectedFilter}`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      } else {
        console.error('Error fetching notifications:', data.error);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  }, [selectedFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle search query changes with debouncing effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchNotifications();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchNotifications]);

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
              <div className="text-2xl font-bold text-green-600 mb-1">{notifications.filter(n => n.isActive).length}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-orange-600 mb-1">{notifications.filter(n => n.priority === 'high').length}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">{notifications.filter(n => n.priority === 'medium').length}</div>
              <div className="text-sm text-gray-600">Medium Priority</div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.$id}
                className={`bg-white rounded-lg border-l-4 ${getPriorityColor(notification.priority)} shadow-sm hover:shadow-md transition-shadow duration-200 p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-lg font-semibold text-gray-900`}>
                          {notification.title}
                        </h3>
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
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {notification.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notification.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Notifications;

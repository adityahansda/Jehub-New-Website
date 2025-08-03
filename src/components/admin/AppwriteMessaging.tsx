import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Bell, Send, Users, Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { messagingService } from '../../services/messagingService';
import { databases } from '../../lib/appwrite';
import { appwriteConfig } from '../../lib/appwriteConfig';
import { Query } from 'appwrite';

interface MessageStats {
  totalUsers: number;
  emailsSent: number;
  smssSent: number;
  pushNotificationsSent: number;
}

const AppwriteMessaging = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'sms' | 'push'>('email');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [stats, setStats] = useState<MessageStats>({
    totalUsers: 0,
    emailsSent: 0,
    smssSent: 0,
    pushNotificationsSent: 0
  });

  // Email form state
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
    html: true,
    scheduledAt: ''
  });

  // SMS form state
  const [smsForm, setSmsForm] = useState({
    content: '',
    scheduledAt: ''
  });

  // Push notification form state
  const [pushForm, setPushForm] = useState({
    title: '',
    body: '',
    scheduledAt: ''
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const users = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        [Query.limit(1000)]
      );
      
      setStats(prev => ({
        ...prev,
        totalUsers: users.total
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.content) {
      setStatusMessage('Subject and content are required for email');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      await messagingService.sendEmail({
        subject: emailForm.subject,
        content: emailForm.content,
        html: emailForm.html,
        scheduledAt: emailForm.scheduledAt || undefined
      });

      setStatusMessage('Email message sent successfully!');
      setMessageType('success');
      setStats(prev => ({ ...prev, emailsSent: prev.emailsSent + 1 }));
      
      // Reset form
      setEmailForm({
        subject: '',
        content: '',
        html: true,
        scheduledAt: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setStatusMessage('Failed to send email. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!smsForm.content) {
      setStatusMessage('Content is required for SMS');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      await messagingService.sendSMS({
        content: smsForm.content,
        scheduledAt: smsForm.scheduledAt || undefined
      });

      setStatusMessage('SMS message sent successfully!');
      setMessageType('success');
      setStats(prev => ({ ...prev, smssSent: prev.smssSent + 1 }));
      
      // Reset form
      setSmsForm({
        content: '',
        scheduledAt: ''
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      setStatusMessage('Failed to send SMS. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPush = async () => {
    if (!pushForm.title || !pushForm.body) {
      setStatusMessage('Title and body are required for push notification');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      await messagingService.sendPushNotification({
        title: pushForm.title,
        body: pushForm.body,
        scheduledAt: pushForm.scheduledAt || undefined
      });

      setStatusMessage('Push notification sent successfully!');
      setMessageType('success');
      setStats(prev => ({ ...prev, pushNotificationsSent: prev.pushNotificationsSent + 1 }));
      
      // Reset form
      setPushForm({
        title: '',
        body: '',
        scheduledAt: ''
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
      setStatusMessage('Failed to send push notification. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const clearStatusMessage = () => {
    setStatusMessage('');
    setMessageType('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appwrite Messaging</h2>
        <p className="text-gray-600 dark:text-gray-400">Send emails, SMS, and push notifications to users</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.emailsSent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SMS Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.smssSent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Push Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pushNotificationsSent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`p-4 rounded-lg flex items-center justify-between ${
          messageType === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center">
            {messageType === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            )}
            <span className={messageType === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
              {statusMessage}
            </span>
          </div>
          <button
            onClick={clearStatusMessage}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Messaging Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'email', label: 'Email', icon: Mail },
              { key: 'sms', label: 'SMS', icon: MessageSquare },
              { key: 'push', label: 'Push Notifications', icon: Bell }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={emailForm.content}
                  onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter email content (HTML supported)"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailForm.html}
                    onChange={(e) => setEmailForm({ ...emailForm, html: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">HTML Content</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={emailForm.scheduledAt}
                  onChange={(e) => setEmailForm({ ...emailForm, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <button
                onClick={handleSendEmail}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{loading ? 'Sending...' : 'Send Email'}</span>
              </button>
            </div>
          )}

          {/* SMS Tab */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Content
                </label>
                <textarea
                  value={smsForm.content}
                  onChange={(e) => setSmsForm({ ...smsForm, content: e.target.value })}
                  rows={4}
                  maxLength={160}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter SMS content (max 160 characters)"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {smsForm.content.length}/160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={smsForm.scheduledAt}
                  onChange={(e) => setSmsForm({ ...smsForm, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <button
                onClick={handleSendSMS}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{loading ? 'Sending...' : 'Send SMS'}</span>
              </button>
            </div>
          )}

          {/* Push Notifications Tab */}
          {activeTab === 'push' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={pushForm.title}
                  onChange={(e) => setPushForm({ ...pushForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Body
                </label>
                <textarea
                  value={pushForm.body}
                  onChange={(e) => setPushForm({ ...pushForm, body: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter notification body"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={pushForm.scheduledAt}
                  onChange={(e) => setPushForm({ ...pushForm, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <button
                onClick={handleSendPush}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{loading ? 'Sending...' : 'Send Push Notification'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppwriteMessaging;

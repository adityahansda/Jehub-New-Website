import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Send, Users, Calendar } from 'lucide-react';

interface BroadcastSectionProps {
  userRole: string;
}

const BroadcastSection: React.FC<BroadcastSectionProps> = ({ userRole }) => {
  const [broadcastType, setBroadcastType] = useState('email');
  const [message, setMessage] = useState({
    subject: '',
    content: '',
    recipients: 'all'
  });

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      type: 'email',
      subject: 'Welcome to New Semester',
      content: 'We hope you have a great new semester!',
      sentDate: '2025-01-15',
      recipients: 'all',
      status: 'sent'
    }
  ]);

  const handleSendBroadcast = () => {
    if (!message.subject || !message.content) {
      alert('Please fill in both subject and content!');
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      type: broadcastType,
      subject: message.subject,
      content: message.content,
      sentDate: new Date().toISOString().split('T')[0],
      recipients: message.recipients,
      status: 'sent'
    };
    
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setMessage({ subject: '', content: '', recipients: 'all' });
    alert(`Broadcast sent successfully to ${message.recipients}!`);
    console.log('Broadcasting:', newAnnouncement);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Broadcast Center</h2>
        <p className="text-gray-600">Send announcements and notifications to users</p>
      </div>

      {/* Create Broadcast */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Broadcast</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Broadcast Type</label>
            <select
              value={broadcastType}
              onChange={(e) => setBroadcastType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="email">Email Announcement</option>
              <option value="dashboard">Dashboard Notification</option>
              <option value="telegram">Telegram Bot Post</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <select
              value={message.recipients}
              onChange={(e) => setMessage(prev => ({ ...prev, recipients: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="team">Team Members Only</option>
              <option value="students">Students Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={message.subject}
              onChange={(e) => setMessage(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter announcement subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
            <textarea
              value={message.content}
              onChange={(e) => setMessage(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your announcement message..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSendBroadcast}
            disabled={!message.subject || !message.content}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send Broadcast
          </button>
        </div>
      </div>

      {/* Broadcast History */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Broadcast History</h3>
        
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {announcement.type === 'email' && <Mail className="h-5 w-5 text-blue-600" />}
                    {announcement.type === 'dashboard' && <Bell className="h-5 w-5 text-blue-600" />}
                    {announcement.type === 'telegram' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{announcement.subject}</h4>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {announcement.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {announcement.sentDate}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {announcement.recipients}
                      </span>
                      <span className="capitalize">{announcement.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BroadcastSection;

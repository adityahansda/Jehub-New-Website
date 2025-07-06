import React, { useState } from 'react';
import { MessageSquare, Bell, ExternalLink, Lightbulb, Plus, Send } from 'lucide-react';

interface CommunityEngagementProps {
  isOverview?: boolean;
}

const CommunityEngagement: React.FC<CommunityEngagementProps> = ({ isOverview = false }) => {
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [ideaText, setIdeaText] = useState('');

  const announcements = [
    {
      id: 1,
      title: 'New Notes Upload System',
      content: 'We have updated our notes upload system with better file organization.',
      date: '2024-07-05',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Weekly Team Meeting',
      content: 'Join us this Friday at 3 PM for our weekly sync meeting.',
      date: '2024-07-04',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Community Guidelines Update',
      content: 'Please review the updated community guidelines in our resources section.',
      date: '2024-07-03',
      priority: 'low'
    }
  ];

  const ideas = [
    {
      id: 1,
      title: 'Mobile App Development',
      description: 'Create a mobile app for easier access to notes on the go.',
      submittedBy: 'You',
      date: '2024-07-01',
      status: 'under-review'
    },
    {
      id: 2,
      title: 'Dark Mode Theme',
      description: 'Add a dark mode option for better user experience during night study sessions.',
      submittedBy: 'Alex Chen',
      date: '2024-06-28',
      status: 'approved'
    }
  ];

  const handleSubmitIdea = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting idea:', ideaText);
    setIdeaText('');
    setShowIdeaForm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayAnnouncements = isOverview ? announcements.slice(0, 2) : announcements;

  return (
    <div className="space-y-6">
      {!isOverview && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Engagement</h2>
          <p className="text-gray-600">Stay connected with announcements and share your ideas</p>
        </div>
      )}

      {/* Announcements */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {isOverview ? 'Latest Announcements' : 'Announcements & Updates'}
          </h3>
        </div>
        
        <div className="space-y-4">
          {displayAnnouncements.map((announcement) => (
            <div key={announcement.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(announcement.priority)}`}>
                  {announcement.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
              <p className="text-xs text-gray-500">{announcement.date}</p>
            </div>
          ))}
        </div>

        {isOverview && (
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Announcements
            </button>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ExternalLink className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="#"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Telegram Group</h4>
              <p className="text-sm text-gray-600">Join our community chat</p>
            </div>
          </a>
          
          <a
            href="#"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Discord Server</h4>
              <p className="text-sm text-gray-600">Connect with team members</p>
            </div>
          </a>
        </div>
      </div>

      {!isOverview && (
        <>
          {/* Suggest Ideas */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">Suggest New Ideas</h3>
              </div>
              <button
                onClick={() => setShowIdeaForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Idea
              </button>
            </div>

            {showIdeaForm && (
              <form onSubmit={handleSubmitIdea} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <textarea
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  placeholder="Share your idea to improve JEHUB..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Idea
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIdeaForm(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {ideas.map((idea) => (
                <div key={idea.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{idea.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(idea.status)}`}>
                      {idea.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{idea.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Submitted by: {idea.submittedBy}</span>
                    <span>{idea.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CommunityEngagement;

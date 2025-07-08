import React, { useState } from 'react';
import { Plus, Heart, MessageCircle, Share2, Flag, Clock } from 'lucide-react';
import { mockCommunityPosts } from '../data/mockData';
import Image from 'next/image'
const Community = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'latest' | 'answered'>('trending');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'text' as 'text' | 'poll' | 'link' | 'file'
  });

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle post submission
    console.log('New post:', newPost);
    setShowNewPost(false);
    setNewPost({ content: '', type: 'text' });
  };

  const handleLike = (postId: string) => {
    // Handle like
    console.log('Liked post:', postId);
  };

  const handleReport = (postId: string) => {
    // Handle report
    console.log('Reported post:', postId);
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'poll': return '📊';
      case 'link': return '🔗';
      case 'file': return '📎';
      default: return '💬';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Community
          </h1>
          <p className="text-xl text-gray-600">
            Connect, share, and learn together with fellow students
          </p>
        </div>

        {/* New Post Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowNewPost(true)}
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Post
          </button>
        </div>

        {/* New Post Modal */}
        {showNewPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Create New Post
                </h2>
                <form onSubmit={handleSubmitPost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Type
                    </label>
                    <select
                      value={newPost.type}
                      onChange={(e) => setNewPost({ ...newPost, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="text">Text Post</option>
                      <option value="poll">Poll</option>
                      <option value="link">Link</option>
                      <option value="file">File Share</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Share your thoughts, ask questions, or start a discussion..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowNewPost(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      Post
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { key: 'trending', label: 'Trending' },
            { key: 'latest', label: 'Latest' },
            { key: 'answered', label: 'Most Answered' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {mockCommunityPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.avatar}
                      alt={post.user}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.user}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{post.timestamp}</span>
                        <span className="text-lg">{getPostTypeIcon(post.type)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleReport(post.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{post.content}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Heart className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors">
                      <Share2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {post.type === 'poll' && 'Poll'}
                    {post.type === 'link' && 'Link'}
                    {post.type === 'file' && 'File'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community Guidelines */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Community Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="mb-2">✅ Be respectful and kind to other members</p>
              <p className="mb-2">✅ Share relevant academic content</p>
              <p className="mb-2">✅ Help others and ask for help when needed</p>
            </div>
            <div>
              <p className="mb-2">❌ No spam or self-promotion</p>
              <p className="mb-2">❌ No inappropriate or offensive content</p>
              <p className="mb-2">❌ No sharing of copyrighted materials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
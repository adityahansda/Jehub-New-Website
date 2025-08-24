import React, { useState } from 'react';
import Image from 'next/image';
import { Trophy, Star, Medal, Crown } from 'lucide-react';
import { mockLeaderboard } from '../data/mockData';
import PageHeader from '../components/PageHeader';
const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Scholar': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'Expert': return <Trophy className="h-5 w-5 text-orange-500" />;
      case 'Advanced': return <Medal className="h-5 w-5 text-purple-500" />;
      default: return <Star className="h-5 w-5 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Scholar': return 'bg-gradient-to-r from-yellow-400 to-orange-400';
      case 'Expert': return 'bg-gradient-to-r from-orange-400 to-red-400';
      case 'Advanced': return 'bg-gradient-to-r from-purple-400 to-pink-400';
      default: return 'bg-gradient-to-r from-blue-400 to-teal-400';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Leaderboard" 
        icon={Trophy}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      
      <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-xl text-gray-600">
              Top contributors ranked by their platform contributions
            </p>
          </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { key: 'all', label: 'All Time' },
            { key: 'monthly', label: 'Monthly' },
            { key: 'weekly', label: 'Weekly' }
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

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {mockLeaderboard.slice(0, 3).map((user, index) => (
            <div
              key={user.id}
              className={`${index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'
                } bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center relative overflow-hidden`}
            >
              <div className={`absolute inset-0 ${getLevelColor(user.level)} opacity-10`}></div>
              <div className="relative">
                <div className="text-4xl mb-2">{getRankBadge(user.rank)}</div>
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{user.college}</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  {getLevelIcon(user.level)}
                  <span className="text-sm font-medium text-gray-700">{user.level}</span>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold">
                  {user.points.toLocaleString()} pts
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white text-center">
              Top Contributors
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {mockLeaderboard.map((user, index) => (
              <div
                key={user.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-gradient-to-r from-blue-50 to-purple-50' : ''
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <div className="flex items-center gap-4 ">
                    <div className="text-2xl font-bold text-gray-400 min-w-[3rem]">
                      {getRankBadge(user.rank)}
                    </div>
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.college}</p>
                    </div>
                  </div>
                  <div className="flex justify-between gap-4">
                    <div className="flex items-center gap-1">
                      {getLevelIcon(user.level)}
                      <span className="text-sm font-medium text-gray-700">{user.level}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {user.points.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Point System Info */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-blue-600" />
            How Points Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Upload Notes</span>
                <span className="font-semibold text-blue-600">+50 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Fulfill Request</span>
                <span className="font-semibold text-blue-600">+30 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Platform Post</span>
                <span className="font-semibold text-blue-600">+10 pts</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Get Upvoted</span>
                <span className="font-semibold text-blue-600">+5 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Write Blog</span>
                <span className="font-semibold text-blue-600">+25 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Daily Login</span>
                <span className="font-semibold text-blue-600">+2 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Leaderboard;
import React, { useState } from 'react';
import { Trophy, Star, Medal, Filter, Users } from 'lucide-react';

interface TeamLeaderboardProps {
  currentUser: any;
}

const TeamLeaderboard: React.FC<TeamLeaderboardProps> = ({ currentUser }) => {
  const [filter, setFilter] = useState('all');
  const [timeframe, setTimeframe] = useState('monthly');

  const leaderboardData = [
    { id: 1, name: 'Alex Chen', department: 'Development', xp: 3200, rank: 1, avatar: 'AC', weeklyXP: 450 },
    { id: 2, name: 'Sarah Johnson', department: 'Content', xp: 2450, rank: 2, avatar: 'SJ', weeklyXP: 380 },
    { id: 3, name: 'Mike Wilson', department: 'Design', xp: 2100, rank: 3, avatar: 'MW', weeklyXP: 320 },
    { id: 4, name: 'Emily Davis', department: 'Content', xp: 1950, rank: 4, avatar: 'ED', weeklyXP: 290 },
    { id: 5, name: 'John Smith', department: 'Development', xp: 1800, rank: 5, avatar: 'JS', weeklyXP: 260 },
    { id: 6, name: 'Lisa Brown', department: 'Social Media', xp: 1650, rank: 6, avatar: 'LB', weeklyXP: 240 },
  ];

  const topContributors = {
    weekly: leaderboardData.slice(0, 3).sort((a, b) => b.weeklyXP - a.weeklyXP),
    monthly: leaderboardData.slice(0, 3)
  };

  const filteredData = filter === 'all' 
    ? leaderboardData 
    : leaderboardData.filter(user => user.department === filter);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const departments = ['Development', 'Content', 'Design', 'Social Media'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Team Leaderboard</h2>
        <p className="text-gray-600">See how you rank among your teammates</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="all-time">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Top Contributors - {timeframe === 'weekly' ? 'This Week' : 'This Month'}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topContributors[timeframe as keyof typeof topContributors].map((user, index) => (
            <div key={user.id} className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-center mb-2">
                {getRankBadge(index + 1)}
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                {user.avatar}
              </div>
              <h4 className="font-semibold text-gray-900">{user.name}</h4>
              <p className="text-sm text-gray-600">{user.department}</p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                {timeframe === 'weekly' ? user.weeklyXP : user.xp} XP
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Leaderboard</h3>
        
        <div className="space-y-3">
          {filteredData.map((user) => (
            <div 
              key={user.id} 
              className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                user.id === currentUser.id 
                  ? 'bg-blue-50 border-blue-200 shadow-md' 
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center w-12">
                {getRankBadge(user.rank)}
              </div>
              
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.avatar}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">{user.name}</h4>
                  {user.id === currentUser.id && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">You</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{user.department}</p>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{user.xp} XP</p>
                <p className="text-sm text-gray-600">+{user.weeklyXP} this week</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Performance */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-6 w-6" />
              <h3 className="text-xl font-bold">Your Performance</h3>
            </div>
            <p className="text-blue-100">Keep up the great work!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">#{currentUser.rank}</div>
            <div className="text-blue-100">Current Rank</div>
            <div className="text-lg font-semibold mt-2">{currentUser.xp} XP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamLeaderboard;

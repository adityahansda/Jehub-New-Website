import React, { useState } from 'react';
import { Trophy, Star, Plus, Minus, RotateCcw, TrendingUp } from 'lucide-react';

interface LeaderboardControlProps {
  userRole: string;
}

const LeaderboardControl: React.FC<LeaderboardControlProps> = ({ userRole }) => {
  const [leaderboardData, setLeaderboardData] = useState([
    { id: 1, name: 'Sarah Johnson', points: 2450, weeklyPoints: 150, monthlyPoints: 620 },
    { id: 2, name: 'Mike Chen', points: 1980, weeklyPoints: 120, monthlyPoints: 480 },
    { id: 3, name: 'Emily Davis', points: 1750, weeklyPoints: 90, monthlyPoints: 350 },
  ]);

  const handleModifyPoints = (userId: number, change: number) => {
    setLeaderboardData(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, points: Math.max(0, user.points + change) }
          : user
      )
    );
  };

  const handleResetWeekly = () => {
    setLeaderboardData(prev => 
      prev.map(user => ({ ...user, weeklyPoints: 0 }))
    );
  };

  const handleResetMonthly = () => {
    setLeaderboardData(prev => 
      prev.map(user => ({ ...user, monthlyPoints: 0 }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leaderboard Control</h2>
          <p className="text-gray-600">Manage XP points and leaderboard stats</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleResetWeekly}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Reset Weekly
          </button>
          <button 
            onClick={handleResetMonthly}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Reset Monthly
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Leaderboard</h3>
        <div className="space-y-4">
          {leaderboardData.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{user.name}</h4>
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>Total: {user.points}</span>
                    <span>Weekly: {user.weeklyPoints}</span>
                    <span>Monthly: {user.monthlyPoints}</span>
                  </div>
                </div>
              </div>
              {userRole === 'admin' && (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleModifyPoints(user.id, 50)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Add 50 points"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleModifyPoints(user.id, -50)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove 50 points"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardControl;

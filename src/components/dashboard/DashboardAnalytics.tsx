import React from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Activity,
  Users,
  BookOpen,
  Download,
  Upload,
  Eye,
  Heart,
  Star
} from 'lucide-react';
import { UserProfile } from '../../services/userService';

interface AnalyticsData {
  weeklyProgress: {
    week: string;
    uploads: number;
    downloads: number;
  }[];
  monthlyStats: {
    notesUploaded: number;
    downloadsReceived: number;
    profileViews: number;
  };
  performanceMetrics: {
    avgDownloadsPerNote: number;
    avgLikesPerNote: number;
    totalInteractions: number;
    rankingChange: number;
  };
}

interface DashboardAnalyticsProps {
  user?: any;
  userProfile?: UserProfile;
  userStats?: any;
}

export default function DashboardAnalytics({ user, userProfile, userStats }: DashboardAnalyticsProps) {
  // Generate mock weekly progress based on user stats or use default
  const weeklyProgress = [
    { 
      week: 'Week 1', 
      uploads: Math.floor((userStats?.current?.notesUploaded || 0) * 0.2), 
      downloads: Math.floor((userStats?.current?.notesDownloaded || 0) * 0.15)
    },
    { 
      week: 'Week 2', 
      uploads: Math.floor((userStats?.current?.notesUploaded || 0) * 0.3), 
      downloads: Math.floor((userStats?.current?.notesDownloaded || 0) * 0.25)
    },
    { 
      week: 'Week 3', 
      uploads: Math.floor((userStats?.current?.notesUploaded || 0) * 0.2), 
      downloads: Math.floor((userStats?.current?.notesDownloaded || 0) * 0.3)
    },
    { 
      week: 'Week 4', 
      uploads: Math.floor((userStats?.current?.notesUploaded || 0) * 0.3), 
      downloads: Math.floor((userStats?.current?.notesDownloaded || 0) * 0.3)
    }
  ];

  const monthlyStats = {
    notesUploaded: userStats?.current?.notesUploaded || 0,
    downloadsReceived: userStats?.current?.notesDownloaded || 0,
    profileViews: Math.floor((userStats?.current?.points || 0) * 0.8) // Estimated based on points
  };

  const performanceMetrics = {
    avgDownloadsPerNote: monthlyStats.notesUploaded > 0 ? Number((monthlyStats.downloadsReceived / monthlyStats.notesUploaded).toFixed(1)) : 0,
    avgLikesPerNote: monthlyStats.notesUploaded > 0 ? Number(((monthlyStats.downloadsReceived * 0.3) / monthlyStats.notesUploaded).toFixed(1)) : 0,
    totalInteractions: monthlyStats.downloadsReceived + Math.floor(monthlyStats.downloadsReceived * 0.5),
    rankingChange: userStats?.changes?.rankChange || 0
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
            <p className="text-gray-600 dark:text-gray-400">Track your academic contribution performance</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 text-sm font-medium">
              This Month
            </button>
            <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm font-medium">
              Last 3 Months
            </button>
          </div>
        </div>

        {/* Monthly Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Notes Uploaded</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{monthlyStats.notesUploaded}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% from last month
                </p>
              </div>
              <div className="bg-blue-500 p-2 rounded-lg">
                <Upload className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Downloads Received</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{monthlyStats.downloadsReceived}</p>
                <p className="text-xs text-green-700 dark:text-green-300 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +23% from last month
                </p>
              </div>
              <div className="bg-green-500 p-2 rounded-lg">
                <Download className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>


          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Profile Views</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{monthlyStats.profileViews}</p>
                <p className="text-xs text-orange-700 dark:text-orange-300 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="bg-orange-500 p-2 rounded-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Progress</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Uploads</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Downloads</span>
            </div>
          </div>
        </div>

        {/* Simple Bar Chart Visualization */}
        <div className="space-y-4">
          {weeklyProgress.map((week, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{week.week}</span>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{week.uploads} uploads</span>
                  <span>{week.downloads} downloads</span>
                </div>
              </div>
              <div className="flex space-x-2">
                {/* Uploads Bar */}
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(week.uploads / 10) * 100}%` }}
                  ></div>
                </div>
                {/* Downloads Bar */}
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(week.downloads / 40) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Avg Downloads/Note</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">How popular your notes are</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{performanceMetrics.avgDownloadsPerNote}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Avg Likes/Note</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Community appreciation</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{performanceMetrics.avgLikesPerNote}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Total Interactions</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Overall engagement</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{performanceMetrics.totalInteractions}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ranking Progress</h3>
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">#15</span>
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Current Rank</h4>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Rank change:</span>
              <div className="flex items-center space-x-1">
                {performanceMetrics.rankingChange > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 font-medium">+{performanceMetrics.rankingChange}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-red-500 font-medium">{performanceMetrics.rankingChange}</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">75% to next rank</p>
          </div>
        </div>
      </div>
    </div>
  );
}

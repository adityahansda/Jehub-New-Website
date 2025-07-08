import React from 'react';
import { CheckCircle, Clock, Star, TrendingUp, Calendar, Award } from 'lucide-react';

interface PerformanceMetricsProps {
  user: any;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ user }) => {
  const metrics = [
    {
      title: 'Tasks Completed',
      value: '24',
      icon: CheckCircle,
      color: 'green',
      change: '+8 this week'
    },
    {
      title: 'Pending Tasks',
      value: '3',
      icon: Clock,
      color: 'orange',
      change: '-2 from last week'
    },
    {
      title: 'Time Logged',
      value: '32.5h',
      icon: Calendar,
      color: 'blue',
      change: 'This week'
    },
    {
      title: 'Skill Endorsements',
      value: '15',
      icon: Star,
      color: 'purple',
      change: '+3 new endorsements'
    }
  ];

  const attendanceData = [
    { day: 'Mon', status: 'present' },
    { day: 'Tue', status: 'present' },
    { day: 'Wed', status: 'present' },
    { day: 'Thu', status: 'absent' },
    { day: 'Fri', status: 'present' },
    { day: 'Sat', status: 'present' },
    { day: 'Sun', status: 'off' },
  ];

  const contributionData = [
    { week: 'Week 1', contributions: 12 },
    { week: 'Week 2', contributions: 18 },
    { week: 'Week 3', contributions: 15 },
    { week: 'Week 4', contributions: 22 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'off': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const maxContributions = Math.max(...contributionData.map(d => d.contributions));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Metrics</h2>
        <p className="text-gray-600">Your weekly performance overview</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                  <Icon className={`h-6 w-6 text-${metric.color}-600`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{metric.title}</p>
                <p className="text-xs text-gray-500 mt-1">{metric.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Calendar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {attendanceData.map((day, index) => (
              <div key={index} className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-2">{day.day}</p>
                <div className={`w-8 h-8 rounded-full ${getStatusColor(day.status)} mx-auto`}></div>
                <p className="text-xs text-gray-500 mt-1 capitalize">{day.status}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Present</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Absent</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-gray-600">Off Day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Graph */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Contributions</h3>
          </div>
          <div className="space-y-4">
            {contributionData.map((data, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600 w-16">{data.week}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(data.contributions / maxContributions) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{data.contributions}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rank and XP Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-6 w-6" />
              <h3 className="text-xl font-bold">Your Rank</h3>
            </div>
            <p className="text-blue-100">You&apos;re performing great this month!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">#{user.rank}</div>
            <div className="text-blue-100">Leaderboard Position</div>
            <div className="text-lg font-semibold mt-2">{user.xp} XP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;

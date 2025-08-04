import React, { useState } from 'react';
import Image from 'next/image';
import { Users, Trophy, Star, Medal, Award, Crown, Target, TrendingUp, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { getActiveTeamSortedByXP, getOldTeamSortedByXP } from '../data/teamData';

const Team = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'present' | 'past'>('present');
  
  const presentTeam = getActiveTeamSortedByXP();
  const pastTeam = getOldTeamSortedByXP();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-orange-500" />;
      default: return <Trophy className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'Development Team': return 'bg-blue-100 text-blue-800';
      case 'Academic Team': return 'bg-green-100 text-green-800';
      case 'Communication Team': return 'bg-purple-100 text-purple-800';
      case 'Marketing Team': return 'bg-orange-100 text-orange-800';
      case 'Support Team': return 'bg-pink-100 text-pink-800';
      case 'Community Team': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTeamMember = (member: any, index: number) => {
    const rank = index + 1;
    return (
      <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(rank)} shadow-lg`}>
              {rank <= 3 ? getRankIcon(rank) : <span className="font-bold text-lg">#{rank}</span>}
            </div>
          </div>
          
          {/* Avatar */}
          <div className="flex-shrink-0 relative">
            <Image
              src={member.image}
              alt={member.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full border-4 border-gray-200 shadow-md group-hover:border-blue-300 transition-all duration-300"
            />
            {activeTab === 'present' && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {member.name}
                </h3>
                <p className="text-sm text-blue-600 font-medium mb-1">{member.role}</p>
                <p className="text-xs text-gray-500 mb-2">{member.education}</p>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(member.department)}`}>
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                  {member.department}
                </div>
              </div>
              
              {/* XP Display */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600 font-bold">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-lg">{member.xp}</span>
                </div>
                <p className="text-xs text-gray-500">XP Points</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Member Bio */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to About
          </button>
          
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Users className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Team Leaderboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our amazing team members ranked by their contribution and experience points
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <button
              onClick={() => setActiveTab('present')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'present'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Present Team ({presentTeam.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'past'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Past Team ({pastTeam.length})
              </div>
            </button>
          </div>
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTab === 'present' ? presentTeam.length : pastTeam.length}
                </p>
                <p className="text-sm text-gray-600">
                  {activeTab === 'present' ? 'Active Members' : 'Former Members'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTab === 'present' 
                    ? presentTeam.reduce((sum, member) => sum + member.xp, 0).toLocaleString()
                    : pastTeam.reduce((sum, member) => sum + member.xp, 0).toLocaleString()
                  }
                </p>
                <p className="text-sm text-gray-600">Total XP</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTab === 'present' 
                    ? Math.round(presentTeam.reduce((sum, member) => sum + member.xp, 0) / presentTeam.length)
                    : Math.round(pastTeam.reduce((sum, member) => sum + member.xp, 0) / pastTeam.length)
                  }
                </p>
                <p className="text-sm text-gray-600">Average XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="space-y-4">
          {activeTab === 'present' ? (
            <>
              {presentTeam.length > 0 ? (
                presentTeam.map((member, index) => renderTeamMember(member, index))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No active team members found.</p>
                </div>
              )}
            </>
          ) : (
            <>
              {pastTeam.length > 0 ? (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                    <div className="text-center">
                      <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Honoring Our Former Contributors
                      </h3>
                      <p className="text-gray-600">
                        These dedicated individuals helped build JEHUB into what it is today.
                      </p>
                    </div>
                  </div>
                  {pastTeam.map((member, index) => renderTeamMember(member, index))}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No past team members found.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Want to Join Our Team?
            </h3>
            <p className="text-gray-600 mb-6">
              Be part of our mission to help JUT students succeed
            </p>
            <button
              onClick={() => router.push('/join-team')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Join Team
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;

import React, { useState } from 'react';
import Image from 'next/image';
import { Users, Trophy, Star, Medal, Award, Crown, Target, TrendingUp, ChevronRight, ArrowLeft, MapPin, GraduationCap, Briefcase, Sparkles, UserCheck, UserX, Zap, Rocket, Eye, Globe, Github, Linkedin, Twitter, ExternalLink, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { getActiveTeamSortedByXP, getOldTeamSortedByXP } from '../data/teamData';

// Custom styles for special animations
const customStyles = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes spin-reverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
  
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
  
  .animate-spin-reverse {
    animation: spin-reverse 6s linear infinite;
  }
  
  .border-gold {
    border-color: #ffd700;
  }
  
  .border-3 {
    border-width: 3px;
  }
  
  .border-4 {
    border-width: 4px;
  }
`;

const Team = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'present' | 'past'>('present');
  
  const presentTeam = getActiveTeamSortedByXP();
  const pastTeam = getOldTeamSortedByXP();

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative">
          <div className="w-14 h-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300">
            <Crown className="h-4 w-4 text-white mr-1" />
            <span className="text-white font-bold text-sm">1st</span>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
        </div>
      );
    }
    
    if (rank === 2) {
      return (
        <div className="w-14 h-8 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-300">
          <Medal className="h-4 w-4 text-white mr-1" />
          <span className="text-white font-bold text-sm">2nd</span>
        </div>
      );
    }
    
    if (rank === 3) {
      return (
        <div className="w-14 h-8 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-2 border-orange-300">
          <Award className="h-4 w-4 text-white mr-1" />
          <span className="text-white font-bold text-sm">3rd</span>
        </div>
      );
    }
    
    // For ranks 4-10, use a sleek numbered badge
    if (rank <= 10) {
      return (
        <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md border border-blue-400">
          <span className="text-white font-bold text-sm">#{rank}</span>
        </div>
      );
    }
    
    // For ranks beyond 10, use a simple clean badge
    return (
      <div className="w-12 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-md">
        <span className="text-white font-semibold text-xs">#{rank}</span>
      </div>
    );
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'Development Team': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Academic Team': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Communication Team': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Marketing Team': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Support Team': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Community Team': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Executive Team': return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-800 border-amber-200';
      case 'Partnership Team': return 'bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-800 border-teal-200';
      case 'Ambassador Program': return 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-800 border-rose-200';
      case 'Promotion - Core Team': return 'bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 text-purple-800 border-purple-300';
      case 'Founder & Leadership': return 'bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 text-cyan-900 border-cyan-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'Development Team': return <Briefcase className="h-3 w-3" />;
      case 'Executive Team': return <Crown className="h-3 w-3" />;
      case 'Partnership Team': return <Users className="h-3 w-3" />;
      case 'Communication Team': return <Target className="h-3 w-3" />;
      case 'Marketing Team': return <TrendingUp className="h-3 w-3" />;
      case 'Ambassador Program': return <Star className="h-3 w-3" />;
      default: return <Sparkles className="h-3 w-3" />;
    }
  };

  const renderPromotionCard = (member: any, index: number) => {
    const rank = index + 1;
    return (
      <div key={index} className="bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 rounded-3xl overflow-hidden shadow-2xl border-4 border-gold hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 group relative">
        {/* Royal Crown Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-8 h-8">
            <Crown className="w-full h-full text-white" />
          </div>
          <div className="absolute top-4 right-4 w-8 h-8">
            <Crown className="w-full h-full text-white" />
          </div>
          <div className="absolute bottom-4 left-4 w-8 h-8">
            <Crown className="w-full h-full text-white" />
          </div>
          <div className="absolute bottom-4 right-4 w-8 h-8">
            <Crown className="w-full h-full text-white" />
          </div>
        </div>

        {/* Promotion Banner */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white px-4 py-1 rounded-full shadow-lg border-2 border-yellow-300 animate-pulse">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-bold">PROMOTED!</span>
              <Zap className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Royal Rank Badge */}
        <div className="absolute top-16 left-4 z-10">
          <div className="w-16 h-10 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-xl border-3 border-yellow-300">
            <Crown className="h-5 w-5 text-white mr-1" />
            <span className="text-white font-bold text-sm">👑</span>
          </div>
        </div>
        
        {/* Royal Header Section */}
        <div className="relative px-6 pt-20 pb-6">
          {/* Avatar with Royal Ring */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full animate-spin-slow opacity-75"></div>
              <Image
                src={member.image}
                alt={member.name}
                width={100}
                height={100}
                className="w-24 h-24 rounded-full border-6 border-white shadow-2xl group-hover:scale-105 transition-transform duration-300 relative z-10"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-3 border-white flex items-center justify-center z-20">
                <Crown className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          {/* Name and Royal Title */}
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300">
              {member.name}
            </h3>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-3 border border-white/30">
              <p className="font-bold text-lg">{member.role}</p>
            </div>
            
            {/* Royal Department Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/30">
              <Crown className="h-4 w-4" />
              <span className="font-semibold">Core Team Promotion</span>
            </div>
          </div>
        </div>
        
        {/* Royal Content Section */}
        <div className="bg-white/95 backdrop-blur-sm p-6 m-4 rounded-2xl border border-purple-200">
          {/* Royal XP Display */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border-2 border-purple-300 rounded-full px-6 py-3 flex items-center gap-3">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-purple-800 font-bold text-xl">{member.xp}</span>
              <span className="text-purple-600 text-sm font-semibold">Royal XP</span>
            </div>
          </div>
          
          {/* Royal Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <GraduationCap className="h-5 w-5 mt-0.5 flex-shrink-0 text-purple-600" />
              <span className="leading-relaxed text-gray-700 font-medium">{member.education}</span>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <Briefcase className="h-5 w-5 mt-0.5 flex-shrink-0 text-purple-600" />
              <span className="leading-relaxed text-gray-700 font-medium">{member.specialization}</span>
            </div>
          </div>
          
          {/* Royal Bio */}
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl p-4 border border-purple-200">
            <p className="text-sm text-gray-800 leading-relaxed font-medium">{member.bio}</p>
          </div>
          
          {/* Celebration Elements */}
          <div className="flex justify-center mt-4 space-x-2">
            <span className="text-2xl animate-bounce">🎉</span>
            <span className="text-2xl animate-bounce" style={{animationDelay: '0.1s'}}>👑</span>
            <span className="text-2xl animate-bounce" style={{animationDelay: '0.2s'}}>🎊</span>
            <span className="text-2xl animate-bounce" style={{animationDelay: '0.3s'}}>⭐</span>
          </div>
        </div>
      </div>
    );
  };


  const renderTeamMember = (member: any, index: number) => {
    // Special royal card for promoted members
    if (member.promoted) {
      return renderPromotionCard(member, index);
    }

    const rank = index + 1;
    return (
      <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative">
        {/* Rank Badge */}
        <div className="absolute top-4 left-4 z-10">
          {getRankBadge(rank)}
        </div>

        {/* Status Badge */}
        {activeTab === 'present' && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Active
            </div>
          </div>
        )}
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-6 pt-16 pb-6">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Image
                src={member.image}
                alt={member.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
              {activeTab === 'present' && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                  <UserCheck className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>
          
          {/* Name and Role */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {member.name}
            </h3>
            <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
            
            {/* Department Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getDepartmentColor(member.department)}`}>
              {getDepartmentIcon(member.department)}
              {member.department}
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-6">
          {/* XP Display */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-4 py-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-800 font-bold text-lg">{member.xp}</span>
              <span className="text-green-600 text-sm font-medium">XP</span>
            </div>
          </div>
          
          {/* Education */}
          <div className="flex items-start gap-2 mb-4 text-sm text-gray-600">
            <GraduationCap className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{member.education}</span>
          </div>
          
          {/* Specialization */}
          <div className="flex items-start gap-2 mb-4 text-sm text-gray-600">
            <Briefcase className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{member.specialization}</span>
          </div>
          
          {/* Bio */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm text-gray-700 leading-relaxed">{member.bio}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
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
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Users className="h-8 w-8 text-white" />
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

        {/* Team Members Grid */}
        <div>
          {activeTab === 'present' ? (
            <>
              {presentTeam.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {presentTeam.map((member, index) => renderTeamMember(member, index))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No active team members found.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {pastTeam.length > 0 ? (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 mb-8 text-center">
                    <Award className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Honoring Our Former Contributors
                    </h3>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                      These dedicated individuals helped build JEHUB into what it is today. Their contributions continue to impact our community.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastTeam.map((member, index) => renderTeamMember(member, index))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No past team members found.</p>
                  </div>
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
    </>
  );
};

export default Team;

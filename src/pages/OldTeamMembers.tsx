import React from 'react';
import Image from 'next/image';
import { Users, Clock, Award, Star, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { oldTeamMembers } from '../data/teamData';

const OldTeamMembers = () => {
  const router = useRouter();

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'Development Team': return 'bg-blue-100 text-blue-800';
      case 'Academic Team': return 'bg-green-100 text-green-800';
      case 'Communication Team': return 'bg-purple-100 text-purple-800';
      case 'Marketing Team': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to About
          </button>
          
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full mb-6 shadow-lg">
            <Clock className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Old Team Members
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Honoring our former team members who contributed to JEHUB&apos;s growth and success
          </p>
          
          <div className="mt-8 inline-flex items-center gap-4 bg-white px-6 py-3 rounded-full shadow-md">
            <Users className="h-5 w-5 text-gray-600" />
            <span className="text-gray-700 font-medium">{oldTeamMembers.length} Former Members</span>
          </div>
        </div>

        {/* Old Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {oldTeamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="relative mb-4">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full mx-auto border-4 border-gray-300 shadow-md group-hover:border-gray-400 transition-all duration-300"
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                  {member.name}
                </h3>
                <p className="text-gray-600 font-medium mb-2">{member.role}</p>
                <p className="text-xs text-gray-500 mb-2">{member.education}</p>
                <p className="text-xs text-gray-600 font-medium mb-3">{member.specialization}</p>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.bio}</p>
                
                <div className="flex justify-center items-center gap-4 mb-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(member.department)}`}>
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                    {member.department}
                  </div>
                </div>
                
                <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    <span>XP: {member.xp}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Former Member</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Appreciation Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Thank You for Your Contributions
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We deeply appreciate the dedication and hard work of all our former team members. 
              Your contributions have been instrumental in building JEHUB into what it is today. 
              Though you may no longer be actively working with us, your impact continues to benefit 
              the entire JUT platform.
            </p>
          </div>
        </div>

        {/* Join Current Team CTA */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Want to Join Our Current Team?
            </h3>
            <p className="text-gray-600 mb-6">
              We&apos;re always looking for passionate students to join our mission
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

export default OldTeamMembers;

import React from 'react';
import { Users, MessageCircle, ArrowRight, School, UserPlus } from 'lucide-react';

const Groups = () => {
  const collegeGroups = [
    {
      id: 1,
      name: 'Government Polytechnic Ranchi',
      description: 'Connect with students from GPR and share resources, updates, and opportunities.',
      members: 450,
      category: 'Polytechnic',
      subjects: ['CSE', 'EE', 'ME', 'CE'],
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      name: 'Government Polytechnic Dhanbad',
      description: 'Join the GPD community for notes sharing, project collaboration, and peer support.',
      members: 320,
      category: 'Polytechnic', 
      subjects: ['CSE', 'Mining', 'EE', 'ME'],
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      name: 'GGSET Technical Campus',
      description: 'Collaborative space for GGSET students across all engineering branches.',
      members: 280,
      category: 'Technical Campus',
      subjects: ['CSE', 'ECE', 'ME', 'CE'],
      image: '/api/placeholder/300/200'
    },
    {
      id: 4,
      name: 'Government Polytechnic Bokaro',
      description: 'Connect, learn, and grow with fellow GPB students and alumni.',
      members: 190,
      category: 'Polytechnic',
      subjects: ['CSE', 'EE', 'Automobile'],
      image: '/api/placeholder/300/200'
    },
    {
      id: 5,
      name: 'Central University of Jharkhand',
      description: 'University-wide group for academic discussions and campus updates.',
      members: 150,
      category: 'University',
      subjects: ['CSE', 'Physics', 'Mathematics'],
      image: '/api/placeholder/300/200'
    },
    {
      id: 6,
      name: 'Ranchi Women\'s College',
      description: 'Empowering women in technology and computer applications.',
      members: 120,
      category: 'College',
      subjects: ['BCA', 'Computer Applications'],
      image: '/api/placeholder/300/200'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            College Groups
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join your college community on JEHUB. Connect with classmates, share resources, and stay updated with college-specific information.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
            <School className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-blue-600 mb-2">25+</div>
            <div className="text-gray-600">Colleges Connected</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 text-center">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-green-600 mb-2">1500+</div>
            <div className="text-gray-600">Active Members</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
            <MessageCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
            <div className="text-gray-600">Daily Discussions</div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {collegeGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <School className="h-16 w-16 text-white" />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {group.category}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    {group.members}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {group.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {group.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {group.subjects.map((subject, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Join Group
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Don't See Your College?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're constantly adding new college groups. If your college isn't listed, let us know and we'll help you start a community!
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 mx-auto">
            Request New Group
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Groups;

import React from 'react';
import { Shield, Users, MessageCircle, Heart, AlertCircle, CheckCircle, BookOpen, Star } from 'lucide-react';

const CommunityRules = () => {
  const rules = [
    {
      icon: Heart,
      title: 'Be Respectful',
      description: 'Treat all community members with respect and kindness. Personal attacks, harassment, or discriminatory behavior will not be tolerated.'
    },
    {
      icon: MessageCircle,
      title: 'Keep Discussions Relevant',
      description: 'Stay on topic and keep discussions relevant to academics, career development, and student life. Off-topic posts may be removed.'
    },
    {
      icon: BookOpen,
      title: 'Share Quality Content',
      description: 'Share helpful, accurate, and quality academic resources. Avoid spam, duplicate content, or misleading information.'
    },
    {
      icon: Users,
      title: 'Help Fellow Students',
      description: 'Support your peers by answering questions, sharing experiences, and providing constructive feedback when possible.'
    },
    {
      icon: Shield,
      title: 'Respect Privacy',
      description: 'Do not share personal information of others without consent. Protect your own privacy and that of fellow students.'
    },
    {
      icon: AlertCircle,
      title: 'Report Issues',
      description: 'If you encounter inappropriate behavior or content, report it to the moderators immediately.'
    }
  ];

  const guidelines = [
    'Use clear and descriptive titles for your posts',
    'Search before posting to avoid duplicates',
    'Give credit when sharing others\' work',
    'Use appropriate language and maintain professionalism',
    'Follow copyright laws when sharing resources',
    'Participate constructively in discussions'
  ];

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl -z-10 opacity-60"></div>
          <div className="relative z-10 py-16 px-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full mb-8 shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Rules</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Our community guidelines help create a safe, supportive, and productive environment for all students. 
              Please read and follow these rules to maintain a positive learning atmosphere.
            </p>
          </div>
        </div>

        {/* Rules Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Community Rules
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These rules ensure a respectful and productive environment for all members
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rules.map((rule, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <rule.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{rule.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guidelines Section */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 sm:p-12 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Additional Guidelines</h2>
              <p className="text-gray-600 text-lg">Follow these best practices to make the most of our community</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guidelines.map((guideline, index) => (
                <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{guideline}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions or Concerns?</h3>
          <p className="text-gray-600 mb-6">
            If you have questions about these rules or need to report an issue, please contact our moderators.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-full">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-semibold">Contact Moderators</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityRules;

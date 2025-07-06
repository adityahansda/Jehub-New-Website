import React from 'react';
import { BookOpen, Users, Target, Heart, Mail, Phone, MapPin } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Knowledge Sharing',
      description: 'We believe in the power of shared knowledge to transform education and create opportunities for all students.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Our platform is built around fostering meaningful connections between students, educators, and learners worldwide.'
    },
    {
      icon: Target,
      title: 'Academic Excellence',
      description: 'We are committed to providing high-quality resources that help students achieve their academic goals and dreams.'
    },
    {
      icon: Heart,
      title: 'Student Support',
      description: 'Every feature we build is designed with student success in mind, creating a supportive learning environment.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      bio: 'Former educator with 10+ years of experience in academic technology.',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'Full-stack developer passionate about building educational platforms.',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Community',
      bio: 'Community builder dedicated to creating inclusive learning environments.',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            About JEHUB
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to democratize education by creating a platform where students can share knowledge, 
            support each other, and build a stronger academic community together.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 sm:p-12 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              To empower students worldwide by providing a collaborative platform for sharing academic resources, 
              fostering peer-to-peer learning, and building a supportive educational community that transcends 
              geographical boundaries.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-2">50K+</div>
                <div className="text-blue-100">Students Helped</div>
              </div>
              <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-2">100K+</div>
                <div className="text-blue-100">Resources Shared</div>
              </div>
              <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-2">200+</div>
                <div className="text-blue-100">Universities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at JEHUB
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate individuals working to make education accessible for everyone
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-300">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gray-50 rounded-2xl p-8 sm:p-12 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-6">
                JEHUB was born from a simple observation: students are incredibly generous with their knowledge 
                when given the right platform and incentives. Our founder, Sarah Johnson, noticed during her 
                teaching career that the most effective learning happened when students taught each other.
              </p>
              <p className="mb-6">
                In 2023, we launched JEHUB with a vision to create a global classroom where every student 
                could be both a teacher and a learner. We started with a simple notes-sharing feature and 
                quickly expanded to include community discussions, request systems, and gamification elements 
                that make learning engaging and rewarding.
              </p>
              <p>
                Today, JEHUB serves students from over 200 universities worldwide, facilitating the sharing 
                of knowledge across disciplines, cultures, and continents. We're not just a platform—we're 
                a movement towards collaborative, accessible education for all.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
              Get in Touch
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">contact@jehub.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">123 Education Street, Learning City, LC 12345</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Send us a Message</h3>
                <form className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={4}
                      placeholder="Your Message"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
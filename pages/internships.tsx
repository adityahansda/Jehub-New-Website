import React, { useState } from 'react';
import { Briefcase, Clock, MapPin, Users, ArrowRight, Star, Building, Calendar, DollarSign, Award } from 'lucide-react';
import PageHeader from '../src/components/PageHeader';
import UniversalSidebar from '../src/components/UniversalSidebar';

const Internships = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const internships = [
    {
      id: 1,
      title: 'Frontend Developer Intern',
      company: 'TechCorp Solutions',
      location: 'Ranchi, Jharkhand',
      duration: '3 months',
      stipend: '₹15,000/month',
      type: 'Full-time',
      skills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS'],
      description: 'Join our frontend team to build modern web applications using React and other cutting-edge technologies.',
      postedDate: '2024-07-10',
      deadline: '2024-08-15',
      applicants: 45,
      status: 'Open'
    },
    {
      id: 2,
      title: 'Data Science Intern',
      company: 'DataFlow Analytics',
      location: 'Remote',
      duration: '6 months',
      stipend: '₹20,000/month',
      type: 'Remote',
      skills: ['Python', 'Machine Learning', 'SQL', 'Data Analysis'],
      description: 'Work on real-world data science projects and gain hands-on experience with ML algorithms and data visualization.',
      postedDate: '2024-07-08',
      deadline: '2024-08-20',
      applicants: 78,
      status: 'Open'
    },
    {
      id: 3,
      title: 'Mobile App Developer Intern',
      company: 'InnovateMobile',
      location: 'Jamshedpur, Jharkhand',
      duration: '4 months',
      stipend: '₹18,000/month',
      type: 'Full-time',
      skills: ['Flutter', 'Dart', 'Mobile UI/UX', 'REST APIs'],
      description: 'Develop cross-platform mobile applications and contribute to our growing portfolio of mobile solutions.',
      postedDate: '2024-07-12',
      deadline: '2024-08-25',
      applicants: 32,
      status: 'Open'
    },
    {
      id: 4,
      title: 'Backend Developer Intern',
      company: 'ServerStack Technologies',
      location: 'Dhanbad, Jharkhand',
      duration: '3 months',
      stipend: '₹16,000/month',
      type: 'Full-time',
      skills: ['Node.js', 'MongoDB', 'Express', 'API Development'],
      description: 'Build scalable backend systems and work with modern server technologies in a collaborative environment.',
      postedDate: '2024-07-05',
      deadline: '2024-08-10',
      applicants: 56,
      status: 'Closing Soon'
    },
    {
      id: 5,
      title: 'UI/UX Design Intern',
      company: 'DesignHub Creative',
      location: 'Remote',
      duration: '4 months',
      stipend: '₹12,000/month',
      type: 'Remote',
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      description: 'Create intuitive user interfaces and conduct user research to improve product usability and design.',
      postedDate: '2024-07-15',
      deadline: '2024-08-30',
      applicants: 23,
      status: 'Open'
    },
    {
      id: 6,
      title: 'DevOps Intern',
      company: 'CloudOps Solutions',
      location: 'Ranchi, Jharkhand',
      duration: '5 months',
      stipend: '₹22,000/month',
      type: 'Full-time',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      description: 'Learn cloud infrastructure management and deployment automation in a fast-paced DevOps environment.',
      postedDate: '2024-07-03',
      deadline: '2024-08-05',
      applicants: 67,
      status: 'Closed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-800';
      case 'Closing Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Remote':
        return 'bg-blue-100 text-blue-800';
      case 'Full-time':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <PageHeader 
        title="Internships"
        icon={Briefcase}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      {/* Universal Sidebar */}
      <UniversalSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="max-w-6xl mx-auto py-8 px-4 pt-20">
        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover exciting internship opportunities and kickstart your career in technology.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">24</h3>
            <p className="text-gray-600 text-sm">Active Internships</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">150+</h3>
            <p className="text-gray-600 text-sm">Students Placed</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">45</h3>
            <p className="text-gray-600 text-sm">Partner Companies</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">85%</h3>
            <p className="text-gray-600 text-sm">Success Rate</p>
          </div>
        </div>

        {/* Internship Listings */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Briefcase className="h-6 w-6 mr-2 text-blue-600" />
            Available Internships
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {internships.map((internship) => (
              <div key={internship.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{internship.title}</h3>
                    <p className="text-blue-600 font-medium mb-2">{internship.company}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(internship.status)}`}>
                      {internship.status}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(internship.type)}`}>
                      {internship.type}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">{internship.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {internship.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {internship.duration}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {internship.stipend}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {internship.applicants} applicants
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Required Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {internship.skills.map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span>Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                  </div>
                  <button 
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      internship.status === 'Closed' 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={internship.status === 'Closed'}
                  >
                    {internship.status === 'Closed' ? 'Closed' : 'Apply Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Your Career?</h3>
          <p className="text-blue-100 mb-6">
            Join thousands of students who have launched their careers through JEHUB internships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Create Profile
            </button>
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors">
              View All Internships
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Internships;

import React from 'react';
import { Briefcase, MapPin, Clock, DollarSign, ArrowRight, Building, Calendar } from 'lucide-react';

const Internships = () => {
  const internshipOpportunities = [
    {
      id: 1,
      title: 'Frontend Developer Intern',
      company: 'TechStart Solutions',
      location: 'Remote',
      duration: '3 months',
      stipend: '₹15,000/month',
      type: 'Paid',
      description: 'Work on modern web applications using React, Next.js, and TypeScript. Perfect for students looking to gain real-world experience.',
      requirements: ['React.js', 'JavaScript', 'HTML/CSS', 'Git'],
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Backend Development Intern',
      company: 'DataFlow Systems',
      location: 'Ranchi, Jharkhand',
      duration: '4 months',
      stipend: '₹18,000/month',
      type: 'Paid',
      description: 'Join our backend team to build scalable APIs and work with databases. Great learning opportunity for aspiring developers.',
      requirements: ['Node.js', 'Python', 'MongoDB', 'REST APIs'],
      posted: '1 week ago'
    },
    {
      id: 3,
      title: 'UI/UX Design Intern',
      company: 'Creative Minds Studio',
      location: 'Hybrid',
      duration: '6 months',
      stipend: '₹12,000/month',
      type: 'Paid',
      description: 'Design user interfaces and experiences for mobile and web applications. Learn from experienced designers.',
      requirements: ['Figma', 'Adobe XD', 'Photoshop', 'Design Thinking'],
      posted: '3 days ago'
    },
    {
      id: 4,
      title: 'Data Analytics Intern',
      company: 'InsightTech',
      location: 'Remote',
      duration: '3 months',
      stipend: 'Certificate + LOR',
      type: 'Unpaid',
      description: 'Analyze data patterns and create visualizations. Perfect for students interested in data science and analytics.',
      requirements: ['Python', 'Excel', 'SQL', 'Power BI'],
      posted: '5 days ago'
    },
    {
      id: 5,
      title: 'Mobile App Development Intern',
      company: 'AppCraft Technologies',
      location: 'Dhanbad, Jharkhand',
      duration: '4 months',
      stipend: '₹20,000/month',
      type: 'Paid',
      description: 'Develop cross-platform mobile applications using Flutter. Gain hands-on experience in mobile development.',
      requirements: ['Flutter', 'Dart', 'Firebase', 'Git'],
      posted: '1 day ago'
    },
    {
      id: 6,
      title: 'Content Writing Intern',
      company: 'Digital Marketing Hub',
      location: 'Remote',
      duration: '2 months',
      stipend: '₹8,000/month',
      type: 'Paid',
      description: 'Create engaging content for websites, blogs, and social media. Perfect for students with strong writing skills.',
      requirements: ['Writing Skills', 'SEO Knowledge', 'Research', 'Creativity'],
      posted: '4 days ago'
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Internship Opportunities
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover internship opportunities from top companies. Gain real-world experience, build your skills, and kickstart your career.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
            <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">Active Internships</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 text-center">
            <Building className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-green-600 mb-2">25+</div>
            <div className="text-gray-600">Partner Companies</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
            <DollarSign className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-purple-600 mb-2">₹15K</div>
            <div className="text-gray-600">Avg. Stipend</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 text-center">
            <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-orange-600 mb-2">200+</div>
            <div className="text-gray-600">Students Placed</div>
          </div>
        </div>

        {/* Internships Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {internshipOpportunities.map((internship) => (
            <div key={internship.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      internship.type === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {internship.type}
                    </span>
                    <span className="text-xs text-gray-500">{internship.posted}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {internship.title}
                  </h3>
                  <p className="text-blue-600 font-medium mb-2">{internship.company}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {internship.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {internship.duration}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {internship.stipend}
                </div>
              </div>

              <p className="text-gray-600 mb-4 leading-relaxed">
                {internship.description}
              </p>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
                <div className="flex flex-wrap gap-1">
                  {internship.requirements.map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Looking to Post an Internship?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Partner with JEHUB to find talented students from top engineering colleges across Jharkhand. Post your internship opportunities and connect with skilled candidates.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            Post Internship
          </button>
        </div>
      </div>
    </div>
  );
};

export default Internships;

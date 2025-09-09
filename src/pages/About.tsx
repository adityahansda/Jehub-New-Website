import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, BookOpen, Star, Globe, Heart, Shield, Mail, Phone, MapPin, Target, Award, Zap, TrendingUp, Calendar, GraduationCap, MessageCircle, Code, Palette, PenTool, Megaphone, Github, Linkedin, Twitter, Instagram, Building, CheckCircle, ArrowRight, Sparkles, Lightbulb, Rocket, Network, FileText, UserCheck, Headphones, Monitor, Briefcase, School, Clock, ChevronRight, Crown, User } from 'lucide-react';
import { coreTeam } from '../data/teamData';
import { emailService } from '../services/emailService';

// Custom styles for founder card animations
const customStyles = `
  @keyframes founder-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
    50% { box-shadow: 0 0 30px rgba(147, 51, 234, 0.4); }
  }
  
  .founder-card {
    animation: founder-glow 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  
  .float-animation {
    animation: float 3s ease-in-out infinite;
  }
`;

const About = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    college: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.message) {
        throw new Error('Please fill in all required fields');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Send email using our email service
      const result = await emailService.sendContactFormEmail({
        name: formData.name,
        email: formData.email,
        college: formData.college,
        message: formData.message
      });

      if (result.success) {
        // Success
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          college: '',
          message: ''
        });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      } else {
        throw new Error(result.message);
      }

    } catch (error: any) {
      setSubmitStatus('error');
      console.error('Form submission error:', error);
      
      // Reset error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const coreValues = [
    {
      icon: BookOpen,
      title: 'Academic Resources Centralized',
      description: 'All important academic updates - exams, notes, resources & events - consolidated in one reliable place for diploma students.'
    },
    {
      icon: Users,
      title: 'Student-Led Community',
      description: 'Built by diploma students who understand the exact curriculum & challenges of the Indian education system.'
    },
    {
      icon: Target,
      title: 'Real-World Experience',
      description: 'Consistent learning & contribution opportunities through real tasks in development, design, content & outreach.'
    },
    {
      icon: Heart,
      title: 'Peer Support Network',
      description: 'A supportive network of diploma students from similar backgrounds with peer mentorship and guidance.'
    }
  ];

  const keyFeatures = [
    {
      icon: Calendar,
      title: 'Academic Updates',
      description: 'Notes, exam dates, events - all in one place'
    },
    {
      icon: GraduationCap,
      title: 'Built by Students',
      description: 'Core team understands the exact curriculum & challenges'
    },
    {
      icon: MessageCircle,
      title: 'Open Contributions',
      description: 'Tasks in dev, design, content & outreach'
    },
    {
      icon: TrendingUp,
      title: 'Active Since 2022',
      description: 'A growing and reliable space led by students for students'
    }
  ];


  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl -z-10 opacity-60"></div>
          <div className="relative z-10 py-16 px-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full mb-8 shadow-lg">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Introduction to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">JEHUB</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              JEHUB is more than just a platform - it's a vibrant community dedicated to empowering learners across India through collaboration, 
              mentorship, and hands-on experience. Built by students and supported by passionate professionals, JEHUB stands out as a reliable 
              ecosystem where knowledge meets real-world relevance. What started in Jharkhand is now expanding nationwide, creating a 
              thriving space where learners, educators, and industry professionals come together to grow, share, and lead.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-full">
                <Award className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-semibold">Active Since 2022</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-teal-50 px-6 py-3 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-semibold">Student-Led Initiative</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 rounded-full">
                <School className="h-5 w-5 text-purple-600" />
                <span className="text-purple-800 font-semibold">India Focused</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Mission */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-blue-100 leading-relaxed text-lg">
                To create a free, inclusive, and student-friendly platform that supports academic growth, 
                skill development, and community learning for students across India, starting from Jharkhand.
              </p>
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Heart className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium">Student-First Approach</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Vision */}
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Our Vision</h2>
              <p className="text-purple-100 leading-relaxed text-lg">
                JEHUB envisions becoming a pan-India student tech network, connecting learners from every corner of the country. 
                We started in Jharkhand and are rapidly expanding to serve students nationwide. Our goal is to 
                become the most trusted student community platform across India.
              </p>
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Rocket className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium">Pan-India Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 sm:p-12 mb-16">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Growing Impact</h2>
            <p className="text-gray-600 mb-12 text-lg">Building a stronger, more connected student community across India, starting from Jharkhand</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                <div className="text-gray-600 font-medium">Students Helped</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600 font-medium">Academic Resources</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">25+</div>
                <div className="text-gray-600 font-medium">Colleges Connected</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">365</div>
                <div className="text-gray-600 font-medium">Days of Support</div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">*Data based on community engagement and resource sharing since inception</p>
            </div>
          </div>
        </div>
        
        {/* Target Audience Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Who We Serve & Welcome
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              JEHUB is built with a deep understanding of our diverse community and their unique needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Diploma & B.Tech Students</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Engineering students from Diploma and B.Tech programs across India seeking reliable academic resources, peer support, and community connections as we expand nationwide.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Tech Beginners</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Students curious about technology, community work, and building real-world skills through collaborative projects.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Peer-Led Learning Seekers</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Students who prefer a free, transparent, and peer-supported environment over typical paid platforms.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Working Professionals</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Industry experts and professionals passionate about mentoring and sharing knowledge with the next generation.
              </p>
            </div>
          </div>
        </div>
        
        {/* Professional Contributors Section */}
        <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-3xl p-8 sm:p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Join Our Community as a Contributor
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              JEHUB welcomes talented professionals and passionate individuals who believe in giving back to the student community. 
              If you have expertise and are passionate about guiding students free of cost, we invite you to join our mission.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">For Professional Contributors</h3>
                  <p className="text-gray-600">Share your expertise and make a difference</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Conduct free educational sessions and workshops for students</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Mentor students in your area of expertise and industry knowledge</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Create valuable content and resources to help students learn and grow</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Build meaningful connections with the next generation of professionals</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">For Talented Individuals</h3>
                  <p className="text-gray-600">Showcase your unique skills and talents</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Contribute your unique talents and skills to help the community grow</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Collaborate on projects that make a real impact on student learning</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Gain recognition for your contributions and build your professional network</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">Be part of a community that values innovation, creativity, and knowledge sharing</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 inline-block">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Ready to Make a Difference?</h4>
              <p className="text-gray-600 mb-6 max-w-2xl">
                Join thousands of professionals and talented individuals who are already contributing to JEHUB's mission 
                of empowering students across India. Your expertise and passion can help shape the future of education.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/join-team" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Heart className="h-5 w-5" />
                  Join as Contributor
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#contact" className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-full font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                  <MessageCircle className="h-5 w-5" />
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Core Objectives Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Core Objectives
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The driving motives behind everything we do at JEHUB - creating lasting impact for students across India
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn more</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Key Features Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              What makes JEHUB the perfect platform for students across India
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 w-18 h-18 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-9 w-9 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 w-8 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Preview Section */}
        <div className="mb-16">
          <div className="bg-gray-900 rounded-3xl p-8 lg:p-16 shadow-2xl border border-gray-800">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                The dedicated individuals working together to build JEHUB as India's most trusted student community platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
              {/* Team Member Cards */}
              {coreTeam.slice(0, 4).map((member, index) => {
                const gradients = [
                  'from-blue-500 to-purple-500',
                  'from-green-500 to-teal-500', 
                  'from-purple-500 to-pink-500',
                  'from-orange-500 to-red-500'
                ];
                
                return (
                  <div key={index} className="text-center group">
                    {/* Profile Image with Circular Background */}
                    <div className="relative mb-6 mx-auto w-fit">
                      {/* Gradient Background Circle */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${gradients[index]} rounded-full w-40 h-40 blur-sm opacity-30 group-hover:opacity-50 transition-all duration-300`}></div>
                      {/* Secondary Background Circle */}
                      <div className={`absolute inset-2 bg-gradient-to-r ${gradients[index]} rounded-full w-36 h-36 opacity-20 group-hover:opacity-40 transition-all duration-300`}></div>
                      {/* Circular Image Container */}
                      <div className="relative z-10 flex items-center justify-center w-40 h-40">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                          <Image
                            src={member.image}
                            alt={member.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Member Info */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                      <p className="text-gray-400 font-medium">{member.role}</p>
                      <p className="text-gray-300 text-sm leading-relaxed px-2">
                        {member.bio}
                      </p>
                      
                      {/* Social Links */}
                      <div className="flex justify-center gap-3 pt-4">
                        {member.social.github && member.social.github !== '#' && (
                          <a href={member.social.github} target="_blank" rel="noopener noreferrer" 
                             className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                            <Github className="h-4 w-4 text-gray-400 hover:text-white" />
                          </a>
                        )}
                        {member.social.linkedin && member.social.linkedin !== '#' && (
                          <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer"
                             className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                            <Linkedin className="h-4 w-4 text-gray-400 hover:text-white" />
                          </a>
                        )}
                        {member.social.twitter && member.social.twitter !== '#' && (
                          <a href={member.social.twitter} target="_blank" rel="noopener noreferrer"
                             className="w-8 h-8 bg-gray-800 hover:bg-sky-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                            <Twitter className="h-4 w-4 text-gray-400 hover:text-white" />
                          </a>
                        )}
                        {member.social.instagram && (
                          <a href={member.social.instagram} target="_blank" rel="noopener noreferrer"
                             className="w-8 h-8 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                            <Instagram className="h-4 w-4 text-gray-400 hover:text-white" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Team Section - Link to dedicated team page */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 sm:p-12 mb-16">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Meet the dedicated team members working together to make JEHUB successful
            </p>
            <Link href="/team" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Users className="h-5 w-5" />
              View Team
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        
        {/* Scope & Future Plans Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Scope & Future Plans
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our roadmap for expanding JEHUB&apos;s impact across India
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Building className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Campus Expansion</h3>
              <p className="text-gray-600 leading-relaxed">
                Expanding presence in colleges across India with dedicated campus chapters and local representatives in every state.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Monitor className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Live Sessions & Events</h3>
              <p className="text-gray-600 leading-relaxed">
                Organizing micro-events, live learning sessions, and interactive workshops for skill development.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Project-Based Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Implementing hands-on project opportunities that provide real-world experience and portfolio building.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Network className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Digital Presence</h3>
              <p className="text-gray-600 leading-relaxed">
                Building a strong digital ecosystem for campus-level collaboration and resource sharing.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">JEHUB Campus Chapters</h3>
              <p className="text-gray-600 leading-relaxed">
                Launching self-sustaining campus chapters across India with student leadership and local community support.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-teal-500 to-green-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">Pan-India Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                Long-term vision to expand beyond Jharkhand and become a pan-India student tech network.
              </p>
            </div>
          </div>
        </div>
        
        {/* Story Section */}
        <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-3xl p-8 sm:p-12 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Our Story
              </h2>
              <p className="text-xl text-gray-600">From a small idea to a thriving pan-India student community</p>
            </div>
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">The Beginning</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  JEHUB was founded by Aditya Hansda, a visionary B.tech student who wanted to build a space where 
                  fellow learners felt heard, guided, and connected. The initiative began with a small group of students 
                  from Jharkhand, which gave us a focused understanding of the academic challenges and student 
                  pain points in the Indian education system.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <Network className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Growing Community</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  As we&apos;ve grown, so has our team. Today, JEHUB is proudly led by individuals from varied branches
                  and backgrounds across India, bringing together diverse expertise to support students from all states and disciplines. This 
                  nationwide collaboration ensures that no student feels left out—and every learner, regardless of 
                  location or specialization, finds JEHUB a place they can rely on.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Rocket className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Future Vision</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  In the coming months, JEHUB will continue expanding its presence in colleges across India, offering micro-events, 
                  live sessions, project-based learning, and building a strong, digital presence for nationwide collaboration. 
                  With plans to launch JEHUB Campus Chapters, we aim to build a self-sustaining model across every state in India.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Highlights Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Key Highlights of JEHUB
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover what makes JEHUB a vibrant, collaborative community for engineering and polytechnic students
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Community-Powered Platform</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                A vibrant community of learners and future engineers where students actively share notes, study materials, and experiences through active Telegram and WhatsApp groups.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Study Materials & Notes</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Access and contribute semester-wise notes, textbooks, and exam resources in PDF format, making learning easier and more accessible for all members.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Exam & Result Updates</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Stay updated with the latest exam schedules, results, and syllabus changes from universities and polytechnic colleges in Jharkhand.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Career & Admission Guidance</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Information on internships, job opportunities, lateral entry for diploma holders, and other career-related resources.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Gamification & Rewards</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Earn XP points, badges, and leaderboard positions by contributing to the community, motivating active participation.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Campus Ambassador Program</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Become a JEHUB ambassador to represent your college and lead initiatives that benefit the wider student community.
              </p>
            </div>
          </div>
        </div>

        {/* Community vs Platform Section */}
        <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 rounded-3xl p-8 sm:p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              More Than a Platform - We Are a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-600">Community</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              JEHUB is not just another online platform. We are a thriving community of passionate learners, dedicated mentors, 
              and industry professionals united by a shared mission of educational empowerment and knowledge sharing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Community-First Approach</h3>
                  <p className="text-gray-700">We prioritize genuine human connections, peer-to-peer learning, and collaborative growth over typical transactional platform experiences.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Organic Growth</h3>
                  <p className="text-gray-700">Our community has grown organically through word-of-mouth, genuine value creation, and authentic relationships built over time.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Values-Driven Mission</h3>
                  <p className="text-gray-700">Every decision we make is guided by our core values of accessibility, inclusivity, quality education, and community empowerment.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">What Makes Us Different</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-gray-700">Free access to all resources and mentorship</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-gray-700">Student-centric content and curriculum alignment</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-gray-700">Real industry professionals as mentors</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-gray-700">Focus on practical, hands-on learning</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-gray-700">Transparent operations and community governance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upcoming Website Launch Section */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 text-white rounded-3xl p-8 sm:p-12 mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <Rocket className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Exciting Update: Website Launch Coming Soon!</h2>
              <p className="text-xl text-purple-100 max-w-4xl mx-auto mb-8">
                Our community is evolving! While we've been thriving as a close-knit community through various channels, 
                we're now launching our comprehensive website to better serve students across Jharkhand and beyond.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Enhanced Connectivity</h3>
                <p className="text-purple-100 leading-relaxed">
                  Connect students from Jharkhand with peers from other states, creating a truly pan-India educational network.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Monitor className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Digital Hub</h3>
                <p className="text-purple-100 leading-relaxed">
                  A centralized platform featuring all resources, events, mentorship programs, and community activities in one place.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Expanded Reach</h3>
                <p className="text-purple-100 leading-relaxed">
                  Opening doors for more students, professionals, and educational institutions to join our growing community.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm px-8 py-4 rounded-full">
                <Clock className="h-6 w-6 text-white" />
                <span className="text-lg font-semibold">Launch Timeline: Coming Very Soon</span>
              </div>
              <p className="text-purple-100 mt-4 max-w-2xl mx-auto">
                Stay tuned for the official launch announcement. Our website will maintain the same community values 
                while providing enhanced tools and features for better learning experiences.
              </p>
            </div>
          </div>
        </div>
        
        {/* Community Impact Section */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 sm:p-12 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Collaborative Learning Network
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Over 1,000 students from 50+ colleges are connected through JEHUB, creating a strong network for academic growth
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <Network className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Student-Driven Community</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                JEHUB truly embodies the spirit of a community-powered hub built by students, for students — making it an invaluable ecosystem for engineering students in Jharkhand and beyond.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Official Platform</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Visit our official website at <span className="font-semibold text-blue-600">jehub.vercel.app</span> to explore all features and join our growing community of engineering students.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Get in Touch
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Ready to join the JEHUB community? From any corner of India? We&apos;d love to hear from you!
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">contact@jehub.in</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <p className="text-gray-600">+91 (XXX) XXX-XXXX</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Location</p>
                      <p className="text-gray-600">India (Started in Jharkhand)</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <p className="text-sm text-gray-700 font-medium">💡 Quick Tip</p>
                  <p className="text-sm text-gray-600 mt-1">For faster response, mention your college, state, and branch when reaching out!</p>
                </div>
              </div>
                             <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                 <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
                 
                 {/* Status Messages */}
                 {submitStatus === 'success' && (
                   <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                     <div className="flex items-center gap-2">
                       <CheckCircle className="h-5 w-5 text-green-600" />
                       <p className="text-green-800 font-medium">Message sent successfully!</p>
                     </div>
                     <p className="text-green-700 text-sm mt-1">We'll get back to you soon.</p>
                   </div>
                 )}
                 
                 {submitStatus === 'error' && (
                   <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                     <div className="flex items-center gap-2">
                       <Shield className="h-5 w-5 text-red-600" />
                       <p className="text-red-800 font-medium">Failed to send message</p>
                     </div>
                     <p className="text-red-700 text-sm mt-1">Please try again or contact us directly.</p>
                   </div>
                 )}

                 <form onSubmit={handleSubmit} className="space-y-6">
                   <div>
                     <input
                       type="text"
                       name="name"
                       value={formData.name}
                       onChange={handleInputChange}
                       placeholder="Your Name *"
                       required
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                     />
                   </div>
                   <div>
                     <input
                       type="email"
                       name="email"
                       value={formData.email}
                       onChange={handleInputChange}
                       placeholder="Your Email *"
                       required
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                     />
                   </div>
                   <div>
                     <input
                       type="text"
                       name="college"
                       value={formData.college}
                       onChange={handleInputChange}
                       placeholder="Your College & Branch (e.g., ABC College, Delhi - Computer Science)"
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                     />
                   </div>
                   <div>
                     <textarea
                       name="message"
                       value={formData.message}
                       onChange={handleInputChange}
                       rows={4}
                       placeholder="Your Message *"
                       required
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                     />
                   </div>
                   <button
                     type="submit"
                     disabled={isSubmitting}
                     className={`w-full py-3 rounded-lg font-medium transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
                       isSubmitting 
                         ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                         : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
                     }`}
                   >
                     {isSubmitting ? (
                       <>
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                         <span>Sending...</span>
                       </>
                     ) : (
                       <>
                         <span>Send Message</span>
                         <ChevronRight className="h-4 w-4" />
                       </>
                     )}
                   </button>
                 </form>
               </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default About;

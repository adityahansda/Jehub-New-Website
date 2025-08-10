import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, BookOpen, Star, Globe, Heart, Shield, Mail, Phone, MapPin, Target, Award, Zap, TrendingUp, Calendar, GraduationCap, MessageCircle, Code, Palette, PenTool, Megaphone, Github, Linkedin, Twitter, Instagram, Building, CheckCircle, ArrowRight, Sparkles, Lightbulb, Rocket, Network, FileText, UserCheck, Headphones, Monitor, Briefcase, School, Clock, ChevronRight } from 'lucide-react';
import { coreTeam } from '../data/teamData';
import { emailService } from '../services/emailService';

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
      title: 'Active Since 1 Year',
      description: 'A growing and reliable space led by students for students'
    }
  ];


  return (
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
              JEHUB is a growing, student-led initiative dedicated to empowering learners across India through collaboration, 
              community, and hands-on experience. Built by and for students, JEHUB stands out as a reliable 
              platform where knowledge meets real-world relevance. What started in Jharkhand is now expanding to become a 
              thriving space where learners from all over India grow, share, and lead - together.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-full">
                <Award className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-semibold">Active Since 1 Year</span>
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
              Who We Serve
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              JEHUB is built with a deep understanding of our audience and their unique needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Diploma Students</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Students from across India seeking reliable academic resources, peer support, and community connections.
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

        {/* Core Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Core Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The founding members who started JEHUB and continue to lead its growth across Indian student communities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreTeam.map((member, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 text-center hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group">
                <div className="relative mb-6">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={120}
                    height={120}
                    className="w-32 h-32 rounded-full mx-auto border-4 border-blue-200 shadow-lg group-hover:border-blue-300 transition-all duration-300"
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {member.name === 'Aditya Hansda' ? 'Founder/CEO' : member.role.split(' ')[0]}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 mb-2">{member.education}</p>
                <p className="text-xs text-purple-600 font-medium mb-4">{member.specialization}</p>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{member.bio}</p>
                <div className="flex justify-center space-x-4">
                  {member.social.github && (
                    <a href={member.social.github} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-800 hover:text-white transition-all duration-300">
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.linkedin && (
                    <a href={member.social.linkedin} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all duration-300">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a href={member.social.twitter} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-400 hover:text-white transition-all duration-300">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.instagram && (
                    <a href={member.social.instagram} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-pink-600 hover:text-white transition-all duration-300">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
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
                  JEHUB was founded by Aditya Hansda, a visionary diploma student who wanted to build a space where 
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
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12">
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
  );
};

export default About;
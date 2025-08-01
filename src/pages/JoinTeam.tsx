import React, { useState } from 'react';
import {
  Users,
  Rocket,
  Star,
  CheckCircle,
  Upload,
  Send,
  MessageSquare,
  Code,
  Palette,
  Camera,
  Megaphone,
  PenTool,
  Globe,
  Award,
  Clock,
  Heart
} from 'lucide-react';

const JoinTeam = () => {
  type FormData = {
    fullName: string;
    email: string;
    whatsapp: string;
    college: string;
    currentStatus: string;
    positions: string[];
    skills: string;
    whyJoin: string;
    coolSkills: string;
    startupExperience: string;
    voluntaryWork: string;
    hoursPerWeek: string;
    hearAbout: string;
    portfolio: string;
    resume: File | null;
  };

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    whatsapp: '',
    college: '',
    currentStatus: '',
    positions: [],
    skills: '',
    whyJoin: '',
    coolSkills: '',
    startupExperience: '',
    voluntaryWork: '',
    hoursPerWeek: '',
    hearAbout: '',
    portfolio: '',
    resume: null
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    'Diploma Student',
    'B.Tech Student',
    'Other College Student',
    'Working Professional',
    'Freelancer'
  ];

  const positionOptions = [
    { id: 'community-manager', label: 'Community Manager', icon: Users },
    { id: 'content-manager', label: 'Content Manager', icon: PenTool },
    { id: 'website-developer', label: 'Website Developer', icon: Code },
    { id: 'social-media-manager', label: 'Social Media Manager', icon: Megaphone },
    { id: 'graphic-designer', label: 'Graphic Designer', icon: Palette },
    { id: 'frontend-developer', label: 'Frontend Developer', icon: Code },
    { id: 'backend-developer', label: 'Backend Developer', icon: Code },
    { id: 'video-editor', label: 'Video Editor', icon: Camera },
    { id: 'campus-ambassador', label: 'Campus Ambassador', icon: Globe },
    { id: 'blogger-expert', label: 'Blogger Expert', icon: PenTool }
  ];

  const benefits = [
    {
      icon: Rocket,
      title: 'Real Project Experience',
      description: 'Work on live projects that impact thousands of students'
    },
    {
      icon: Award,
      title: 'Build Your Resume',
      description: 'Get recognized contributions and certificates'
    },
    {
      icon: Users,
      title: 'Network with Peers',
      description: 'Connect with talented students and professionals'
    },
    {
      icon: Star,
      title: 'Skill Development',
      description: 'Learn new technologies and improve existing skills'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePositionChange = (positionId: string) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.includes(positionId)
        ? prev.positions.filter(id => id !== positionId)
        : [...prev.positions, positionId]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
    } else {
      alert('Please upload a PDF file only.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (in real app, this would send to Google Sheets)
    try {
      // Here you would integrate with Google Sheets API or form service
      console.log('Form submitted:', formData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('application-form')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 sm:p-12">
            <div className="bg-green-100 text-green-600 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              🎉 Application Submitted!
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Thank you for applying to join the JEHUB team! Your response has been submitted successfully.
            </p>
            <p className="text-gray-600 mb-8">
              We&quot;ll review your application and contact you soon via WhatsApp or Email.
              Keep an eye on your notifications!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
href="https://t.me/JharkhandEnginnersHub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Join Our Telegram
              </a>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-orange-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200">
            <Rocket className="h-4 w-4 mr-2" />
            Join the Revolution
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Become a Part of the
            <span className="block bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              JEHUB Core Team 🚀
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            We&quot;re building the next-gen student tech community. Join us if you&quot;re passionate
            and ready to contribute to something meaningful.
          </p>

          <button
            onClick={scrollToForm}
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Apply Now
            <Send className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* Why Join Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Join JEHUB?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Be part of something bigger and make a real impact in the student community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-8 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">Flexible</div>
                <div className="text-sm text-gray-600">Volunteer roles with learning opportunities</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">Remote</div>
                <div className="text-sm text-gray-600">Work from anywhere, anytime</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">Growth</div>
                <div className="text-sm text-gray-600">Get recognized in the tech ecosystem</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">Impact</div>
                <div className="text-sm text-gray-600">Help thousands of students succeed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div id="application-form" className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-orange-500 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
              Join the JEHUB Team – Let&quot;s Build Together!
            </h2>
            <p className="text-blue-100 text-center mt-2">
              Fill out the form below to apply for your desired position
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Phone Number *
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  required
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College / Organization Name *
                </label>
                <input
                  type="text"
                  name="college"
                  required
                  value={formData.college}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your college or organization"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status *
              </label>
              <select
                name="currentStatus"
                required
                value={formData.currentStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your current status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Position Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Join Position For * (Select multiple if interested)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {positionOptions.map(position => {
                  const Icon = position.icon;
                  return (
                    <label
                      key={position.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${formData.positions.includes(position.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.positions.includes(position.id)}
                        onChange={() => handlePositionChange(position.id)}
                        className="sr-only"
                      />
                      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium">{position.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Text Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Briefly describe your skills and experience *
              </label>
              <textarea
                name="skills"
                required
                rows={4}
                value={formData.skills}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about your technical skills, experience, and what you're good at..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to join JEHUB? *
              </label>
              <textarea
                name="whyJoin"
                required
                rows={4}
                value={formData.whyJoin}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your motivation and what excites you about JEHUB..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What cool skills or experiences do you have that would help us? *
              </label>
              <textarea
                name="coolSkills"
                required
                rows={4}
                value={formData.coolSkills}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about your unique skills, projects, or experiences that make you stand out..."
              />
            </div>

            {/* Radio Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Have you worked in a startup/community before? *
                </label>
                <div className="space-y-2">
                  {['Yes', 'No'].map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="startupExperience"
                        value={option}
                        checked={formData.startupExperience === option}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Are you okay with voluntary collaboration roles? *
                </label>
                <div className="space-y-2">
                  {['Yes', 'No'].map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="voluntaryWork"
                        value={option}
                        checked={formData.voluntaryWork === option}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many hours per week can you contribute? *
                </label>
                <input
                  type="text"
                  name="hoursPerWeek"
                  required
                  value={formData.hoursPerWeek}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5-10 hours per week"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did you hear about JEHUB? *
                </label>
                <input
                  type="text"
                  name="hearAbout"
                  required
                  value={formData.hearAbout}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Social media, friend, college, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio or Work Sample (URL) *
              </label>
              <input
                type="url"
                name="portfolio"
                required
                value={formData.portfolio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-portfolio.com or GitHub/Behance link"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume (PDF only) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                  required
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {formData.resume ? formData.resume.name : 'Click to upload your resume'}
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF format only (Max 5MB)
                  </p>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Application...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Send className="h-5 w-5 mr-2" />
                    Submit Application
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Contact & Privacy */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-6 border border-blue-200 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-600">We respect your privacy. Your information is safe with us.</span>
            </div>
            <a
href="https://t.me/JharkhandEnginnersHub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              JEHUB Telegram Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinTeam;
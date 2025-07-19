import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { 
  ArrowLeft, User, Mail, CheckCircle, AlertCircle, 
  Rocket, School, Star, Trophy 
} from 'lucide-react';

const WishlistRegister = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    collegeEmail: '',
    collegeName: '',
    yearOfStudy: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Validate college email
  const validateCollegeEmail = (email: string) => {
    const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]*\.(edu|ac\.in|edu\.in)$/;
    return collegeEmailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validation
    const newErrors: any = {};
    
    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }
    
    if (!formData.collegeEmail.trim()) {
      newErrors.collegeEmail = 'College email is required';
    } else if (!validateCollegeEmail(formData.collegeEmail)) {
      newErrors.collegeEmail = 'Please enter a valid college email (.edu, .ac.in, .edu.in)';
    }
    
    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'College name is required';
    }
    
    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = 'Year of study is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    try {
      console.log('Wishlist registration:', formData);
      // Here you would typically make an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to submit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Head>
          <title>Wishlist Registration Complete - JEHUB</title>
          <meta name="description" content="Successfully registered for JEHUB beta wishlist" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-[#0e0e10] to-[#1c1c1f] flex items-center justify-center px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-[#1c1c1f] rounded-2xl border border-[#2d2d30] p-8 text-center">
              <div className="bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">
                🎉 Welcome to the Wishlist!
              </h1>
              
              <p className="text-[#d1d5db] mb-6">
                Thank you for joining JEHUB&apos;s beta wishlist! You&apos;ll be among the first to access our platform when we launch.
              </p>
              
              <div className="bg-[#0e0e10] rounded-lg p-4 mb-6">
                <p className="text-sm text-[#81e6d9] mb-2">What&apos;s next?</p>
                <ul className="text-sm text-[#d1d5db] space-y-1 text-left">
                  <li>• You&apos;ll receive launch updates via email</li>
                  <li>• Get exclusive early access to features</li>
                  <li>• Earn a special &quot;Beta Tester&quot; badge</li>
                  <li>• Shape the future of student collaboration</li>
                </ul>
              </div>
              
              <Link 
                href="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#9333ea] to-[#3b82f6] text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Join JEHUB Wishlist - Student Registration</title>
        <meta name="description" content="Register for JEHUB beta access with your student information" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#0e0e10] to-[#1c1c1f] py-8 px-4">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-[#81e6d9] hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-[#9333ea] to-[#3b82f6] rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Join JEHUB Beta Wishlist
            </h1>
            <p className="text-lg text-[#d1d5db]">
              Be among the first students to experience the future of academic collaboration
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="bg-[#1c1c1f] rounded-2xl border border-[#2d2d30] p-8 space-y-6">
            {/* Student Name */}
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-[#d1d5db] mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-[#0e0e10] border ${
                  errors.studentName ? 'border-red-500' : 'border-[#2d2d30]'
                } text-white placeholder-[#666] focus:outline-none focus:border-[#9333ea] transition-colors`}
                placeholder="Enter your full name"
              />
              {errors.studentName && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.studentName}
                </p>
              )}
            </div>

            {/* College Email */}
            <div>
              <label htmlFor="collegeEmail" className="block text-sm font-medium text-[#d1d5db] mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                College Email Address *
              </label>
              <input
                type="email"
                id="collegeEmail"
                name="collegeEmail"
                value={formData.collegeEmail}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-[#0e0e10] border ${
                  errors.collegeEmail ? 'border-red-500' : 'border-[#2d2d30]'
                } text-white placeholder-[#666] focus:outline-none focus:border-[#9333ea] transition-colors`}
                placeholder="your.email@college.edu"
              />
              {errors.collegeEmail && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.collegeEmail}
                </p>
              )}
              <p className="mt-1 text-xs text-[#666]">
                We only accept official college email addresses (.edu, .ac.in, .edu.in)
              </p>
            </div>

            {/* College Name */}
            <div>
              <label htmlFor="collegeName" className="block text-sm font-medium text-[#d1d5db] mb-2">
                <School className="inline h-4 w-4 mr-2" />
                College/University Name *
              </label>
              <input
                type="text"
                id="collegeName"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-[#0e0e10] border ${
                  errors.collegeName ? 'border-red-500' : 'border-[#2d2d30]'
                } text-white placeholder-[#666] focus:outline-none focus:border-[#9333ea] transition-colors`}
                placeholder="Enter your college/university name"
              />
              {errors.collegeName && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.collegeName}
                </p>
              )}
            </div>

            {/* Year of Study */}
            <div>
              <label htmlFor="yearOfStudy" className="block text-sm font-medium text-[#d1d5db] mb-2">
                <Trophy className="inline h-4 w-4 mr-2" />
                Year of Study *
              </label>
              <select
                id="yearOfStudy"
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-[#0e0e10] border ${
                  errors.yearOfStudy ? 'border-red-500' : 'border-[#2d2d30]'
                } text-white focus:outline-none focus:border-[#9333ea] transition-colors`}
              >
                <option value="">Select your year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate">Graduate Student</option>
                <option value="PhD">PhD Student</option>
              </select>
              {errors.yearOfStudy && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.yearOfStudy}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#9333ea] to-[#3b82f6] text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Joining Wishlist...
                </span>
              ) : (
                'Join Beta Wishlist'
              )}
            </button>

            {errors.submit && (
              <p className="text-red-400 text-sm flex items-center justify-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.submit}
              </p>
            )}

            {/* Benefits */}
            <div className="bg-[#0e0e10] rounded-lg p-4 mt-6">
              <p className="text-sm font-medium text-[#81e6d9] mb-2 flex items-center">
                <Star className="h-4 w-4 mr-1" />
                What you&apos;ll get:
              </p>
              <ul className="text-sm text-[#d1d5db] space-y-1">
                <li>• Early access to JEHUB beta</li>
                <li>• Exclusive &quot;Beta Tester&quot; badge</li>
                <li>• Direct feedback channel to developers</li>
                <li>• Priority customer support</li>
                <li>• Launch day bonuses and rewards</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default WishlistRegister;

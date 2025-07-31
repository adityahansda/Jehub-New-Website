import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '../src/contexts/AuthContext';
import { userService } from '../src/services/userService';
import { databases, DATABASE_ID } from '../src/appwrite/config';
import { collections } from '../src/lib/appwriteConfig';
import { ID, Query } from 'appwrite';
import { 
  User, Mail, GraduationCap, MapPin, Phone, Calendar, Loader2, Camera,
  Upload, X, Save, AlertCircle, Eye, EyeOff, Lock, School, Trophy,
  BookOpen, Globe, Cake, Home
} from 'lucide-react';

const CompleteProfile: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    // Basic Information
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    gender: '',
    
    // Academic Information
    college: '',
    collegeEmail: '',
    branch: '',
    semester: '',
    year: '',
    enrollmentNumber: '',
    currentGPA: '',
    
    // Personal Information
    bio: '',
    interests: '',
    skills: '',
    languages: '',
    
    // Address Information
    currentAddress: '',
    permanentAddress: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    
    // Social Links (Optional)
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    
    // Preferences
    preferredLanguage: 'English',
    notificationPreferences: {
      email: true,
      sms: false,
      push: true
    },
    
    // Profile Image
    profileImageUrl: ''
  });

  const branches = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering', 
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Information Technology',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Biomedical Engineering',
    'Environmental Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Commerce',
    'Arts',
    'Management',
    'Law',
    'Medicine',
    'Other'
  ];

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate', 'PhD'];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const languages = ['English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Odia', 'Malayalam', 'Punjabi'];
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
  ];

  // Fetch existing user profile data from database
  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      // Query user data by userId or email
      const response = await databases.listDocuments(
        DATABASE_ID,
        collections.users,
        [Query.equal('email', user.email!)]
      );
      
      if (response.documents.length > 0) {
        const userData = response.documents[0];
        
        // Pre-fill form with existing data
        setFormData({
          // Basic Information
          fullName: userData.name || user.name || '',
          email: userData.email || user.email || '',
          phone: userData.phone || '',
          alternatePhone: userData.alternatePhone || '',
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
          gender: userData.gender || '',
          
          // Academic Information
          college: userData.college || '',
          collegeEmail: userData.collegeEmail || '',
          branch: userData.branch || '',
          semester: userData.semester || '',
          year: userData.year || '',
          enrollmentNumber: userData.enrollmentNumber || '',
          currentGPA: userData.currentGPA || '',
          
          // Personal Information
          bio: userData.bio || '',
          interests: userData.interests || '',
          skills: userData.skills || '',
          languages: userData.languages || '',
          
          // Address Information
          currentAddress: userData.currentAddress || '',
          permanentAddress: userData.permanentAddress || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || 'India',
          pincode: userData.pincode || '',
          
          // Social Links
          linkedinUrl: userData.linkedinUrl || '',
          githubUrl: userData.githubUrl || '',
          portfolioUrl: userData.portfolioUrl || '',
          
          // Preferences
          preferredLanguage: userData.preferredLanguage || 'English',
          notificationPreferences: {
            email: true,
            sms: false,
            push: true
          },
          
          // Profile Image
          profileImageUrl: userData.profileImageUrl || userData.avatar || ''
        });
        
        // Set profile image if exists
        if (userData.profileImageUrl || userData.avatar) {
          setProfileImage(userData.profileImageUrl || userData.avatar);
        }
      } else {
        // No existing profile, use basic OAuth data
        setFormData(prev => ({
          ...prev,
          fullName: user.name || '',
          email: user.email || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to OAuth data
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const checkProfileAndRedirect = async () => {
      const isComplete = await userService.isProfileComplete(user.email);
      if (isComplete) {
        router.push('/');
        return;
      }

      // Fetch existing user profile data
      fetchUserProfile();
    };
    checkProfileAndRedirect();
  }, [user, router, fetchUserProfile]);

  // Handle profile image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setImageUploading(true);
    setError('');

    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        setFormData(prev => ({ ...prev, profileImageUrl: result }));
      };
      reader.readAsDataURL(file);
      
      // Here you would upload to your storage service (Appwrite Storage, etc.)
      // For now, we'll just use the base64 version
      
    } catch (error) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  // Remove profile image
  const removeProfileImage = () => {
    setProfileImage(null);
    setFormData(prev => ({ ...prev, profileImageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/[^\d]/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate date of birth (must be at least 13 years old)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 13 || (age === 13 && monthDiff < 0)) {
        setError('You must be at least 13 years old to register');
        return;
      }
    }

    setLoading(true);
    setError('');
    
    try {
      // Check if user already exists in database
      if (!user) {
        setError('User authentication required');
        return;
      }
      
      const existingUserResponse = await databases.listDocuments(
        DATABASE_ID,
        collections.users,
        [Query.equal('email', user.email)]
      );
      
      // Prepare data for database (match existing collection structure)
      const profileData = {
        // Required fields (existing structure)
        userId: user.$id,
        name: formData.fullName,
        email: formData.email,
        updatedAt: new Date().toISOString(),
        
        // Existing fields
        college: formData.college,
        branch: formData.branch,
        semester: formData.semester,
        bio: formData.bio,
        
        // New profile fields
        phone: formData.phone,
        alternatePhone: formData.alternatePhone,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        gender: formData.gender,
        collegeEmail: formData.collegeEmail,
        year: formData.year,
        enrollmentNumber: formData.enrollmentNumber,
        currentGPA: formData.currentGPA,
        interests: formData.interests,
        skills: formData.skills,
        languages: formData.languages,
        currentAddress: formData.currentAddress,
        permanentAddress: formData.permanentAddress,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        portfolioUrl: formData.portfolioUrl,
        profileImageUrl: formData.profileImageUrl,
        isProfileComplete: true,
        profileCompletedAt: new Date().toISOString(),
        preferredLanguage: formData.preferredLanguage,
        notificationPreferences: JSON.stringify(formData.notificationPreferences)
      };

      console.log('Saving profile data:', profileData);
      
      if (existingUserResponse.documents.length > 0) {
        // Update existing user document
        const existingUser = existingUserResponse.documents[0];
        await databases.updateDocument(
          DATABASE_ID,
          collections.users,
          existingUser.$id,
          profileData
        );
        console.log('✅ Updated existing user profile');
      } else {
        // Create new user document
        const newUserData = {
          ...profileData,
          createdAt: new Date().toISOString(),
          joinDate: new Date().toISOString(),
          totalPoints: 0,
          notesUploaded: 0,
          notesDownloaded: 0,
          requestsFulfilled: 0,
          communityPosts: 0,
          rank: 0,
          points: 0,
          dailyLoginStreak: 0,
          role: 'student',
          level: 'beginner',
          status: 'active',
          isVerified: false
        };
        
        await databases.createDocument(
          DATABASE_ID,
          collections.users,
          ID.unique(),
          newUserData
        );
        console.log('✅ Created new user profile');
      }
      
      // Show success message and redirect
      console.log('✅ Profile completed successfully!');
      setSuccess(true);
      
      // Redirect to dashboard after profile completion
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500); // Give user time to see success message
      
    } catch (error: any) {
      console.error('Profile save error:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip profile completion
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-4">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto overflow-hidden">
              {profileImage || formData.profileImageUrl ? (
                <Image 
                  src={profileImage || formData.profileImageUrl} 
                  alt="Profile" 
                  fill
                  className="object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {imageUploading ? (
                <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
              ) : (
                <Camera className="h-4 w-4 text-gray-600" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to JEHUB, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-gray-600">
            Let&apos;s complete your profile to give you a personalized experience
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 text-green-500 flex-shrink-0">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Profile completed successfully!</p>
                  <p className="text-xs text-green-600 mt-1">Redirecting to your dashboard...</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image Section */}
            {(profileImage || formData.profileImageUrl) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Image 
                      src={profileImage || formData.profileImageUrl} 
                      alt="Profile Preview" 
                      width={64}
                      height={64}
                      className="rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Profile Photo</p>
                      <p className="text-xs text-gray-500">This will be visible to other students</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                {/* Alternate Phone */}
                <div>
                  <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      id="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth (Optional)
                  </label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender (Optional)
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Gender</option>
                    {genders.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* College */}
                <div>
                  <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-2">
                    College/University (Optional)
                  </label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="college"
                      value={formData.college}
                      onChange={(e) => handleInputChange('college', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Your college or university name"
                    />
                  </div>
                </div>

                {/* College Email */}
                <div>
                  <label htmlFor="collegeEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    College Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="collegeEmail"
                      value={formData.collegeEmail}
                      onChange={(e) => handleInputChange('collegeEmail', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="student@college.edu"
                    />
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                    Branch/Stream (Optional)
                  </label>
                  <select
                    id="branch"
                    value={formData.branch}
                    onChange={(e) => handleInputChange('branch', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year (Optional)
                  </label>
                  <select
                    id="year"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Semester (Optional)
                  </label>
                  <select
                    id="semester"
                    value={formData.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>{semester}</option>
                    ))}
                  </select>
                </div>

                {/* Enrollment Number */}
                <div>
                  <label htmlFor="enrollmentNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Enrollment Number (Optional)
                  </label>
                  <input
                    type="text"
                    id="enrollmentNumber"
                    value={formData.enrollmentNumber}
                    onChange={(e) => handleInputChange('enrollmentNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Your enrollment/roll number"
                  />
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Home className="h-5 w-5 mr-2 text-purple-600" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Address */}
                <div className="md:col-span-2">
                  <label htmlFor="currentAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Address (Optional)
                  </label>
                  <textarea
                    id="currentAddress"
                    value={formData.currentAddress}
                    onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Your current residential address"
                  />
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Your city"
                    />
                  </div>
                </div>

                {/* State */}
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State (Optional)
                  </label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="India"
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode (Optional)
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="123456"
                  />
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-orange-600" />
                Personal Information
              </h3>
              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    About You (Optional)
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Tell us a bit about yourself, your interests, or goals..."
                  />
                </div>

                {/* Interests */}
                <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                    Interests & Hobbies (Optional)
                  </label>
                  <input
                    type="text"
                    id="interests"
                    value={formData.interests}
                    onChange={(e) => handleInputChange('interests', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Programming, Music, Sports, Reading..."
                  />
                </div>

                {/* Skills */}
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (Optional)
                  </label>
                  <input
                    type="text"
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Python, Java, Web Development, Design..."
                  />
                </div>

                {/* Languages */}
                <div>
                  <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-2">
                    Languages Known (Optional)
                  </label>
                  <input
                    type="text"
                    id="languages"
                    value={formData.languages}
                    onChange={(e) => handleInputChange('languages', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="English, Hindi, Bengali..."
                  />
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-indigo-600" />
                Social Links (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LinkedIn */}
                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                {/* GitHub */}
                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                {/* Portfolio */}
                <div className="md:col-span-2">
                  <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio/Website
                  </label>
                  <input
                    type="url"
                    id="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? 'Saving Profile...' : 'Complete Profile'}
              </button>
              
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="flex-1 sm:flex-none bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip for Now
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>You can always update your profile later from your account settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;

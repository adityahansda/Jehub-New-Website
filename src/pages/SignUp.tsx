import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import { userService } from '../services/userService';
import { pointsService } from '../services/pointsService';
import { NextSeo } from 'next-seo';
import { AlertCircle, Check, User, Mail, Phone, GraduationCap, MessageCircle } from 'lucide-react';
import SuccessToast from '../components/SuccessToast';

interface SignupData {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  semester: string;
  bio: string;
  telegramUsername: string;
}

const SignUp: React.FC = () => {
  const { user, refreshUserProfile, forceRefreshAuth } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<SignupData>({
    name: '',
    email: '',
    phone: '',
    college: '',
    branch: '',
    semester: '',
    bio: '',
    telegramUsername: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) {
      // If no user is logged in, redirect to login after a short delay
      // This allows time for OAuth flow to complete
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);
      
      return () => clearTimeout(timer);
    }

    // Pre-fill with user data from OAuth
    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || ''
    }));
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      console.log('Starting form submission...');
      
      // Get referral code from session storage if exists
      const referralCode = sessionStorage.getItem('referralCode');
      console.log('Signup: Found referral code in session:', referralCode);
      
      // Calculate bonus points
      const basePoints = 20; // Welcome bonus
      let referralBonus = 0; // Initialize referral bonus
      if (referralCode) {
        console.log('Validating referral code:', referralCode);
        const validation = await pointsService.validateReferralCode(referralCode);
        console.log('Referral validation result:', validation);

        if (!validation.isValid) {
          alert(validation.message);
          setLoading(false);
          return;
        }

        referralBonus = 50; // Valid referral bonus
      }

      const totalPoints = basePoints + referralBonus;
      
      // Prepare complete user profile data - only include fields that exist in database
      const profileData = {
        userId: user.$id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        college: formData.college || undefined,
        branch: formData.branch || undefined,
        semester: formData.semester || undefined,
        bio: formData.bio || undefined,
        telegramUsername: formData.telegramUsername || undefined,
        isProfileComplete: true,
        profileCompletedAt: new Date().toISOString(),
        role: 'student' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Initialize points system data - using existing database fields
        points: totalPoints, // Required points field
        notesUploaded: 0,
        notesDownloaded: 0,
        requestsFulfilled: 0,
        rank: 0,
        level: 'beginner',
        dailyLoginStreak: 1,
        lastLoginDate: new Date().toISOString(),
        joinDate: new Date().toISOString()
      };
      
      console.log('Profile data prepared:', profileData);
      
      // Check if user already exists in database
      const isRegistered = await authService.isUserRegistered(user.email);
      console.log('User registered status:', isRegistered);
      
      if (!isRegistered) {
        // Create new user profile directly in database
        console.log('Creating new user profile in database...');
        await userService.createUserProfile(profileData);
        console.log('User profile created successfully');
      } else {
        // Update existing user profile
        console.log('Updating existing user profile...');
        await userService.updateUserProfile(user.email, profileData);
        console.log('User profile updated successfully');
      }

      // Initialize points system
      try {
        console.log('Initializing points system...');
        await pointsService.initializeNewUser(user.$id, user.email, user.name, referralCode || undefined);
        console.log('Points system initialized');
      } catch (pointsError: any) {
        console.log('Points system already initialized or error:', pointsError.message);
      }

      // If there's a referral code, process it and add bonus points
      if (referralCode) {
        try {
          console.log('Processing referral for completed profile:', referralCode);
          await pointsService.processReferralCompletion(referralCode, user.$id, user.email);
          
          // Update user's points with referral bonus
          await userService.updateUserProfile(user.email, {
            points: totalPoints
          });
          
          sessionStorage.removeItem('referralCode');
          console.log('Referral processed successfully and bonus points added');
        } catch (referralError: any) {
          console.log('Referral processing error:', referralError.message);
        }
      }

      // Force refresh auth context to update all user state
      await forceRefreshAuth();
      console.log('Auth context fully refreshed');

      // Show success message with points information
      const toastMessage = referralCode 
        ? `🎉 Sign up successful! You earned ${basePoints} welcome points + ${referralBonus} referral bonus = ${totalPoints} total points!`
        : `🎉 Sign up successful! You earned ${basePoints} welcome points!`;
      
      // Display success toast
      setSuccessMessage(toastMessage);
      setShowSuccessToast(true);

      // Redirect to home page after a short delay to show the toast
      setTimeout(() => {
        console.log('Redirecting to home page...');
        router.push('/');
      }, 3000);

    } catch (error: any) {
      console.error('Error completing signup:', error);
      setError(error.message || 'Failed to complete signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStep1Valid = formData.name && formData.email && formData.phone;
  const isStep2Valid = formData.college && formData.branch;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NextSeo
        title="Complete Your Profile - JEHUB"
        description="Complete your profile to access all JEHUB features"
      />

      <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="mt-2 text-gray-600">
              Just a few essential details to get you started with JEHUB
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  step >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                }`}>
                  {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <span className="ml-2 text-sm font-medium">Basic Info</span>
              </div>
              <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  step >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Academic Info</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Basic Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStep1Valid}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Information */}
              {step === 2 && (
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                    Academic Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        College/University *
                      </label>
                      <input
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Indian Institute of Technology Delhi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch/Department *
                      </label>
                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Branch</option>
                        <option value="computer-science">Computer Science Engineering</option>
                        <option value="mechanical">Mechanical Engineering</option>
                        <option value="electrical">Electrical Engineering</option>
                        <option value="civil">Civil Engineering</option>
                        <option value="electronics">Electronics & Communication</option>
                        <option value="chemical">Chemical Engineering</option>
                        <option value="aerospace">Aerospace Engineering</option>
                        <option value="biotechnology">Biotechnology</option>
                        <option value="information-technology">Information Technology</option>
                        <option value="other">Other</option>
                      </select>
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Semester
                      </label>
                      <select
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Semester</option>
                        <option value="1">1st Semester</option>
                        <option value="2">2nd Semester</option>
                        <option value="3">3rd Semester</option>
                        <option value="4">4th Semester</option>
                        <option value="5">5th Semester</option>
                        <option value="6">6th Semester</option>
                        <option value="7">7th Semester</option>
                        <option value="8">8th Semester</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MessageCircle className="w-4 h-4 inline mr-1" />
                        Telegram Username
                      </label>
                      <input
                        type="text"
                        name="telegramUsername"
                        value={formData.telegramUsername}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="@username (for community groups)"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description about yourself (optional)"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !isStep2Valid}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Completing...
                        </>
                      ) : (
                        'Complete Profile'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Benefits Info */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🎉 What&apos;s Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">20</span>
                </div>
                <span>Welcome bonus points</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold">+50</span>
                </div>
                <span>Referral bonus (if referred)</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold">∞</span>
                </div>
                <span>Access to engineering notes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Success Toast Notification */}
      <SuccessToast 
        message={successMessage}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        autoClose={3000}
      />
    </>
  );
};

export default SignUp;

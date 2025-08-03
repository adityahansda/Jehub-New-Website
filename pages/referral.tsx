import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import { pointsService, UserPoints, PointsTransaction } from '../src/services/pointsService';
import { userService } from '../src/services/userService';
import { NextSeo } from 'next-seo';

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
  conversionRate: number;
  referrals: any[];
}

const ReferralDashboard: React.FC = () => {
  const router = useRouter();
  const { user, loading, isVerified, userProfile } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints>({ totalPoints: 0, availablePoints: 0, pointsSpent: 0, totalReferrals: 0 });
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [referralCode, setReferralCode] = useState<string>('');
  const [loadingData, setLoadingData] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isWelcome, setIsWelcome] = useState(false);

  useEffect(() => {
    if (router.query.welcome === 'true') {
      setIsWelcome(true);
    }
  }, [router.query]);

  // Enhanced access control - only allow logged in and verified users
  useEffect(() => {
    if (!loading) {
      // Case 1: No user at all - redirect to login
      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/auth/login?redirect=/referral');
        return;
      }
      
      // Case 2: User exists but not verified in database - redirect to signup
      if (user && !isVerified) {
        console.log('User not verified in database, redirecting to signup');
        router.push('/auth/signup?redirect=/referral');
        return;
      }
      
      // Case 3: User verified but profile incomplete - redirect to signup
      if (user && isVerified && userProfile && !userProfile.isProfileComplete) {
        console.log('User profile incomplete, redirecting to signup');
        router.push('/auth/signup?redirect=/referral');
        return;
      }
    }

    const loadUserData = async () => {
    try {
      setLoadingData(true);
      
      // Load user points using email-based approach
      const points = await pointsService.getUserPointsByEmail(user!.email);
      setUserPoints(points);

      // Load referral stats
      const stats = await pointsService.getReferralStats(user!.$id);
      setReferralStats(stats);

      // Load recent transactions
      const userTransactions = await pointsService.getUserTransactions(user!.$id, 10);
      setTransactions(userTransactions);

      // Get user's referral code from the database using email
      const userReferralCode = await getUserReferralCodeByEmail(user!.email);
      if (userReferralCode) {
        setReferralCode(userReferralCode);
      } else {
        console.error('No referral code found for user:', user!.email);
        setReferralCode('ERROR');
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoadingData(false);
    }
    };

    if (user && user.email) {
      loadUserData();
    }
  }, [user, loading, router]);

  const getUserReferralCodeByEmail = async (email: string): Promise<string | null> => {
    try {
      console.log('Fetching referral code for user email:', email);
      
      // Get user profile by email to fetch their existing referral code
      const userProfile = await userService.getUserProfile(email);
      
      if (userProfile && userProfile.referralCode) {
        console.log('Found existing referral code:', userProfile.referralCode);
        return userProfile.referralCode;
      } else {
        console.warn('No referral code found for user:', email);
        return null;
      }
    } catch (error) {
      console.error('Error fetching referral code:', error);
      return null;
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyReferralLink = () => {
    // Use localhost for development, production URL for production
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : (process.env.NEXT_PUBLIC_BASE_URL || 'https://jehub.vercel.app');
    
    // Use correct path - /login not /auth/login
    const referralLink = `${baseUrl}/login?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareOnWhatsApp = () => {
    // Use localhost for development, production URL for production
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : (process.env.NEXT_PUBLIC_BASE_URL || 'https://jehub.vercel.app');
    
    // Use correct path - /login not /auth/login
    const referralLink = `${baseUrl}/login?ref=${referralCode}`;
    const message = `🎓 Join JEHUB - Get Engineering Notes & Earn Points!\n\nUse my referral link to get 20 bonus points:\n${referralLink}\n\n✅ Free engineering notes\n✅ Earn points for downloads\n✅ Refer friends and earn more!\n\n#JEHUB #EngineeringNotes #StudyMaterials`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnTelegram = () => {
    // Use localhost for development, production URL for production
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : (process.env.NEXT_PUBLIC_BASE_URL || 'https://jehub.vercel.app');
    
    // Use correct path - /login not /auth/login
    const referralLink = `${baseUrl}/login?ref=${referralCode}`;
    const message = `🎓 Join JEHUB - Engineering Notes Platform!\n\nGet 20 bonus points with my referral link: ${referralLink}\n\n✨ Features:\n• Free engineering notes\n• Points-based download system\n• Earn points by referring friends\n• Upload your notes for bonus points\n\nJoin now and start earning points! 🚀`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied for unauthorized users
  if (!user || !isVerified || (userProfile && !userProfile.isProfileComplete)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              {!user ? 'Please sign in to access your referral dashboard.' : 
               !isVerified ? 'Please complete your account setup to access referrals.' :
               'Please complete your profile to access the referral system.'}
            </p>
            <div className="space-y-3">
              {!user ? (
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Complete Profile
                </button>
              )}
              <button
                onClick={() => router.push('/')}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while fetching user data
  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your referral dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NextSeo
        title="Referral Dashboard - JEHUB"
        description="Manage your referrals and earn points on JEHUB"
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Welcome Message for New Users */}
          {isWelcome && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">Welcome to JEHUB! 🎉</h3>
                  <p className="mt-1">You&apos;ve received 20 welcome bonus points! Start referring friends to earn even more points.</p>
                </div>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Referral Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Refer friends and earn points to download premium notes!
            </p>
          </div>

          {/* Points Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Available Points</p>
                  <p className="text-2xl font-bold text-blue-600">{userPoints.availablePoints}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Earned</p>
                  <p className="text-2xl font-bold text-green-600">{userPoints.totalPoints}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Referrals</p>
                  <p className="text-2xl font-bold text-purple-600">{userPoints.totalReferrals}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Points Spent</p>
                  <p className="text-2xl font-bold text-red-600">{userPoints.pointsSpent}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Referral Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Share & Earn Points</h2>
                <p className="text-sm text-gray-600 mt-1">Refer friends and earn 50 points for each successful signup!</p>
              </div>
              
              <div className="p-6">
                {/* Referral Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Referral Code</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={referralCode}
                      readOnly
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 bg-gray-50 text-gray-900 font-mono"
                    />
                    <button
                      onClick={copyReferralCode}
                      className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-md hover:bg-blue-700 transition-colors"
                    >
                      {copiedCode ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Referral Link</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={(() => {
                        const baseUrl = process.env.NODE_ENV === 'development' 
                          ? 'http://localhost:3000' 
                          : (process.env.NEXT_PUBLIC_BASE_URL || 'https://jehub.vercel.app');
                        return `${baseUrl}/login?ref=${referralCode}`;
                      })()}
                      readOnly
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 bg-gray-50 text-gray-900 text-sm"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="px-4 py-2 bg-green-600 text-white border border-green-600 rounded-r-md hover:bg-green-700 transition-colors"
                    >
                      {copiedLink ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Share on Social Media</h3>
                  
                  <button
                    onClick={shareOnWhatsApp}
                    className="w-full flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.688"/>
                    </svg>
                    Share on WhatsApp
                  </button>

                  <button
                    onClick={shareOnTelegram}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Share on Telegram
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-600 mt-1">Your latest points transactions</p>
              </div>
              
              <div className="p-6">
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction, index) => (
                      <div key={transaction.$id || index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.points > 0 ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.points > 0 ? (
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{transaction.type.replace('_', ' ').toUpperCase()}</p>
                          </div>
                        </div>
                        <div className={`text-sm font-semibold ${
                          transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No transactions yet. Start referring friends to earn points!</p>
                )}
              </div>
            </div>
          </div>

          {/* Points Guide */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">How to Earn Points 🎯</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-800 font-bold text-sm">50</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Successful Referral</h4>
                  <p className="text-sm text-blue-700">Earn 50 points when someone signs up with your referral code</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-800 font-bold text-sm">30</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Upload Notes</h4>
                  <p className="text-sm text-blue-700">Get 30 points for each approved note you upload</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-800 font-bold text-sm">20</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Welcome Bonus</h4>
                  <p className="text-sm text-blue-700">New users get 20 points for joining JEHUB</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-yellow-800 font-bold text-sm">5</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Daily Login</h4>
                  <p className="text-sm text-blue-700">Earn 5 points for logging in daily</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-white rounded border-l-4 border-blue-400">
              <h4 className="font-medium text-blue-900 mb-2">💡 How to Use Points</h4>
              <p className="text-sm text-blue-700">
                Use your points to download premium notes! Most notes cost between 10-50 points depending on their quality and demand. 
                Keep earning points by referring friends and uploading valuable study materials!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferralDashboard;

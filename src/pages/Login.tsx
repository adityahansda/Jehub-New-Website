import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import { NextSeo } from 'next-seo';

const Login = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState<string>('');

  const { user, isVerified } = useAuth();
  const router = useRouter();

  // Check for errors and referral code in URL params
  useEffect(() => {
    if (router.query.error) {
      switch (router.query.error) {
        case 'oauth_failed':
          setError('Google sign-in failed. Please try again.');
          break;
        case 'initialization_failed':
          // Account setup failed means user not in database - redirect to signup
          router.push('/auth/signup');
          return;
        case 'not_registered':
          const email = router.query.email as string;
          setError(`Account with email ${email} is not registered. Please sign up first.`);
          break;
        default:
          setError('An error occurred. Please try again.');
      }
    }

    // Check for referral code in URL
    if (router.query.ref && typeof router.query.ref === 'string') {
      setReferralCode(router.query.ref);
    }
  }, [router.query, router]);

  // Redirect if already logged in and verified
  useEffect(() => {
    if (user && isVerified) {
      alert('You are already signed in.');
      router.push('/');
      return;
    } else if (user && !isVerified) {
      // User is authenticated but not registered in database - redirect to signup
      router.push('/auth/signup');
    }
  }, [user, isVerified, router]);


  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      // Always allow Google login - registration check happens in OAuth callback
      // Pass referral code to auth service
      await authService.loginWithGoogle(referralCode || undefined);
      // The redirect will be handled by the OAuth flow
    } catch (error: any) {
      setError(error.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      // Redirect to signup with Google
      await authService.signupWithGoogle(referralCode || undefined);
      // The redirect will be handled by the OAuth flow
    } catch (error: any) {
      setError(error.message || 'Google sign-up failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <NextSeo
        title="Login - JEHUB"
        description="Sign in to JEHUB to access engineering notes and earn points"
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">JEHUB</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">
              Sign in with Google to access your notes and points
            </p>
          </div>

          {/* Referral Code Display */}
          {referralCode && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    🎉 You&apos;ve been referred!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Referral Code: <span className="font-mono font-semibold">{referralCode}</span>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Sign up now to get 20 bonus points, and your referrer will earn 50 points!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <div className="space-y-6">
              {/* Notice about Google-only login */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      🔐 Secure Google Sign-In Only
                    </h3>
                    <p className="text-xs text-blue-700 mt-1">
                      For enhanced security, we only support Google authentication.
                    </p>
                  </div>
                </div>
              </div>


              {/* Google Authentication Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border-2 border-blue-500 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {googleLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </div>
                  )}
                </button>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    📄 New to JEHUB? No problem! We&apos;ll help you sign up during the process.
                  </p>
                </div>
              </div>

              {/* Features Preview */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">What you&apos;ll get:</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Access to thousands of engineering notes
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Earn points for referrals and uploads
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Download premium notes with points
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Share notes with the community
                  </div>
                </div>
              </div>

              {/* Points System Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">🎯 Points System</h3>
                <div className="text-xs text-blue-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Welcome Bonus:</span>
                    <span className="font-semibold">+20 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Successful Referral:</span>
                    <span className="font-semibold">+50 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Upload Notes:</span>
                    <span className="font-semibold">+30 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Note Download:</span>
                    <span className="font-semibold">-10 to -50 points</span>
                  </div>
                </div>
              </div>

              {/* Privacy Note */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                  {' '}and{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
                </p>
              </div>
            </div>
          </div>

          {/* Help Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
                Contact Support
              </a>
            </p>
            <p className="text-sm text-gray-600">
              Don&apos;t have a referral code?{' '}
              <span className="text-gray-500">No problem! You&apos;ll still get the welcome bonus.</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

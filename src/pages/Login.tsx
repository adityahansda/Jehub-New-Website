import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NextSeo } from 'next-seo';
import Link from 'next/link';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, loginWithGoogle } = useAuth();
  const router = useRouter();

  // Set error from URL parameters
  useEffect(() => {
    if (router.query.error === 'oauth_failed') {
      setError('Google authentication failed. Please try again.');
    }
  }, [router.query.error]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = router.query.redirect as string;
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Store redirect URL if present
      const redirectTo = router.query.redirect as string;
      if (redirectTo) {
        sessionStorage.setItem('redirectAfterLogin', redirectTo);
      }

      await loginWithGoogle();
    } catch (error: any) {
      setError(error.message || 'Google login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        {/* Page-specific security meta tags */}
        <meta name="login-type" content="oauth-only" />
        <meta name="authentication-method" content="google-oauth" />
        <meta name="credential-policy" content="google-oauth-only" />
        <meta name="form-purpose" content="oauth-redirect" />
        <link rel="canonical" href="https://jehub.vercel.app/login" />
      </Head>
      
      <NextSeo
        title="Secure Login - JEHUB | Jharkhand Engineer's Hub"
        description="Secure OAuth login to JEHUB - Access engineering study materials and notes with Google authentication"
        canonical="https://jehub.vercel.app/login"
        openGraph={{
          title: 'Secure Login - JEHUB',
          description: 'Access engineering study materials with secure Google authentication',
          url: 'https://jehub.vercel.app/login',
          type: 'website',
          site_name: 'JEHUB - Jharkhand Engineer\'s Hub'
        }}
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">JEHUB</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Welcome to Jharkhand Engineer's Hub
            </h2>
            <p className="text-gray-600">
              Sign in with Google to access engineering study materials and notes
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                  {/* Troubleshooting Guide for Session/Cookie Issues */}
                  {router.query.error === 'oauth_failed' && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-yellow-800 mb-1">Trouble Signing In?</h4>
                      <ul className="text-xs text-yellow-700 list-disc pl-4 space-y-1">
                        <li>Make sure you are using <b>HTTPS</b> (not HTTP) in your browser address bar.</li>
                        <li>Enable cookies for this site in your browser settings.</li>
                        <li>Try disabling browser extensions that block cookies or third-party scripts.</li>
                        <li>If using incognito/private mode, try a regular window.</li>
                        <li>If you are on localhost, try running both the frontend and Appwrite backend on the same protocol (both HTTP or both HTTPS).</li>
                        <li>If the problem persists, <a href="/contact" className="underline text-blue-700">contact support</a>.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Google OAuth Login */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to continue</h3>
              <p className="text-sm text-gray-600">Use your Google account to access JEHUB</p>
            </div>
            
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-3" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </div>
              )}
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our{' '}
                <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
                {' '}and{' '}
                <Link href="/terms-of-service" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </Link>
              </p>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

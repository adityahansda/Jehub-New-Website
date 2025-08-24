import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Info } from 'lucide-react';
import { NextSeo } from 'next-seo';

const ForgotPassword = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Password Recovery - JEHUB</title>
        <link rel="canonical" href="https://jehub.vercel.app/auth/forgot-password" />
      </Head>
      
      <NextSeo
        title="Password Recovery - JEHUB | Jharkhand Engineer's Hub"
        description="JEHUB now uses Google OAuth for secure authentication"
        canonical="https://jehub.vercel.app/auth/forgot-password"
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">JEHUB</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Password Recovery</h2>
            <p className="text-gray-600">
              We&apos;ve upgraded to Google OAuth for better security
            </p>
          </div>

          {/* Information Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-400 mt-0.5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">We now use Google Authentication</h3>
                <div className="text-sm text-blue-700 mt-2 space-y-2">
                  <p>JEHUB has switched to Google OAuth for enhanced security. This means:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>No more passwords to remember</li>
                    <li>More secure login with Google</li>
                    <li>Password recovery is handled by Google</li>
                  </ul>
                  <p className="font-medium mt-3">
                    To recover your Google account password, visit{' '}
                    <a 
                      href="https://accounts.google.com/signin/recovery" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      Google Account Recovery
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Redirect to Login */}
          <div className="bg-white py-6 px-6 shadow-lg rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-4">
              Redirecting you to the login page in 5 seconds...
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign in with Google
            </Link>
          </div>

          {/* Back to Login Link */}
          <div className="text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;

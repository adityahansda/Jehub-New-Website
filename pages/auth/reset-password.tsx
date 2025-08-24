import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Info } from 'lucide-react';
import { NextSeo } from 'next-seo';

const ResetPassword = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login immediately since this page is no longer relevant
    router.push('/login');
  }, [router]);

  return (
    <>
      <Head>
        <title>Password Reset - JEHUB</title>
        <link rel="canonical" href="https://jehub.vercel.app/auth/reset-password" />
      </Head>
      
      <NextSeo
        title="Password Reset - JEHUB | Jharkhand Engineer's Hub"
        description="JEHUB now uses Google OAuth for secure authentication"
        canonical="https://jehub.vercel.app/auth/reset-password"
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">JEHUB</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Redirecting...</h2>
            <p className="text-gray-600">
              We now use Google OAuth for authentication
            </p>
          </div>

          {/* Information Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Password reset links are no longer used. Please use Google OAuth to sign in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;

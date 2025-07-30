import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AlertCircle } from 'lucide-react';

const OAuthFailure: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page after 3 seconds
    const timer = setTimeout(() => {
      router.push('/auth/login?error=oauth_failed');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Authentication Failed
        </h2>
        <p className="text-gray-600 mb-4">
          We couldn&apos;t complete your Google sign-in. This might be because:
        </p>
        <ul className="text-left text-sm text-gray-600 mb-6 space-y-1">
          <li>• You cancelled the sign-in process</li>
          <li>• Your Google account access was denied</li>
          <li>• There was a temporary connection issue</li>
        </ul>
        <p className="text-sm text-gray-500">
          Redirecting you back to the login page...
        </p>
      </div>
    </div>
  );
};

export default OAuthFailure;

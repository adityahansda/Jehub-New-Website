import React from 'react';
import { useRouter } from 'next/router';
import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react';

const VerificationFailedPage: React.FC = () => {
  const router = useRouter();
  const { error, retry } = router.query;

  const handleRetry = () => {
    // Go back to the previous page to retry
    router.back();
  };

  const handleContactAdmin = () => {
    // You can customize this to your admin contact method
    const email = 'admin@jehub.com'; // Replace with actual admin email
    const subject = 'Role Verification Failed';
    const body = `Hello Admin,

I'm experiencing issues with role verification on the JEHUB platform.

Error Details:
- Error: ${error || 'Unknown error'}
- Time: ${new Date().toLocaleString()}
- Page: ${window.location.href}

Please help me resolve this issue.

Best regards`;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-lg shadow-lg border border-red-200 p-8">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              Verification Failed
            </h1>
            
            <p className="text-red-600 mb-4">
              We couldn't verify your account permissions.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-amber-800 mb-2">What you can do:</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Try refreshing the page or logging in again</li>
              <li>• Clear your browser cache and cookies</li>
              <li>• Check your internet connection</li>
              <li>• Contact your administrator if the issue persists</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again
            </button>

            <button
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <Home className="h-5 w-5 mr-2" />
              Login Again
            </button>

            <button
              onClick={handleContactAdmin}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Administrator
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              <Home className="h-5 w-5 mr-2" />
              Go to Home
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              If this problem continues, please contact technical support at{' '}
              <a 
                href="mailto:support@jehub.com" 
                className="text-blue-600 hover:text-blue-700 underline"
              >
                support@jehub.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationFailedPage;

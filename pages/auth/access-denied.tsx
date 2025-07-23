import React from 'react';
import { useRouter } from 'next/router';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

const AccessDeniedPage: React.FC = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Access Denied Alert */}
        <div className="bg-white rounded-lg shadow-lg border border-yellow-200 p-6 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-3 w-full">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Page Not Available
              </h3>
              
              <p className="text-yellow-700 mb-4">
                Authentication system has been removed. This access control page is no longer needed.
              </p>
              
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleGoBack}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </button>
                
                <button
                  onClick={handleGoHome}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;

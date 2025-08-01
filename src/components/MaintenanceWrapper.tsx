import React from 'react';
import { useRouter } from 'next/router';
import { useMaintenanceContext } from '../contexts/MaintenanceContext';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface MaintenanceWrapperProps {
  children: React.ReactNode;
  pagePath?: string;
}

const MaintenanceWrapper: React.FC<MaintenanceWrapperProps> = ({ children, pagePath }) => {
  const router = useRouter();
  const { isPageInMaintenance, isPageEnabled, globalMaintenance } = useMaintenanceContext();
  
  // Use the provided pagePath or derive from router
  const currentPath = pagePath || router.pathname;
  
  const isInMaintenance = isPageInMaintenance(currentPath);
  const isEnabled = isPageEnabled(currentPath);

  // If page is in maintenance mode, show maintenance page
  if (isInMaintenance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Page Under Maintenance
            </h1>
            <p className="text-gray-600">
              {globalMaintenance 
                ? "We're currently performing scheduled maintenance on our entire platform."
                : "This page is temporarily unavailable due to maintenance."
              }
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              We apologize for any inconvenience. Please check back later.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Home className="h-4 w-4" />
                Go to Homepage
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Status: {globalMaintenance ? 'Global Maintenance' : 'Page Maintenance'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If page is disabled but not in maintenance, show disabled page
  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-600">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Page Temporarily Disabled
            </h1>
            <p className="text-gray-600">
              This page is currently disabled and not available for use.
            </p>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Home className="h-4 w-4" />
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // If page is enabled and not in maintenance, render children
  return <>{children}</>;
};

export default MaintenanceWrapper;

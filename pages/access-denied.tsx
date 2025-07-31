import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Shield, 
  AlertTriangle, 
  ArrowLeft, 
  Home, 
  Lock, 
  User,
  LogIn 
} from 'lucide-react';

const AccessDenied: React.FC = () => {
  const router = useRouter();
  const { required, current, path } = router.query;

  const getRoleDisplayName = (role: string | string[] | undefined): string => {
    if (!role || Array.isArray(role)) return 'Unknown';
    
    const roleNames: Record<string, string> = {
      admin: 'Administrator',
      manager: 'Manager', 
      intern: 'Intern',
      student: 'Student',
      user: 'User'
    };
    
    return roleNames[role] || 'Unknown';
  };

  const getRoleBadgeClass = (role: string | string[] | undefined): string => {
    if (!role || Array.isArray(role)) return 'bg-gray-100 text-gray-800';
    
    const roleClasses: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      intern: 'bg-orange-100 text-orange-800',
      student: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800'
    };
    
    return roleClasses[role] || 'bg-gray-100 text-gray-800';
  };

  const isAdminRequired = required === 'admin';
  const requiredRoleName = getRoleDisplayName(required);
  const currentRoleName = getRoleDisplayName(current);

  return (
    <>
      <Head>
        <title>Access Denied - JEHUB</title>
        <meta name="description" content="You don't have permission to access this page." />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          {/* Alert Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 dark:bg-red-900/20 px-6 py-6 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-red-900 dark:text-red-100">
                    Access Denied
                  </h1>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    Insufficient permissions
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="space-y-6">
                {/* Error Message */}
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      You don't have permission to access this page.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {path && `Requested path: ${path}`}
                    </p>
                  </div>
                </div>

                {/* Role Comparison */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Permission Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Required Role:
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(required)}`}>
                        <Lock className="h-3 w-3 mr-1" />
                        {requiredRoleName}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Your Role:
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(current)}`}>
                        <User className="h-3 w-3 mr-1" />
                        {currentRoleName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Contact Option */}
                {isAdminRequired && current !== 'admin' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Need Admin Access?
                    </h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                      Contact an administrator to request elevated permissions.
                    </p>
                    <button 
                      onClick={() => {
                        // This would typically open a contact form or redirect to admin contact
                        alert('Contact admin functionality would be implemented here');
                      }}
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                    >
                      <LogIn className="h-4 w-4 mr-1" />
                      Request Admin Access
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => router.back()}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </button>
                  
                  <Link 
                    href="/dashboard"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If you believe this is an error, please contact support or try logging out and back in.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccessDenied;

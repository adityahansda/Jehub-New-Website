import React, { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { betaSettingsService } from '../services/betaSettingsService';
import { BetaAccessConfig } from '../utils/betaAccessConfig';

interface BetaAccessControlProps {
  children: ReactNode;
  pageName: string;
  requireAuth?: boolean;
}

export const BetaAccessControl: React.FC<BetaAccessControlProps> = ({ 
  children, 
  pageName, 
  requireAuth = true 
}) => {
  const { user, userProfile, loading } = useAuth();
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // If still loading, don't show anything yet
    if (loading) {
      return;
    }

    // Check access permissions
    const checkAccess = () => {
      // If authentication not required, allow access
      if (!requireAuth) {
        setHasAccess(true);
        return;
      }

      // Use the new BetaAccessConfig system
      // If beta access is disabled globally, allow access
      if (!BetaAccessConfig.isBetaAccessEnabled()) {
        setHasAccess(true);
        return;
      }

      // If page is not configured to be beta restricted, allow access
      if (!BetaAccessConfig.isPageBetaRestricted(pageName)) {
        setHasAccess(true);
        return;
      }

      // If user is not logged in, show access modal
      if (!user || !userProfile) {
        setHasAccess(false);
        setShowAccessModal(true);
        return;
      }

      // Check if user role has beta access
      if (BetaAccessConfig.userHasBetaAccess(userProfile.role)) {
        setHasAccess(true);
        setShowAccessModal(false);
      } else {
        setHasAccess(false);
        setShowAccessModal(true);
      }
    };

    checkAccess();
  }, [user, userProfile, loading, pageName, requireAuth]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-600 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  // If user has access, render the page normally
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show access restriction modal
  return (
    <>
      {/* Blurred background with the page content */}
      <div className="filter blur-sm pointer-events-none">
        {children}
      </div>

      {/* Access restriction modal */}
      <AnimatePresence>
        {showAccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 sm:p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full mx-4 border border-purple-500/30 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Icon */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  🚧 Under Development
                </h2>
                <p className="text-gray-300 text-xs sm:text-sm">
                  This feature is currently in beta testing
                </p>
              </div>

              {/* Content */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 sm:p-4">
                  <h3 className="text-purple-400 font-semibold mb-2 text-sm sm:text-base">🔒 Restricted Access</h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    <strong className="text-white">{pageName}</strong> is currently available only to:
                  </p>
                  <div className="mt-2 sm:mt-3 space-y-1 text-xs sm:text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400">•</span>
                      <span>Admin users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400">•</span>
                      <span>Team members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400">•</span>
                      <span>Managers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400">•</span>
                      <span>Interns</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400">•</span>
                      <span>Beta testers</span>
                    </div>
                  </div>
                </div>

                {!user && (
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 sm:p-4">
                    <h4 className="text-blue-400 font-semibold mb-2 text-sm sm:text-base">🔑 Get Access</h4>
                    <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3">
                      Sign in and join our beta program to access this feature.
                    </p>
                  </div>
                )}

                {user && userProfile && (
                  <div className="bg-amber-900/30 border border-amber-500/30 rounded-lg p-3 sm:p-4">
                    <h4 className="text-amber-400 font-semibold mb-2 text-sm sm:text-base">👋 Hi {user.name}!</h4>
                    <p className="text-gray-300 text-xs sm:text-sm mb-2">
                      You&apos;re logged in as: <span className="font-medium text-white">{userProfile.role || 'User'}</span>
                    </p>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      Join our beta program to unlock this feature and many more!
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-2 sm:space-y-3">
                {!user ? (
                  // Show login/signup buttons for non-authenticated users
                  <>
                    <Link
                      href="/login"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/beta-wishlist"
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Join Beta Program</span>
                    </Link>
                  </>
                ) : (
                  // Show beta program link for authenticated users
                  <>
                    <Link
                      href="/beta-wishlist"
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Join Beta Program</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Go to Dashboard</span>
                    </Link>
                  </>
                )}
                
                {/* Back button */}
                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2 px-4 sm:px-6 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  ← Go Back
                </button>
              </div>

              {/* Additional info */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700/50">
                <p className="text-gray-400 text-xs text-center leading-relaxed">
                  Questions about beta access? Contact us in our{' '}
                  <a
                    href="https://t.me/JharkhandEnginnersHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline break-words"
                  >
                    Telegram group
                  </a>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BetaAccessControl;

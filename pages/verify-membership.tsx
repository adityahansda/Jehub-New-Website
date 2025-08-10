import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../src/components/Navigation';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  Shield, 
  ExternalLink,
  Copy,
  CheckCheck
} from 'lucide-react';

interface VerificationResponse {
  is_member: boolean;
  isVerified: boolean;
  error?: string;
  user_data?: {
    user_id: number;
    username?: string;
    first_name: string;
    last_name?: string;
    display_name: string;
    status: string;
    is_active: boolean;
    joined_at: string;
  };
}

interface VerificationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: VerificationResponse;
  error?: string;
}

export default function VerifyMembership() {
  const [telegramUsername, setTelegramUsername] = useState('');
  const [verification, setVerification] = useState<VerificationState>({ status: 'idle' });
  const [copied, setCopied] = useState(false);

  // Auto-verify on page load if username is in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const usernameParam = urlParams.get('username');
    if (usernameParam) {
      setTelegramUsername(usernameParam);
      handleVerify(usernameParam);
    }
  }, []);

  const handleVerify = async (username?: string) => {
    const usernameToVerify = username || telegramUsername.trim();
    
    if (!usernameToVerify) {
      setVerification({
        status: 'error',
        error: 'Please enter your Telegram username.'
      });
      return;
    }

    setVerification({ status: 'loading' });

    try {
      const cleanUsername = usernameToVerify.startsWith('@') 
        ? usernameToVerify.substring(1) 
        : usernameToVerify;

      const response = await fetch(`/api/verify-telegram?username=${encodeURIComponent(cleanUsername)}`);
      const data: VerificationResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setVerification({
        status: 'success',
        data
      });

    } catch (error: any) {
      setVerification({
        status: 'error',
        error: error.message || 'Failed to verify membership'
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'creator':
        return 'text-purple-400 bg-purple-900/30 border-purple-400';
      case 'administrator':
        return 'text-red-400 bg-red-900/30 border-red-400';
      case 'member':
        return 'text-green-400 bg-green-900/30 border-green-400';
      default:
        return 'text-gray-400 bg-gray-900/30 border-gray-400';
    }
  };

  const renderVerificationResult = () => {
    if (verification.status === 'loading') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-8 bg-blue-900/30 border border-blue-400/30 rounded-xl"
        >
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            <p className="text-blue-200 text-lg">Verifying your membership...</p>
          </div>
        </motion.div>
      );
    }

    if (verification.status === 'error') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-8 bg-red-900/30 border border-red-400/30 rounded-xl"
        >
          <div className="flex items-start space-x-3">
            <XCircle className="h-6 w-6 text-red-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-red-200 font-semibold text-lg mb-2">Verification Failed</h3>
              <p className="text-red-300">{verification.error}</p>
            </div>
          </div>
        </motion.div>
      );
    }

    if (verification.status === 'success' && verification.data) {
      const { is_member, isVerified, user_data } = verification.data;

      if (!is_member) {
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-8 bg-amber-900/30 border border-amber-400/30 rounded-xl"
          >
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-amber-200 font-semibold text-xl mb-4">Not a Member</h3>
              <p className="text-amber-300 mb-6">
                You are not currently a member of our Telegram group.
              </p>
              <div className="space-y-4">
                <a
                  href="https://t.me/JharkhandEnginnersHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <span>Join Telegram Group</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        );
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-6"
        >
          {/* Verification Status */}
          <div className={`p-8 border rounded-xl ${
            isVerified 
              ? 'bg-green-900/30 border-green-400/30' 
              : 'bg-amber-900/30 border-amber-400/30'
          }`}>
            <div className="text-center">
              {isVerified ? (
                <>
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-green-200 font-semibold text-xl mb-2">Membership Verified! ✅</h3>
                  <p className="text-green-300">
                    You are a verified member of our Telegram group with full access to all features.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-amber-200 font-semibold text-xl mb-2">Member - Not Verified</h3>
                  <p className="text-amber-300 mb-4">
                    You are a member but need verification for full access.
                  </p>
                  <div className="bg-amber-800/30 border border-amber-600/30 rounded-lg p-4">
                    <p className="text-amber-200 text-sm mb-3">To get verified:</p>
                    <div className="space-y-2 text-left text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400 font-bold">1.</span>
                        <span className="text-amber-300">Go to the Telegram group</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400 font-bold">2.</span>
                        <span className="text-amber-300">Send the command: <code className="bg-amber-700/50 px-2 py-1 rounded">/verify</code></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400 font-bold">3.</span>
                        <span className="text-amber-300">Wait for admin verification</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* User Data Display */}
          {user_data && (
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-gray-700/50">
                <h4 className="text-white font-semibold text-lg flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Member Information</span>
                </h4>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                      <p className="text-white font-medium">{user_data.display_name}</p>
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
                      <p className="text-white font-medium">
                        @{user_data.username || 'Not set'}
                      </p>
                      {user_data.username && (
                        <button
                          onClick={() => copyToClipboard(`@${user_data.username}`)}
                          className="text-gray-400 hover:text-white transition-colors duration-200"
                          title="Copy username"
                        >
                          {copied ? <CheckCheck className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* User ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">User ID</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                      <p className="text-white font-mono text-sm">{user_data.user_id}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(user_data.status)}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user_data.status.charAt(0).toUpperCase() + user_data.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Joined</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-white">{user_data.joined_at && user_data.joined_at !== 'Unknown' ? formatDate(user_data.joined_at) : 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                {/* Activity Status */}
                <div className="pt-4 border-t border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${user_data.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-white font-medium">
                      {user_data.is_active ? 'Active Member' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      );
    }

    return null;
  };

  return (
    <>
      <Head>
        <title>Telegram Membership Verification - JEHub</title>
        <meta name="description" content="Verify your Telegram group membership and access exclusive features." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://jehub.in/verify-membership" />
      </Head>

      <Navigation />

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-600 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Telegram Membership Verification
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Verify your membership in our Telegram group to access exclusive features and content.
              </p>
            </div>

            {/* Verification Form */}
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl overflow-hidden border border-purple-500/30">
              <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 px-8 py-6">
                <h2 className="text-2xl font-bold text-white text-center">
                  🔍 Check Your Membership Status
                </h2>
              </div>

              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="telegram-username" className="block text-sm font-medium text-gray-300 mb-2">
                      Telegram Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="telegram-username"
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                        placeholder="Enter your username (without @)"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all duration-200"
                        disabled={verification.status === 'loading'}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-400 text-sm">@</span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      Enter your Telegram username without the @ symbol
                    </p>
                  </div>

                  <button
                    onClick={() => handleVerify()}
                    disabled={verification.status === 'loading' || !telegramUsername.trim()}
                    className="w-full flex justify-center items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600"
                  >
                    {verification.status === 'loading' ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Verify Membership
                      </>
                    )}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {renderVerificationResult()}
                </AnimatePresence>
              </div>
            </div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 bg-gray-900/50 border border-gray-700/50 rounded-xl p-8"
            >
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <h4 className="text-lg font-medium text-white mb-2">Join Our Group</h4>
                  <p className="text-gray-400 mb-4 text-sm">
                    Not a member yet? Join our Telegram group to get started.
                  </p>
                  <a
                    href="https://t.me/JharkhandEnginnersHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    <span>Join Group</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                
                <div className="text-center">
                  <h4 className="text-lg font-medium text-white mb-2">Get Verified</h4>
                  <p className="text-gray-400 mb-4 text-sm">
                    Already a member? Use the /verify command in the group.
                  </p>
                  <a
                    href="https://t.me/JharkhandEnginnersHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    <span>Send /verify</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

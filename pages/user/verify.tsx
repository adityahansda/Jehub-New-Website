
import React, { useState } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../src/components/dashboard/DashboardLayout';
import { useAuth } from '../../src/contexts/AuthContext';
import { Loader2, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface VerificationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function VerifyPage() {
  const { user } = useAuth();
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);

  const handleVerify = async () => {
    if (!telegramUsername) {
      setVerificationStatus({
        type: 'error',
        message: 'Please enter your Telegram username.',
      });
      return;
    }

    setIsLoading(true);
    setVerificationStatus(null);

    try {
      const response = await fetch(`/api/verify-telegram?username=${telegramUsername}`);
      const data = await response.json();

      if (response.ok) {
        if (data.isVerified) {
          setVerificationStatus({
            type: 'success',
            message: 'You are already a verified member!',
          });
        } else if (data.is_member) {
          setVerificationStatus({
            type: 'info',
            message: 'You are a member but not yet verified. Please use the /verify command in the Telegram group.',
          });
        } else {
          setVerificationStatus({
            type: 'error',
            message: 'You are not a member of the Telegram group. Please join the group and try again.',
          });
        }
      } else {
        setVerificationStatus({
          type: 'error',
          message: data.error || 'An unexpected error occurred.',
        });
      }
    } catch (error) {
      setVerificationStatus({
        type: 'error',
        message: 'Failed to connect to the verification service.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatus = () => {
    if (!verificationStatus) return null;

    const { type, message } = verificationStatus;
    let icon;
    let bgColor;
    let textColor;

    switch (type) {
      case 'success':
        icon = <CheckCircle className="h-5 w-5" />;
        bgColor = 'bg-green-100 dark:bg-green-900/20';
        textColor = 'text-green-800 dark:text-green-200';
        break;
      case 'info':
        icon = <HelpCircle className="h-5 w-5" />;
        bgColor = 'bg-blue-100 dark:bg-blue-900/20';
        textColor = 'text-blue-800 dark:text-blue-200';
        break;
      case 'error':
        icon = <AlertCircle className="h-5 w-5" />;
        bgColor = 'bg-red-100 dark:bg-red-900/20';
        textColor = 'text-red-800 dark:text-red-200';
        break;
      default:
        return null;
    }

    return (
      <div className={`mt-6 p-4 rounded-lg flex items-center space-x-3 ${bgColor} ${textColor}`}>
        {icon}
        <p className="text-sm font-medium">{message}</p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Verify Telegram Membership - JEHUB</title>
        <meta name="description" content="Verify your Telegram group membership for full access to JEHUB features." />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Your Membership</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Enter your Telegram username to confirm you&apos;ve joined our group.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="telegram-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Telegram Username
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="telegram-username"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    placeholder="@yourusername"
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
              <button
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Now'}
              </button>
            </div>
            {renderStatus()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


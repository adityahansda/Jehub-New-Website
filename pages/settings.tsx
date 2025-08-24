import React from 'react';
import Head from 'next/head';
import Layout from '../src/components/Layout';
import ThemeToggle from '../src/components/common/ThemeToggle';
import { useTheme } from '../src/contexts/ThemeContext';
import {
  Settings as SettingsIcon,
  Palette,
  Sun,
  Moon,
  Monitor,
  Bell,
  Shield,
  Globe,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const { darkMode } = useTheme();

  return (
    <Layout>
      <Head>
        <title>Settings - JEHUB Dashboard</title>
        <meta name="description" content="Configure your dashboard preferences and account settings" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <SettingsIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your account and dashboard preferences</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Appearance Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Palette className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred color scheme</p>
                  </div>
                  <ThemeToggle variant="default" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    !darkMode ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                        <Sun className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Light Mode</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Clean and bright interface</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    darkMode ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                        <Moon className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Easy on the eyes</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer transition-all duration-200 opacity-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-800 rounded-lg flex items-center justify-center">
                        <Monitor className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">System</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Match system preference</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 opacity-75">
                <div className="flex items-center space-x-3 mb-4">
                  <Bell className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Configure how you receive notifications</p>
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Coming Soon</strong> - Email, push, and SMS notification preferences
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 opacity-75">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Manage your privacy and security settings</p>
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Coming Soon</strong> - Profile visibility, data sharing, and account security
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { account, databases } from '../lib/appwrite';
import { ID, Permission, Role } from 'appwrite';

interface StatusCheck {
  name: string;
  status: 'loading' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const SystemStatus: React.FC = () => {
  const [checks, setChecks] = useState<StatusCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateCheck = (name: string, status: StatusCheck['status'], message: string, details?: string) => {
    setChecks(prev => {
      const existing = prev.find(check => check.name === name);
      if (existing) {
        return prev.map(check => 
          check.name === name ? { ...check, status, message, details } : check
        );
      }
      return [...prev, { name, status, message, details }];
    });
  };

  const runSystemChecks = async () => {
    setIsRunning(true);
    setChecks([]);

    // 1. Check Appwrite Connection
    updateCheck('appwrite-connection', 'loading', 'Checking Appwrite connection...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/health`);
      if (response.ok) {
        updateCheck('appwrite-connection', 'success', 'Appwrite server is reachable');
      } else {
        updateCheck('appwrite-connection', 'error', 'Appwrite server returned error', `Status: ${response.status}`);
      }
    } catch (error) {
      updateCheck('appwrite-connection', 'error', 'Cannot reach Appwrite server', String(error));
    }

    // 2. Check User Session
    updateCheck('user-session', 'loading', 'Checking user session...');
    try {
      const user = await account.get();
      updateCheck('user-session', 'success', `Logged in as: ${user.email}`);
    } catch (error: any) {
      if (error.code === 401) {
        updateCheck('user-session', 'success', 'No active session (normal for anonymous users)');
      } else {
        updateCheck('user-session', 'error', 'Session check failed', error.message);
      }
    }

    // 3. Test User Registration
    updateCheck('user-registration', 'loading', 'Testing user registration...');
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      const testName = 'Test User';
      
      const newUser = await account.create(ID.unique(), testEmail, testPassword, testName);
      updateCheck('user-registration', 'success', 'User registration works');
      
      // Clean up test user
      try {
        await account.createEmailPasswordSession(testEmail, testPassword);
        await account.deleteSession('current');
      } catch (cleanupError) {
        console.warn('Could not clean up test user:', cleanupError);
      }
    } catch (error: any) {
      updateCheck('user-registration', 'error', 'User registration failed', `${error.message} (Code: ${error.code})`);
    }

    // 4. Test Database Connection
    updateCheck('database-connection', 'loading', 'Testing database connection...');
    try {
      const testData = {
        userId: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        avatar: '',
        joinDate: new Date().toISOString(),
        role: 'user',
        totalPoints: 0,
        points: 0,
        notesUploaded: 0,
        notesDownloaded: 0,
        requestsFulfilled: 0,
        communityPosts: 0,
        rank: 0,
        level: 'Beginner',
        lastLoginDate: new Date().toISOString(),
        dailyLoginStreak: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        ID.unique(),
        testData,
        [
          Permission.read(Role.user('test-user-id')),
          Permission.write(Role.user('test-user-id')),
          Permission.read(Role.any()),
        ]
      );
      
      updateCheck('database-connection', 'success', 'Database operations work');
    } catch (error: any) {
      updateCheck('database-connection', 'error', 'Database operation failed', `${error.message} (Code: ${error.code})`);
    }

    // 5. Check Environment Variables
    updateCheck('environment', 'loading', 'Checking environment variables...');
    const requiredEnvVars = [
      'NEXT_PUBLIC_APPWRITE_ENDPOINT',
      'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
      'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
      'NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length === 0) {
      updateCheck('environment', 'success', 'All required environment variables are set');
    } else {
      updateCheck('environment', 'error', 'Missing environment variables', missingVars.join(', '));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: StatusCheck['status']) => {
    switch (status) {
      case 'loading':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: StatusCheck['status']) => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
        <button
          onClick={runSystemChecks}
          disabled={isRunning}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running Checks...' : 'Run System Checks'}
        </button>
      </div>

      {checks.length > 0 && (
        <div className="space-y-4">
          {checks.map((check, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${getStatusColor(check.status)}`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{check.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                  {check.details && (
                    <p className="text-xs text-gray-500 mt-2 font-mono bg-gray-100 p-2 rounded">
                      {check.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {checks.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          <p>Click &quot;Run System Checks&quot; to test all components</p>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;

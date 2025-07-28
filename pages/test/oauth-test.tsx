import React, { useState, useEffect } from 'react';
import { account } from '../../src/lib/appwrite';
import { authService } from '../../src/services/auth';

const OAuthTest: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${type.toUpperCase()}: ${message}`]);
  };

  useEffect(() => {
    checkCurrentSession();
  }, []);

  const checkCurrentSession = async () => {
    try {
      addLog('Checking current session...');
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        addLog(`Current user: ${user.name} (${user.email})`, 'success');
      } else {
        addLog('No active session found');
      }
    } catch (error: any) {
      addLog(`Session check failed: ${error.message}`, 'error');
    }
  };

  const testGoogleOAuth = async () => {
    try {
      addLog('Testing Google OAuth configuration...');
      
      if (typeof window === 'undefined') {
        addLog('Window not available (SSR mode)', 'error');
        return;
      }
      
      // Check if we can call the OAuth method
      const successUrl = `${window.location.origin}/auth/oauth-success`;
      const failureUrl = `${window.location.origin}/auth/oauth-failure`;
      
      addLog(`Success URL: ${successUrl}`);
      addLog(`Failure URL: ${failureUrl}`);
      
      // This will redirect, so we won't see logs after this
      addLog('Initiating Google OAuth flow...');
      await authService.loginWithGoogle();
      
    } catch (error: any) {
      addLog(`OAuth test failed: ${error.message}`, 'error');
    }
  };

  const testAppwriteConnection = async () => {
    try {
      addLog('Testing Appwrite connection...');
      
      // Test basic Appwrite connection
      const response = await fetch(`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/health`);
      if (response.ok) {
        addLog('Appwrite connection successful', 'success');
      } else {
        addLog(`Appwrite connection failed: ${response.status}`, 'error');
      }
    } catch (error: any) {
      addLog(`Appwrite connection error: ${error.message}`, 'error');
    }
  };

  const clearLogs = () => setLogs([]);

  const logout = async () => {
    try {
      addLog('Logging out...');
      await authService.logout();
      setCurrentUser(null);
      addLog('Logout successful', 'success');
    } catch (error: any) {
      addLog(`Logout failed: ${error.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">OAuth Diagnostic Tool</h1>
        
        {/* Current User Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Authentication Status</h2>
          {currentUser ? (
            <div className="text-green-600">
              <p><strong>Logged in as:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>User ID:</strong> {currentUser.$id}</p>
              <button
                onClick={logout}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <p className="text-red-600">Not authenticated</p>
          )}
          <button
            onClick={checkCurrentSession}
            className="mt-4 ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh Status
          </button>
        </div>

        {/* Configuration Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Appwrite Endpoint:</strong>
              <p className="text-gray-600 break-all">{process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}</p>
            </div>
            <div>
              <strong>Project ID:</strong>
              <p className="text-gray-600">{process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}</p>
            </div>
            <div>
              <strong>Success URL:</strong>
              <p className="text-gray-600 break-all">{typeof window !== 'undefined' ? `${window.location.origin}/auth/oauth-success` : 'http://localhost:3000/auth/oauth-success'}</p>
            </div>
            <div>
              <strong>Failure URL:</strong>
              <p className="text-gray-600 break-all">{typeof window !== 'undefined' ? `${window.location.origin}/auth/oauth-failure` : 'http://localhost:3000/auth/oauth-failure'}</p>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          <div className="space-x-4">
            <button
              onClick={testAppwriteConnection}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Appwrite Connection
            </button>
            <button
              onClick={testGoogleOAuth}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Google OAuth
            </button>
            <button
              onClick={clearLogs}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p>No logs yet. Click a test button to start.</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthTest;

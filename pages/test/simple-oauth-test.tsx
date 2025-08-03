import React, { useState, useEffect } from 'react';
import { authService } from '../../src/services/auth';

const SimpleOAuthTest: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const checkCurrentSession = async () => {
    try {
      addLog('Checking current session...');
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        addLog(`Current user: ${user.name} (${user.email})`);
        
        // Check if registered
        const isRegistered = await authService.isUserRegistered(user.email);
        addLog(`User registered in database: ${isRegistered}`);
      } else {
        addLog('No active session found');
        setCurrentUser(null);
      }
    } catch (error: any) {
      addLog(`Session check failed: ${error.message}`);
    }
  };

  const testGoogleOAuth = async () => {
    try {
      addLog('Starting Google OAuth test...');
      addLog(`Current URL: ${window.location.origin}`);
      addLog(`Success URL: ${window.location.origin}/auth/oauth-success`);
      addLog(`Failure URL: ${window.location.origin}/auth/oauth-failure`);
      
      await authService.loginWithGoogle();
      
    } catch (error: any) {
      addLog(`OAuth test failed: ${error.message}`);
    }
  };

  const logout = async () => {
    try {
      addLog('Logging out...');
      await authService.logout();
      setCurrentUser(null);
      addLog('Logout successful');
    } catch (error: any) {
      addLog(`Logout failed: ${error.message}`);
    }
  };

  const clearLogs = () => setLogs([]);

  useEffect(() => {
    checkCurrentSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Simple OAuth Test</h1>
        
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

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          <div className="space-x-4">
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

        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment</h2>
          <div className="text-sm space-y-2">
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            <p><strong>Appwrite Endpoint:</strong> {process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}</p>
            <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}</p>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
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

export default SimpleOAuthTest;

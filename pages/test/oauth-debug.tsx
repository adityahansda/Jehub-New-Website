import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { account } from '../../src/lib/appwrite';
import { authService } from '../../src/services/auth';

const OAuthDebug: React.FC = () => {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addLog = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  }, []);

  const checkCurrentSession = useCallback(async () => {
    try {
      addLog('Checking current session...');
      
      // Check for session cookies
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';').map(c => c.trim());
        const sessionCookies = cookies.filter(c => c.includes('session') || c.includes('a_session'));
        addLog(`Found cookies: ${cookies.length}, Session cookies: ${sessionCookies.length}`);
        
        if (sessionCookies.length > 0) {
          addLog(`Session cookies: ${sessionCookies.join(', ')}`);
        }
      }

      // Try to get current user
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        addLog(`Current user: ${user.name} (${user.email})`, 'success');
        
        // Get session info
        try {
          const session = await account.getSession('current');
          setSessionInfo(session);
          addLog(`Session info: Provider=${session.provider}, Created=${session.$createdAt}`, 'success');
        } catch (sessionError: any) {
          addLog(`Session info error: ${sessionError.message}`, 'error');
        }
      } else {
        addLog('No active user session found');
      }
    } catch (error: any) {
      addLog(`Session check error: ${error.message}`, 'error');
    }
  }, [addLog]);

  useEffect(() => {
    if (isClient) {
      addLog('OAuth Debug page loaded');
      checkCurrentSession();
    }
  }, [isClient, addLog, checkCurrentSession]);

  const testOAuth = async () => {
    addLog('Starting OAuth test...');
    try {
      addLog('Checking OAuth configuration...');
      addLog(`Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
      addLog(`Project ID: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
      
      if (isClient) {
        const successUrl = `${window.location.origin}/auth/oauth-success`;
        const failureUrl = `${window.location.origin}/auth/oauth-failure`;
        
        addLog(`Success URL: ${successUrl}`);
        addLog(`Failure URL: ${failureUrl}`);
        
        addLog('Initiating Google OAuth...');
        await authService.loginWithGoogle();
      }
    } catch (error: any) {
      addLog(`OAuth test failed: ${error.message}`, 'error');
    }
  };

  const testDirectOAuth = async () => {
    addLog('Testing direct OAuth call...');
    try {
      if (isClient) {
        const successUrl = `${window.location.origin}/auth/oauth-success`;
        const failureUrl = `${window.location.origin}/auth/oauth-failure`;
        
        addLog('Calling Appwrite OAuth directly...');
        await account.createOAuth2Session('google' as any, successUrl, failureUrl);
      }
    } catch (error: any) {
      addLog(`Direct OAuth failed: ${error.message}`, 'error');
    }
  };

  const checkAppwriteHealth = async () => {
    try {
      addLog('Checking Appwrite health...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/health`);
      if (response.ok) {
        const health = await response.json();
        addLog(`Appwrite health: ${JSON.stringify(health)}`, 'success');
      } else {
        addLog(`Appwrite health check failed: ${response.status}`, 'error');
      }
    } catch (error: any) {
      addLog(`Appwrite health error: ${error.message}`, 'error');
    }
  };

  const logout = async () => {
    try {
      addLog('Logging out...');
      await authService.logout();
      setCurrentUser(null);
      setSessionInfo(null);
      addLog('Logout successful', 'success');
    } catch (error: any) {
      addLog(`Logout failed: ${error.message}`, 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">OAuth Debug Tool</h1>
        
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* User Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            {currentUser ? (
              <div className="text-green-600">
                <p><strong>✅ Authenticated</strong></p>
                <p><strong>Name:</strong> {currentUser.name}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>User ID:</strong> {currentUser.$id}</p>
                <p><strong>Email Verified:</strong> {currentUser.emailVerification ? 'Yes' : 'No'}</p>
                <button
                  onClick={logout}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <p className="text-red-600">❌ Not authenticated</p>
            )}
            <button
              onClick={checkCurrentSession}
              className="mt-4 ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh Status
            </button>
          </div>

          {/* Session Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Session Information</h2>
            {sessionInfo ? (
              <div className="text-sm">
                <p><strong>Provider:</strong> {sessionInfo.provider}</p>
                <p><strong>Provider UID:</strong> {sessionInfo.providerUid}</p>
                <p><strong>Created:</strong> {new Date(sessionInfo.$createdAt).toLocaleString()}</p>
                <p><strong>Expires:</strong> {new Date(sessionInfo.expire).toLocaleString()}</p>
                <p><strong>Current:</strong> {sessionInfo.current ? 'Yes' : 'No'}</p>
              </div>
            ) : (
              <p className="text-gray-500">No session information available</p>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Appwrite Endpoint:</strong>
              <p className="text-gray-600 break-all font-mono">{process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}</p>
            </div>
            <div>
              <strong>Project ID:</strong>
              <p className="text-gray-600 font-mono">{process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}</p>
            </div>
            <div>
              <strong>Current URL:</strong>
              <p className="text-gray-600 break-all font-mono">{isClient ? window.location.href : 'Loading...'}</p>
            </div>
            <div>
              <strong>OAuth Success URL:</strong>
              <p className="text-gray-600 break-all font-mono">
                {isClient ? `${window.location.origin}/auth/oauth-success` : 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={checkAppwriteHealth}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              Health Check
            </button>
            <button
              onClick={testOAuth}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Test OAuth (Service)
            </button>
            <button
              onClick={testDirectOAuth}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
            >
              Test OAuth (Direct)
            </button>
            <button
              onClick={clearLogs}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p>No logs yet. Use the test buttons above.</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔧 Troubleshooting Steps</h3>
          <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
            <li>First, click &quot;Health Check&quot; to ensure Appwrite is reachable</li>
            <li>If you&apos;re already logged in, check the session information above</li>
            <li>Try &quot;Test OAuth (Service)&quot; to test the normal OAuth flow</li>
            <li>If that fails, try &quot;Test OAuth (Direct)&quot; to test direct Appwrite calls</li>
            <li>Check the debug logs for detailed error information</li>
            <li>Common issues:
              <ul className="ml-4 mt-2 space-y-1 list-disc list-inside">
                <li>Google OAuth provider not enabled in Appwrite console</li>
                <li>Incorrect Client ID or Client Secret in Appwrite</li>
                <li>Redirect URI mismatch in Google Cloud Console</li>
                <li>Missing OAuth consent screen configuration</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default OAuthDebug;

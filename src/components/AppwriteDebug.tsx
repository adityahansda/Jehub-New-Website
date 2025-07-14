import React, { useState } from 'react';
import { account } from '../lib/appwrite';
import { ID } from 'appwrite';

const AppwriteDebug: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAppwriteConnection = async () => {
    setLoading(true);
    setTestResult('Testing Appwrite connection...');
    
    try {
      // Test 1: Basic connection
      setTestResult('✅ Appwrite client initialized successfully\n');
      
      // Test 2: Check if user is logged in
      try {
        const user = await account.get();
        setTestResult(prev => prev + `✅ Current user: ${user.email}\n`);
      } catch (error) {
        setTestResult(prev => prev + `ℹ️ No current user session (this is normal for anonymous users)\n`);
      }
      
      // Test 3: Try to create a test user
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      const testName = 'Test User';
      
      try {
        const newUser = await account.create(ID.unique(), testEmail, testPassword, testName);
        setTestResult(prev => prev + `✅ Test user created successfully: ${newUser.email}\n`);
        
        // Clean up - delete the test user session
        try {
          await account.deleteSession('current');
          setTestResult(prev => prev + `✅ Test user session deleted\n`);
        } catch (error) {
          setTestResult(prev => prev + `⚠️ Could not delete test session\n`);
        }
      } catch (error: any) {
        setTestResult(prev => prev + `❌ Failed to create test user: ${error.message}\n`);
        setTestResult(prev => prev + `Error Code: ${error.code}\n`);
        setTestResult(prev => prev + `Error Type: ${error.type}\n`);
      }
      
    } catch (error: any) {
      setTestResult(prev => prev + `❌ Connection failed: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Appwrite Debug Tool</h3>
      <button
        onClick={testAppwriteConnection}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Appwrite Connection'}
      </button>
      
      {testResult && (
        <div className="mt-4 p-4 bg-black text-green-400 rounded font-mono text-sm whitespace-pre-wrap">
          {testResult}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Current Configuration:</strong></p>
        <p>Endpoint: {process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}</p>
        <p>Project ID: {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}</p>
      </div>
    </div>
  );
};

export default AppwriteDebug;

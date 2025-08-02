import React, { useEffect, useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'next/router';

export default function DebugDashboard() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [isClient, setIsClient] = useState(false);

    // Ensure we only run on client side to avoid hydration errors
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        
        // Collect debug information (client-side only)
        const cookies = document.cookie;
        
        // Parse all cookies to show them individually
        const allCookies = cookies.split('; ').reduce((acc: Record<string, string>, cookie) => {
            const [name, value] = cookie.split('=');
            if (name && value) {
                acc[name] = value;
            }
            return acc;
        }, {});
        
        // Better session cookie detection
        const sessionCookie = Object.keys(allCookies).some(name => name.startsWith('a_session_'));
        const userCookie = 'user' in allCookies;
        
        // Find the actual session cookie name
        const sessionCookieName = Object.keys(allCookies).find(name => name.startsWith('a_session_'));
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'default';
        const expectedSessionCookieName = `a_session_${projectId}`;
        
        setDebugInfo({
            hasUser: !!user,
            hasUserProfile: !!userProfile,
            userRole: userProfile?.role || 'unknown',
            userName: user?.name || 'unknown',
            userEmail: user?.email || 'unknown',
            loading,
            sessionCookie,
            userCookie,
            cookies: cookies.substring(0, 500) + (cookies.length > 500 ? '...' : ''),
            allCookies,
            currentPath: router.asPath,
            sessionCookieName,
            expectedSessionCookieName,
            projectId
        });
        
        // Set user cookie if authenticated but cookie missing
        if (user && userProfile && !userCookie) {
            const userData = {
                $id: user.$id,
                name: user.name,
                email: user.email,
                role: userProfile.role
            };
            document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400`;
            console.log('Set user cookie for middleware');
        }
    }, [user, userProfile, loading, router.asPath, isClient]);

    const testDashboardAccess = () => {
        router.push('/dashboard');
    };
    
    const refreshSession = async () => {
        try {
            // Force re-check authentication status
            window.location.reload();
        } catch (error) {
            console.error('Session refresh error:', error);
        }
    };
    
    const forceLogin = () => {
        router.push('/login');
    };
    
    const testNotesUpload = () => {
        router.push('/notes/upload');
    };

    // Show loading while client-side data is being prepared
    if (!isClient) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Access Debug</h1>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                        <p className="text-gray-600 mt-4">Loading debug information...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Access Debug</h1>
                
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Loading:</span>
                                <span className={`px-2 py-1 rounded text-sm ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                    {loading ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Has User:</span>
                                <span className={`px-2 py-1 rounded text-sm ${debugInfo.hasUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {debugInfo.hasUser ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Has Profile:</span>
                                <span className={`px-2 py-1 rounded text-sm ${debugInfo.hasUserProfile ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {debugInfo.hasUserProfile ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">User Role:</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                    {debugInfo.userRole}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <span className="font-medium">User Name:</span>
                                <span className="ml-2">{debugInfo.userName}</span>
                            </div>
                            <div>
                                <span className="font-medium">User Email:</span>
                                <span className="ml-2">{debugInfo.userEmail}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Session Cookie:</span>
                                <span className={`px-2 py-1 rounded text-sm ${debugInfo.sessionCookie ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {debugInfo.sessionCookie ? 'Present' : 'Missing'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">User Cookie:</span>
                                <span className={`px-2 py-1 rounded text-sm ${debugInfo.userCookie ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {debugInfo.userCookie ? 'Present' : 'Missing'}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-2 space-y-1">
                                <div>Project ID: <code className="bg-gray-100 px-1 rounded">{debugInfo.projectId}</code></div>
                                <div>Expected Cookie: <code className="bg-gray-100 px-1 rounded">{debugInfo.expectedSessionCookieName}</code></div>
                                <div>Found Cookie: <code className="bg-gray-100 px-1 rounded">{debugInfo.sessionCookieName || 'None'}</code></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Cookies Information</h2>
                    
                    <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">Individual Cookies:</h3>
                        {debugInfo.allCookies && Object.keys(debugInfo.allCookies).length > 0 ? (
                            <div className="space-y-2">
                                {Object.entries(debugInfo.allCookies).map(([name, value]: [string, any]) => (
                                    <div key={name} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                                        <span className="font-medium text-blue-600 min-w-0 flex-shrink-0">{name}:</span>
                                        <span className="text-sm text-gray-700 break-all">
                                            {typeof value === 'string' && value.length > 100 
                                                ? `${value.substring(0, 100)}...` 
                                                : String(value)}
                                        </span>
                                        {name.startsWith('a_session_') && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Session</span>
                                        )}
                                        {name === 'user' && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">User Data</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No cookies found</p>
                        )}
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-medium mb-2">Raw Cookies:</h3>
                        <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                            <pre className="text-sm">{debugInfo.cookies || 'No cookies found'}</pre>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Access Test</h2>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Based on our middleware changes, the dashboard should be accessible to any authenticated user.
                        </p>
                        <div className="space-y-2">
                            <h3 className="font-medium">Expected Access Result:</h3>
                            {debugInfo.hasUser ? (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-800">✅ You should be able to access the dashboard</p>
                                    <p className="text-sm text-green-600 mt-1">You are authenticated and should pass middleware checks</p>
                                </div>
                            ) : (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800">❌ You should be redirected to login or access denied</p>
                                    <p className="text-sm text-red-600 mt-1">You are not authenticated</p>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                onClick={testDashboardAccess}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Test Dashboard Access
                            </button>
                            <button
                                onClick={testNotesUpload}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Test Notes Upload (Team)
                            </button>
                            <button
                                onClick={refreshSession}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Refresh Session
                            </button>
                            <button
                                onClick={forceLogin}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Re-Login
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Navigation Links</h2>
                    <div className="space-x-4">
                        <button
                            onClick={() => router.push('/login')}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Go to Login
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Go to Home
                        </button>
                        <button
                            onClick={() => router.push('/auth/access-denied')}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            View Access Denied Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

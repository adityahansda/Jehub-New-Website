import React from 'react';
import { useRouter } from 'next/router';
import HomeDashboard from '../src/pages/Home-Dashboard';
import { useAuth } from '../src/contexts/AuthContext';
import LoadingSpinner from '../src/components/LoadingSpinner';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // If user is authenticated, show dashboard
  return <HomeDashboard />;
}

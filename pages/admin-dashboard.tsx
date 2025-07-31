import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import RoleGuard from '../src/components/auth/RoleGuard';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';

const AdminDashboardRedirect: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  useEffect(() => {
    // Redirect to unified admin dashboard
    router.replace('/unified-admin-dashboard');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to Admin Dashboard</h2>
          <p className="text-gray-600 mb-6">Taking you to the new unified admin dashboard...</p>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-blue-600 font-medium">Loading...</span>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/unified-admin-dashboard')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component wrapped with role-based access control
const AdminDashboard: React.FC = () => {
  return (
    <RoleGuard requiredRole="admin">
      <AdminDashboardRedirect />
    </RoleGuard>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Settings, 
  FileText, 
  Users, 
  BarChart3, 
  Shield,
  MessageSquare,
  Share2,
  Database,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';
import { hasRequiredRole } from '../../src/utils/dashboardRouter';

const AdminDashboard = () => {
  const adminFeatures = [
    {
      title: 'App Settings',
      description: 'Configure share messages, social media options, and site information',
      icon: Settings,
      href: '/admin/settings',
      color: 'blue',
      features: ['Custom share messages', 'Social media toggles', 'Site configuration']
    },
    {
      title: 'Template Management',
      description: 'Create and manage multiple share message templates for different contexts',
      icon: MessageSquare,
      href: '/admin/templates',
      color: 'purple',
      features: ['Multiple templates', 'Template switching', 'Context-specific messages']
    },
    {
      title: 'PDF Validation',
      description: 'Validate and manage PDF files and their availability',
      icon: FileText,
      href: '/admin/pdf-validation',
      color: 'green',
      features: ['URL validation', 'File integrity checks', 'Broken link detection']
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'purple',
      features: ['User profiles', 'Role assignments', 'Activity monitoring'],
      comingSoon: true
    },
    {
      title: 'Analytics',
      description: 'View site statistics, user engagement, and content performance',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'orange',
      features: ['Download stats', 'User engagement', 'Popular content'],
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your Jharkhand Engineer&apos;s Hub platform</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">3,456</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Share2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Shares Today</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Comments</p>
                <p className="text-2xl font-bold text-gray-900">234</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {adminFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600 border-blue-200',
              green: 'bg-green-100 text-green-600 border-green-200',
              purple: 'bg-purple-100 text-purple-600 border-purple-200',
              orange: 'bg-orange-100 text-orange-600 border-orange-200'
            };

            return (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                      {feature.comingSoon && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{feature.description}</p>

                <div className="space-y-2 mb-6">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {feature.comingSoon ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Coming Soon
                  </button>
                ) : (
                  <Link
                    href={feature.href}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Open {feature.title}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-lg">
                <Settings className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Share message template updated</p>
                <p className="text-xs text-gray-500">Custom WhatsApp message template was modified</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">PDF validation completed</p>
                <p className="text-xs text-gray-500">125 files validated, 3 broken links found</p>
              </div>
              <span className="text-xs text-gray-500">4 hours ago</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Share2 className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">High sharing activity detected</p>
                <p className="text-xs text-gray-500">89 shares in the last 24 hours</p>
              </div>
              <span className="text-xs text-gray-500">6 hours ago</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Check out the{' '}
            <Link href="/admin/docs" className="text-blue-600 hover:text-blue-800">
              admin documentation
            </Link>{' '}
            or{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800">
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

// Role-based access control wrapper
export default function ProtectedAdminDashboard() {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            // Wait for user and userProfile to load
            if (!user) {
                router.push('/login');
                return;
            }

            // If userProfile is still loading, wait a bit
            if (userProfile === undefined) {
                return;
            }

            // Check role-based access
            const userRole = (userProfile?.role || 'user').toLowerCase();
            
            // Only allow access for admin, manager, and intern roles
            const allowedRoles = ['admin', 'manager', 'intern'];
            
            if (allowedRoles.includes(userRole)) {
                setHasAccess(true);
            } else {
                // Redirect students to student dashboard
                if (userRole === 'student' || userRole === 'user') {
                    router.push('/dashboard');
                } else {
                    router.push('/access-denied');
                }
                return;
            }
            
            setIsChecking(false);
        };

        checkAccess();
    }, [user, userProfile, router]);

    // Show loading while checking access
    if (isChecking || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    // Render admin dashboard if access is granted
    return hasAccess ? <AdminDashboard /> : null;
}

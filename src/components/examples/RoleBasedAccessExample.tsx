import React from 'react';
import { useRoleVerification } from '../../hooks/useRoleVerification';
import RoleBadge from '../common/RoleBadge';
import { Shield, Users, Award, BookOpen, User, AlertTriangle } from 'lucide-react';

/**
 * Example component demonstrating role-based access control usage
 * This shows different ways to implement role verification in your components
 */
const RoleBasedAccessExample: React.FC = () => {
  const { userRole, hasAccess, isAdmin, isManager, loading, error } = useRoleVerification();

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">Error verifying user role: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Role-Based Access Control Example
        </h3>
        <p className="text-gray-600">
          This component demonstrates how to use role verification in your application.
        </p>
      </div>

      {/* Current User Role */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Current User Role:</h4>
        <RoleBadge role={userRole} size="lg" />
      </div>

      {/* Role-based Content Sections */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Available Features:</h4>

        {/* Basic User Content - Available to all authenticated users */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Basic User Features</span>
          </div>
          <p className="text-sm text-gray-600">
            ✅ View dashboard, Upload notes, Download notes, User profile
          </p>
        </div>

        {/* Student Level Content */}
        {hasAccess('student') ? (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Student Features</span>
            </div>
            <p className="text-sm text-green-700">
              ✅ Academic resources, Study groups, Assignment submissions
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-600">Student Features</span>
            </div>
            <p className="text-sm text-gray-500">
              ❌ Requires Student role or higher
            </p>
          </div>
        )}

        {/* Intern Level Content */}
        {hasAccess('intern') ? (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">Intern Features</span>
            </div>
            <p className="text-sm text-orange-700">
              ✅ Project management, Internship tracking, Mentor access
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-600">Intern Features</span>
            </div>
            <p className="text-sm text-gray-500">
              ❌ Requires Intern role or higher
            </p>
          </div>
        )}

        {/* Manager Level Content */}
        {isManager ? (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Manager Features</span>
            </div>
            <p className="text-sm text-blue-700">
              ✅ Team management, User oversight, Content moderation
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-600">Manager Features</span>
            </div>
            <p className="text-sm text-gray-500">
              ❌ Requires Manager role or higher
            </p>
          </div>
        )}

        {/* Admin Level Content */}
        {isAdmin ? (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Admin Features</span>
            </div>
            <p className="text-sm text-purple-700">
              ✅ Full system access, User management, Site configuration, Analytics
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-600">Admin Features</span>
            </div>
            <p className="text-sm text-gray-500">
              ❌ Requires Admin role
            </p>
          </div>
        )}
      </div>

      {/* Code Examples */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Usage Examples:</h4>
        <div className="p-4 bg-gray-900 rounded-lg text-sm text-gray-100 font-mono overflow-x-auto">
          <div className="space-y-2">
            <div className="text-green-400">// Import the hook</div>
            <div>
              <span className="text-blue-300">import</span>{' '}
              <span className="text-yellow-300">{'{ useRoleVerification }'}</span>{' '}
              <span className="text-blue-300">from</span>{' '}
              <span className="text-green-300">'../hooks/useRoleVerification'</span>;
            </div>
            
            <div className="mt-4 text-green-400">// Use in component</div>
            <div>
              <span className="text-blue-300">const</span>{' '}
              <span>{'{ userRole, hasAccess, isAdmin }'}</span>{' '}
              <span className="text-blue-300">=</span>{' '}
              <span className="text-yellow-300">useRoleVerification</span>();
            </div>
            
            <div className="mt-4 text-green-400">// Check permissions</div>
            <div>
              <span className="text-blue-300">if</span> (
              <span className="text-yellow-300">hasAccess</span>(<span className="text-green-300">'admin'</span>)) {'{'}
            </div>
            <div className="ml-4">
              <span className="text-blue-300">return</span> <span className="text-red-300">&lt;AdminPanel /&gt;</span>;
            </div>
            <div>{'}'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedAccessExample;

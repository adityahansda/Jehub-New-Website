# Role-Based Access Control (RBAC) Implementation Guide

This document explains how to use the server-side role-based access control system implemented for the Jehub application.

## Overview

The RBAC system provides both client-side and server-side protection for routes and API endpoints based on user roles. It includes:

- **Server-side middleware** for route protection
- **API route wrappers** for endpoint protection
- **Client-side components** for UI role verification
- **Access denied pages** with admin login options

## User Role Hierarchy

The system uses a hierarchical role system:

1. **admin** (Level 5) - Highest privileges, can access all resources
2. **manager** (Level 4) - Can manage teams and resources
3. **intern** (Level 3) - Limited management capabilities
4. **student** (Level 2) - Basic user with learning access
5. **user** (Level 1) - Basic authenticated user

Higher-level roles inherit permissions from lower levels.

## Implementation Components

### 1. Server-Side Authentication Utilities (`src/lib/serverAuth.ts`)

Core functions for server-side role verification:

```typescript
import { verifyServerAuth, withAdminProtection, withManagerProtection } from '../src/lib/serverAuth';

// Verify auth and role for any request
const auth = await verifyServerAuth(request, 'admin');

// Use pre-built protection wrappers
export default withAdminProtection(handler);
export default withManagerProtection(handler);
```

### 2. Enhanced Middleware (`middleware.ts`)

Automatically protects routes based on role requirements:

```typescript
// Define protected routes by role
const roleBasedRoutes = {
  admin: ['/admin-dashboard', '/admin-pdf-validation'],
  manager: ['/team-dashboard'],
  student: ['/profile'],
  user: ['/dashboard', '/settings'],
};
```

### 3. Protected Route Component (`src/components/ProtectedRoute.tsx`)

Client-side route protection with user-friendly access denied alerts:

```typescript
import ProtectedRoute from '../components/ProtectedRoute';

// Wrap components that need protection
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### 4. Access Denied Page (`pages/access-denied.tsx`)

Displays when users try to access unauthorized pages:
- Shows current vs required role
- Provides admin login option for non-admin users
- Red alert styling for clear visibility

## Usage Examples

### Protecting API Routes

```typescript
// pages/api/admin/users.ts
import { withAdminProtection } from '../../../src/lib/serverAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only admin users can access this endpoint
  const user = (req as any).user;
  const userRole = (req as any).userRole;
  
  // Your API logic here
}

export default withAdminProtection(handler);
```

### Protecting Pages

```typescript
// pages/admin-dashboard.tsx
import ProtectedRoute from '../src/components/ProtectedRoute';

const AdminDashboard = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin-only content</div>
    </ProtectedRoute>
  );
};
```

### Manual Role Verification

```typescript
import { verifyServerAuth } from '../src/lib/serverAuth';

export async function getServerSideProps(context) {
  const auth = await verifyServerAuth(context.req, 'manager');
  
  if (!auth.hasPermission) {
    return {
      redirect: {
        destination: '/access-denied',
        permanent: false,
      },
    };
  }
  
  return { props: {} };
}
```

## Available Protection Wrappers

- `withAdminProtection(handler)` - Admin only
- `withManagerProtection(handler)` - Manager and above
- `withInternProtection(handler)` - Intern and above
- `withStudentProtection(handler)` - Student and above
- `withUserProtection(handler)` - Any authenticated user

## Error Responses

When access is denied, the system returns structured error responses:

### API Error Response
```json
{
  "error": "Access denied. Required role: admin. Your role: user",
  "code": "INSUFFICIENT_PERMISSIONS",
  "requiredRole": "admin",
  "userRole": "user"
}
```

### Authentication Error Response
```json
{
  "error": "Authentication required",
  "code": "UNAUTHENTICATED"
}
```

## User Experience Features

### Access Denied Alert
- **Red alert styling** for clear visibility
- **Role comparison** showing required vs current role
- **Action buttons** for navigation
- **Admin login option** for non-admin users

### Automatic Redirections
- Unauthenticated users → Login page
- Unauthorized users → Access denied page
- Successful auth → Original requested page

## Testing Role-Based Access

1. **Test with different user roles**:
   - Create test accounts with different roles
   - Try accessing protected routes
   - Verify proper access denial

2. **Test API endpoints**:
   - Use tools like Postman or curl
   - Include session cookies
   - Verify error responses

3. **Test middleware**:
   - Navigate directly to protected URLs
   - Check redirection behavior
   - Verify cookie-based auth

## Security Considerations

1. **Server-side verification**: Always verify roles on the server, never trust client-side data
2. **Session management**: Ensure proper session token validation
3. **Role persistence**: Roles are fetched fresh for each request to prevent stale data
4. **Error handling**: Don't expose sensitive information in error messages

## Troubleshooting

### Common Issues

1. **"Authentication required" errors**:
   - Check if session cookies are being sent
   - Verify Appwrite server configuration

2. **Role not updating**:
   - Clear browser cookies and re-login
   - Check user profile role assignment

3. **Middleware not working**:
   - Verify middleware configuration in `next.config.js`
   - Check route patterns in middleware matcher

### Debug Mode

Enable detailed logging by setting environment variable:
```bash
DEBUG_AUTH=true
```

This will log authentication attempts and role verifications to the console.

## Future Enhancements

- **Permission-based access**: Extend beyond roles to specific permissions
- **Dynamic role assignment**: Admin interface for role management  
- **Audit logging**: Track access attempts and role changes
- **Rate limiting**: Prevent abuse of protected endpoints

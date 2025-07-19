import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminProtection } from '../../../src/lib/serverAuth';
import { serverDatabases } from '../../../src/lib/appwrite-server';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint is only accessible by admin users
  
  if (req.method === 'GET') {
    try {
      // Example: Get all users (admin only operation)
      // You can access user info through req.user and req.userRole
      const user = (req as any).user;
      const userRole = (req as any).userRole;

      // Simulate getting users from database
      const users = [
        { id: '1', name: 'John Doe', role: 'user', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', role: 'manager', email: 'jane@example.com' },
        // In real implementation, fetch from your database
      ];

      res.status(200).json({
        success: true,
        data: users,
        requestedBy: {
          userId: user.$id,
          userRole: userRole.role,
        },
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        error: 'Failed to fetch users',
        code: 'FETCH_ERROR',
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, role } = req.body;

      if (!name || !email || !role) {
        return res.status(400).json({
          error: 'Missing required fields: name, email, role',
          code: 'MISSING_FIELDS',
        });
      }

      // Example: Create a new user (admin only operation)
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        createdBy: (req as any).user.$id,
      };

      // In real implementation, save to your database
      // const result = await serverDatabases.createDocument(...);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        error: 'Failed to create user',
        code: 'CREATE_ERROR',
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          error: 'Missing userId',
          code: 'MISSING_USER_ID',
        });
      }

      // Example: Delete a user (admin only operation)
      // In real implementation, delete from your database
      // await serverDatabases.deleteDocument(...);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        deletedUserId: userId,
        deletedBy: (req as any).user.$id,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        error: 'Failed to delete user',
        code: 'DELETE_ERROR',
      });
    }
  } else {
    res.status(405).json({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
      allowedMethods: ['GET', 'POST', 'DELETE'],
    });
  }
}

// Export with admin protection - only admin users can access this endpoint
export default withAdminProtection(handler);

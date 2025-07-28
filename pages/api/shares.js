/**
 * API endpoint for sharing feature
 * Handles CRUD operations for shares collection
 */

import { Client, Databases, ID, Query } from 'node-appwrite';

// Initialize Appwrite client with timeout and retry settings
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Retry wrapper for database operations
async function withRetry(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Check if error is retryable
function isRetryableError(error) {
  const retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'fetch failed'];
  return retryableErrors.some(errType => 
    error.message?.includes(errType) || error.code === errType
  );
}

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SHARES_COLLECTION_ID || 'shares_collection_id';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        return await createShare(req, res);
      case 'GET':
        return await getShares(req, res);
      case 'PUT':
        return await updateShare(req, res);
      case 'DELETE':
        return await deleteShare(req, res);
      default:
        res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Create a new share
async function createShare(req, res) {
  const {
    resourceType,
    resourceId,
    resourceTitle,
    resourceUrl,
    platform,
    customMessage,
    userId,
    userName,
    userEmail = ''
  } = req.body;

  if (!resourceType || !resourceId || !resourceTitle || !resourceUrl || !platform || !userId) {
    return res.status(400).json({ 
      error: 'Missing required fields' 
    });
  }

  try {
    const shareId = ID.unique();
    const shareUrl = `${process.env.SITE_URL}/shared/${shareId}`;

    const shareData = {
      shareId,
      resourceType,
      resourceId,
      resourceTitle,
      resourceUrl,
      sharerId: userId,
      sharerName: userName || 'Anonymous',
      sharerEmail: userEmail,
      platform,
      shareMessage: customMessage || resourceTitle,
      isPublic: true,
      accessCount: 0,
      status: 'active',
      tags: JSON.stringify([])
    };

    const document = await withRetry(() => 
      databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        shareData
      )
    );

    return res.status(201).json({
      success: true,
      share: document,
      shareUrl,
      shareId
    });

  } catch (error) {
    console.error('Create share error:', error);
    return res.status(500).json({ 
      error: 'Failed to create share',
      details: error.message
    });
  }
}

// Get shares (by user or resource)
async function getShares(req, res) {
  const { 
    userId, 
    resourceId, 
    platform, 
    limit = 25, 
    offset = 0 
  } = req.query;

  try {
    let queries = [
      Query.equal('status', 'active'),
      Query.limit(parseInt(limit)),
      Query.offset(parseInt(offset)),
      Query.orderDesc('$createdAt')
    ];

    if (userId) {
      queries.push(Query.equal('sharerId', userId));
    }
    
    if (resourceId) {
      queries.push(Query.equal('resourceId', resourceId));
    }
    
    if (platform) {
      queries.push(Query.equal('platform', platform));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      queries
    );

    return res.status(200).json({
      success: true,
      shares: response.documents,
      total: response.total
    });

  } catch (error) {
    console.error('Get shares error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch shares',
      details: error.message
    });
  }
}

// Update a share
async function updateShare(req, res) {
  const { shareId, updates } = req.body;

  if (!shareId) {
    return res.status(400).json({ 
      error: 'Share ID is required' 
    });
  }

  try {
    // Find the document by shareId
    const existingShares = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal('shareId', shareId)]
    );

    if (existingShares.documents.length === 0) {
      return res.status(404).json({ 
        error: 'Share not found' 
      });
    }

    const document = existingShares.documents[0];

    const updatedDocument = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      document.$id,
      updates
    );

    return res.status(200).json({
      success: true,
      share: updatedDocument
    });

  } catch (error) {
    console.error('Update share error:', error);
    return res.status(500).json({ 
      error: 'Failed to update share',
      details: error.message
    });
  }
}

// Delete a share
async function deleteShare(req, res) {
  const { shareId } = req.body;

  if (!shareId) {
    return res.status(400).json({ 
      error: 'Share ID is required' 
    });
  }

  try {
    // Find the document by shareId
    const existingShares = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal('shareId', shareId)]
    );

    if (existingShares.documents.length === 0) {
      return res.status(404).json({ 
        error: 'Share not found' 
      });
    }

    const document = existingShares.documents[0];

    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTION_ID,
      document.$id
    );

    return res.status(200).json({
      success: true,
      message: 'Share deleted successfully'
    });

  } catch (error) {
    console.error('Delete share error:', error);
    return res.status(500).json({ 
      error: 'Failed to delete share',
      details: error.message
    });
  }
}

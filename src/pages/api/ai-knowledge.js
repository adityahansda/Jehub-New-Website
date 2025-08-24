import { serverDatabases } from '../../lib/appwrite-server';
import { ID } from 'node-appwrite';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('AI Knowledge API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message 
    });
  }
}

// GET /api/ai-knowledge - Retrieve knowledge entries
async function handleGet(req, res) {
  try {
    const { id, limit = 100, category, isActive } = req.query;
    
    // Check if collection is configured
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID;
    if (!collectionId) {
      return res.status(500).json({
        error: 'AI Knowledge collection not configured. Please set NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID in environment variables.'
      });
    }

    // Get specific entry by ID
    if (id) {
      try {
        const document = await serverDatabases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          collectionId,
          id
        );
        return res.status(200).json({ entry: document });
      } catch (error) {
        if (error.code === 404) {
          return res.status(404).json({ error: 'Knowledge entry not found' });
        }
        throw error;
      }
    }

    // Build query filters
    const queries = [];
    
    if (category && category !== 'all') {
      queries.push(`category="${category}"`);
    }
    
    if (isActive !== undefined) {
      queries.push(`isActive=${isActive === 'true'}`);
    }

    // Get all entries with filters
    const result = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      collectionId,
      queries,
      parseInt(limit),
      0,
      [],
      ['$createdAt:desc'] // Order by creation date, newest first
    );

    console.log(`Retrieved ${result.documents.length} AI knowledge entries`);

    return res.status(200).json({ 
      entries: result.documents,
      total: result.total
    });

  } catch (error) {
    console.error('Error retrieving AI knowledge entries:', error);
    
    if (error.code === 'collection_not_found') {
      return res.status(500).json({
        error: 'AI Knowledge collection not found. Please ensure the collection is created in Appwrite.',
        collectionId: process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to retrieve knowledge entries',
      details: error.message 
    });
  }
}

// POST /api/ai-knowledge - Create new knowledge entry
async function handlePost(req, res) {
  try {
    const { title, content, category, rules, isActive, tags, createdBy, userEmail } = req.body;

    // Validation
    if (!title || !content || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields. Title, content, and category are required.' 
      });
    }

    // Check if collection is configured
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID;
    if (!collectionId) {
      return res.status(500).json({
        error: 'AI Knowledge collection not configured. Please set NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID in environment variables.'
      });
    }

    // Prepare document data
    const documentData = {
      title: title.trim(),
      content: content.trim(),
      category: category.toLowerCase().trim(),
      rules: rules ? rules.trim() : null,
      isActive: isActive !== false, // Default to true if not specified
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      createdBy: createdBy || 'Anonymous',
      userEmail: userEmail || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating AI knowledge entry:', {
      title: documentData.title,
      category: documentData.category,
      isActive: documentData.isActive,
      createdBy: documentData.createdBy
    });

    // Create document in Appwrite
    const document = await serverDatabases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      collectionId,
      ID.unique(),
      documentData
    );

    console.log('Successfully created AI knowledge entry:', document.$id);

    return res.status(201).json({
      message: 'Knowledge entry created successfully',
      entry: document,
      documentId: document.$id
    });

  } catch (error) {
    console.error('Error creating AI knowledge entry:', error);
    
    if (error.code === 'collection_not_found') {
      return res.status(500).json({
        error: 'AI Knowledge collection not found. Please ensure the collection is created in Appwrite.',
        collectionId: process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID
      });
    }
    
    if (error.code === 'document_invalid_structure') {
      return res.status(400).json({
        error: 'Invalid data structure. Please check your input fields.',
        details: error.message
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to create knowledge entry',
      details: error.message 
    });
  }
}

// PUT /api/ai-knowledge - Update existing knowledge entry
async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const { title, content, category, rules, isActive, tags } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Entry ID is required for updates' });
    }

    // Check if collection is configured
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID;
    if (!collectionId) {
      return res.status(500).json({
        error: 'AI Knowledge collection not configured.'
      });
    }

    // Prepare update data (only include fields that are provided)
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (category !== undefined) updateData.category = category.toLowerCase().trim();
    if (rules !== undefined) updateData.rules = rules ? rules.trim() : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (tags !== undefined) {
      updateData.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
    }

    console.log('Updating AI knowledge entry:', id);

    // Update document in Appwrite
    const document = await serverDatabases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      collectionId,
      id,
      updateData
    );

    console.log('Successfully updated AI knowledge entry:', document.$id);

    return res.status(200).json({
      message: 'Knowledge entry updated successfully',
      entry: document
    });

  } catch (error) {
    console.error('Error updating AI knowledge entry:', error);
    
    if (error.code === 404) {
      return res.status(404).json({ error: 'Knowledge entry not found' });
    }
    
    return res.status(500).json({ 
      error: 'Failed to update knowledge entry',
      details: error.message 
    });
  }
}

// DELETE /api/ai-knowledge - Delete knowledge entry
async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Entry ID is required for deletion' });
    }

    // Check if collection is configured
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID;
    if (!collectionId) {
      return res.status(500).json({
        error: 'AI Knowledge collection not configured.'
      });
    }

    console.log('Deleting AI knowledge entry:', id);

    // Delete document from Appwrite
    await serverDatabases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      collectionId,
      id
    );

    console.log('Successfully deleted AI knowledge entry:', id);

    return res.status(200).json({
      message: 'Knowledge entry deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting AI knowledge entry:', error);
    
    if (error.code === 404) {
      return res.status(404).json({ error: 'Knowledge entry not found' });
    }
    
    return res.status(500).json({ 
      error: 'Failed to delete knowledge entry',
      details: error.message 
    });
  }
}

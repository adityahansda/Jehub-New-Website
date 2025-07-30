import { NextApiRequest, NextApiResponse } from 'next';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

const TEMPLATES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TEMPLATES_COLLECTION_ID || 'share_templates';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!DATABASE_ID) {
    return res.status(500).json({ error: 'Database configuration missing' });
  }

  try {
    if (req.method === 'GET') {
      // Get all templates
      const response = await databases.listDocuments(
        DATABASE_ID,
        TEMPLATES_COLLECTION_ID,
        [Query.orderDesc('$createdAt'), Query.limit(50)]
      );

      const templates = response.documents.map(doc => ({
        id: doc.$id,
        name: doc.name,
        description: doc.description,
        content: doc.content,
        isActive: doc.isActive || false,
        isDefault: doc.isDefault || false,
        platforms: doc.platforms || ['whatsapp', 'telegram', 'twitter', 'facebook'],
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt
      }));

      return res.status(200).json({ templates });
    }

    if (req.method === 'POST') {
      // Create new template
      const { name, description, content, platforms = ['whatsapp', 'telegram', 'twitter', 'facebook'] } = req.body;

      if (!name || !content) {
        return res.status(400).json({ error: 'Name and content are required' });
      }

      try {
        const created = await databases.createDocument(
          DATABASE_ID,
          TEMPLATES_COLLECTION_ID,
          'unique()',
          {
            name: name.trim(),
            description: description?.trim() || '',
            content: content.trim(),
            platforms: platforms,
            isActive: false,
            isDefault: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );

        return res.status(201).json({ 
          success: true, 
          template: {
            id: created.$id,
            name: created.name,
            description: created.description,
            content: created.content,
            platforms: created.platforms,
            isActive: created.isActive,
            isDefault: created.isDefault,
            createdAt: created.$createdAt,
            updatedAt: created.$updatedAt
          }
        });
      } catch (error: any) {
        console.error('Error creating template:', error);
        return res.status(500).json({ error: 'Failed to create template', details: error.message });
      }
    }

    if (req.method === 'PUT') {
      // Update template
      const { id, name, description, content, platforms, isActive } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      try {
        const updated = await databases.updateDocument(
          DATABASE_ID,
          TEMPLATES_COLLECTION_ID,
          id,
          {
            ...(name && { name: name.trim() }),
            ...(description !== undefined && { description: description.trim() }),
            ...(content && { content: content.trim() }),
            ...(platforms && { platforms }),
            ...(isActive !== undefined && { isActive }),
            updatedAt: new Date().toISOString()
          }
        );

        return res.status(200).json({ 
          success: true, 
          template: {
            id: updated.$id,
            name: updated.name,
            description: updated.description,
            content: updated.content,
            platforms: updated.platforms,
            isActive: updated.isActive,
            isDefault: updated.isDefault,
            createdAt: updated.$createdAt,
            updatedAt: updated.$updatedAt
          }
        });
      } catch (error: any) {
        console.error('Error updating template:', error);
        return res.status(500).json({ error: 'Failed to update template', details: error.message });
      }
    }

    if (req.method === 'DELETE') {
      // Delete template
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      try {
        // Check if template is default
        const template = await databases.getDocument(DATABASE_ID, TEMPLATES_COLLECTION_ID, id);
        if (template.isDefault) {
          return res.status(400).json({ error: 'Cannot delete default template' });
        }

        await databases.deleteDocument(DATABASE_ID, TEMPLATES_COLLECTION_ID, id);
        return res.status(200).json({ success: true, message: 'Template deleted successfully' });
      } catch (error: any) {
        console.error('Error deleting template:', error);
        return res.status(500).json({ error: 'Failed to delete template', details: error.message });
      }
    }

    if (req.method === 'PATCH') {
      // Set active template
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      try {
        // First, deactivate all templates
        const allTemplates = await databases.listDocuments(
          DATABASE_ID,
          TEMPLATES_COLLECTION_ID,
          [Query.limit(100)]
        );

        // Deactivate all templates
        const deactivatePromises = allTemplates.documents.map(template =>
          databases.updateDocument(DATABASE_ID, TEMPLATES_COLLECTION_ID, template.$id, {
            isActive: false,
            updatedAt: new Date().toISOString()
          })
        );

        await Promise.all(deactivatePromises);

        // Activate the selected template
        const activated = await databases.updateDocument(
          DATABASE_ID,
          TEMPLATES_COLLECTION_ID,
          id,
          {
            isActive: true,
            updatedAt: new Date().toISOString()
          }
        );

        return res.status(200).json({ 
          success: true, 
          message: 'Template activated successfully',
          template: {
            id: activated.$id,
            name: activated.name,
            description: activated.description,
            content: activated.content,
            platforms: activated.platforms,
            isActive: activated.isActive,
            isDefault: activated.isDefault,
            createdAt: activated.$createdAt,
            updatedAt: activated.$updatedAt
          }
        });
      } catch (error: any) {
        console.error('Error activating template:', error);
        return res.status(500).json({ error: 'Failed to activate template', details: error.message });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Templates API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

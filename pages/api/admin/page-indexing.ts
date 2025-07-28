import { NextApiRequest, NextApiResponse } from 'next';
import { databases } from '../../../src/lib/appwrite';
import { appwriteConfig } from '../../../src/lib/appwriteConfig';
import { ID, Query } from 'appwrite';

const DATABASE_ID = appwriteConfig.databaseId;
const PAGE_INDEXING_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PAGE_INDEXING_COLLECTION_ID || 'page_indexing';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Get all page indexing settings
        const pageIndexingSettings = await databases.listDocuments(
          DATABASE_ID,
          PAGE_INDEXING_COLLECTION_ID,
          [
            Query.orderAsc('pagePath')
          ]
        );
        
        res.status(200).json({
          success: true,
          data: pageIndexingSettings.documents
        });
        break;

      case 'POST':
        // Create or update page indexing setting
        const { pagePath, isIndexed, priority, changefreq, lastmod, metaTitle, metaDescription } = req.body;
        
        if (!pagePath) {
          return res.status(400).json({
            success: false,
            error: 'Page path is required'
          });
        }

        // Check if page setting already exists
        try {
          const existingPages = await databases.listDocuments(
            DATABASE_ID,
            PAGE_INDEXING_COLLECTION_ID,
            [
              Query.equal('pagePath', pagePath)
            ]
          );

          if (existingPages.documents.length > 0) {
            // Update existing setting
            const updatedPage = await databases.updateDocument(
              DATABASE_ID,
              PAGE_INDEXING_COLLECTION_ID,
              existingPages.documents[0].$id,
              {
                isIndexed: isIndexed ?? true,
                priority: priority ?? 0.7,
                changefreq: changefreq ?? 'weekly',
                lastmod: lastmod ?? new Date().toISOString(),
                metaTitle: metaTitle || '',
                metaDescription: metaDescription || '',
                updatedAt: new Date().toISOString()
              }
            );
            
            res.status(200).json({
              success: true,
              data: updatedPage,
              message: 'Page indexing setting updated successfully'
            });
          } else {
            // Create new setting
            const newPageSetting = await databases.createDocument(
              DATABASE_ID,
              PAGE_INDEXING_COLLECTION_ID,
              ID.unique(),
              {
                pagePath,
                isIndexed: isIndexed ?? true,
                priority: priority ?? 0.7,
                changefreq: changefreq ?? 'weekly',
                lastmod: lastmod ?? new Date().toISOString(),
                metaTitle: metaTitle || '',
                metaDescription: metaDescription || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            );
            
            res.status(201).json({
              success: true,
              data: newPageSetting,
              message: 'Page indexing setting created successfully'
            });
          }
        } catch (error) {
          console.error('Error creating/updating page setting:', error);
          res.status(500).json({
            success: false,
            error: 'Failed to create/update page indexing setting'
          });
        }
        break;

      case 'DELETE':
        // Delete page indexing setting
        const { pageId } = req.query;
        
        if (!pageId) {
          return res.status(400).json({
            success: false,
            error: 'Page ID is required'
          });
        }

        await databases.deleteDocument(
          DATABASE_ID,
          PAGE_INDEXING_COLLECTION_ID,
          pageId as string
        );
        
        res.status(200).json({
          success: true,
          message: 'Page indexing setting deleted successfully'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

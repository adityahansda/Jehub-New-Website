import { NextApiRequest, NextApiResponse } from 'next';
import { databases, DATABASE_ID, REPORTS_COLLECTION_ID } from '../../src/appwrite/config';
import { ID, Query } from 'appwrite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Debug: Log current configuration
  console.log('Reports API Configuration:', {
    databaseId: DATABASE_ID,
    reportsCollectionId: REPORTS_COLLECTION_ID,
    method: req.method
  });

  if (req.method === 'POST') {
    // Create a new report
    try {
      const { noteId, reason, description, reporterName, reporterEmail } = req.body;

      if (!noteId || !reason || !description || !reporterName || !reporterEmail) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const reportData = {
        noteId,
        reason,
        description,
        reporterName,
        reporterEmail,
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date().toISOString(),
      };

      const report = await databases.createDocument(
        DATABASE_ID,
        REPORTS_COLLECTION_ID,
        ID.unique(),
        reportData
      );

      return res.status(201).json(report);
    } catch (error: any) {
      console.error('Error creating report:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        databaseId: DATABASE_ID,
        collectionId: REPORTS_COLLECTION_ID
      });
      
      return res.status(500).json({ 
        error: 'Failed to create report',
        details: error.message,
        hint: 'Make sure the reports collection exists with proper attributes'
      });
    }
  }

  if (req.method === 'GET') {
    // Fetch reports for a specific note
    try {
      const { noteId } = req.query;

      if (!noteId || typeof noteId !== 'string') {
        return res.status(400).json({ error: 'Note ID is required' });
      }

      const reports = await databases.listDocuments(
        DATABASE_ID,
        REPORTS_COLLECTION_ID,
        [
          Query.equal('noteId', noteId),
          Query.orderDesc('createdAt')
        ]
      );

      return res.status(200).json(reports.documents);
    } catch (error) {
      console.error('Error fetching reports:', error);
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }
  }

  if (req.method === 'PATCH') {
    // Handle voting on reports
    try {
      const { reportId, action } = req.body;

      if (!reportId || !action) {
        return res.status(400).json({ error: 'Report ID and action are required' });
      }

      if (action !== 'upvote' && action !== 'downvote') {
        return res.status(400).json({ error: 'Action must be either "upvote" or "downvote"' });
      }

      // First, get the current report to read current vote counts
      const currentReport = await databases.getDocument(
        DATABASE_ID,
        REPORTS_COLLECTION_ID,
        reportId
      );

      const updateData = action === 'upvote' 
        ? { upvotes: currentReport.upvotes + 1 }
        : { downvotes: currentReport.downvotes + 1 };

      const updatedReport = await databases.updateDocument(
        DATABASE_ID,
        REPORTS_COLLECTION_ID,
        reportId,
        updateData
      );

      return res.status(200).json(updatedReport);
    } catch (error) {
      console.error('Error voting on report:', error);
      return res.status(500).json({ error: 'Failed to vote on report' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

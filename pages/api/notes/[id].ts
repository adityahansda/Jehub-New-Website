import { NextApiRequest, NextApiResponse } from 'next';
import { serverDatabases } from '../../../src/lib/appwrite-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid note ID' });
  }

  // Validate Appwrite document ID format
  // Valid chars: a-z, A-Z, 0-9, underscore. Max 36 chars. Can't start with underscore
  const validIdPattern = /^[a-zA-Z0-9][a-zA-Z0-9_]{0,35}$/;
  if (!validIdPattern.test(id)) {
    return res.status(400).json({ 
      error: 'Invalid document ID format', 
      details: 'Document ID must contain only a-z, A-Z, 0-9, and underscore. Max 36 chars and cannot start with underscore.' 
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get note details including views
        const note = await serverDatabases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
          id
        );
        
        res.status(200).json({
          id: note.$id,
          title: note.title,
          views: note.views || 0,
          downloads: note.downloads || 0,
          likes: note.likes || 0,
          reports: note.reports || 0,
          fileSize: note.fileSize || null,
          uploader: note.authorName,
          uploaderDetails: {
            name: note.authorName,
            notesUploaded: note.uploaderNotesCount || 0,
            totalPoints: note.uploaderTotalPoints || 0,
            memberSince: note.uploaderMemberSince || note.uploadDate
          }
        });
        break;

      case 'PATCH':
        // Update note (views, reports, etc.)
        const { action } = req.body;
        
        if (action === 'increment_view') {
          const currentNote = await serverDatabases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
            id
          );

          await serverDatabases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
            id,
            {
              views: (currentNote.views || 0) + 1
            }
          );

          res.status(200).json({ success: true, views: (currentNote.views || 0) + 1 });
        } else if (action === 'report') {
          const currentNote = await serverDatabases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
            id
          );

          await serverDatabases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
            id,
            {
              reports: (currentNote.reports || 0) + 1
            }
          );

          res.status(200).json({ success: true, reports: (currentNote.reports || 0) + 1 });
        } else {
          res.status(400).json({ error: 'Invalid action' });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

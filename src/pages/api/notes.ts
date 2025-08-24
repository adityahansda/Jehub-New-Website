import { NextApiRequest, NextApiResponse } from 'next';
import { databases } from '../../lib/appwrite';
import { Query } from 'appwrite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch notes from Appwrite database
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(100) // Limit to 100 most recent notes
      ]
    );

    // Transform the data to match our Note type
    const notes = response.documents.map((doc: any) => ({
      id: doc.$id,
      title: doc.title || '',
      branch: doc.branch || '',
      semester: doc.semester || '',
      subject: doc.subject || '',
      description: doc.description || '',
      tags: doc.tags || [],
      uploader: doc.uploader || 'Anonymous',
      uploadDate: doc.$createdAt || new Date().toISOString(),
      githubUrl: doc.githubUrl || doc.github_url || '',
      fileName: doc.fileName || doc.file_name || 'document.pdf',
      downloads: doc.downloads || 0,
      likes: doc.likes || 0,
      points: doc.points || 0,
      views: doc.views || 0,
      reports: doc.reports || 0,
      fileSize: doc.fileSize || doc.file_size || null,
      noteType: doc.noteType || doc.note_type || 'free',
      degree: doc.degree || 'B.Tech'
    }));

    return res.status(200).json({ 
      success: true, 
      notes,
      count: notes.length 
    });

  } catch (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch notes',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

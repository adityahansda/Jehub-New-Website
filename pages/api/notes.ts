import { NextApiRequest, NextApiResponse } from 'next';
import { databases } from '../../src/lib/appwrite';
import { Query } from 'appwrite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Public API endpoint - no authentication required
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
      [Query.orderDesc('uploadDate')]
    );

    const notes = response.documents.map(doc => ({
      id: doc.$id,
      title: doc.title,
      branch: doc.branch,
      semester: doc.semester,
      subject: doc.subject,
      description: doc.description,
      tags: doc.tags,
      uploader: doc.authorName,
      uploadDate: doc.uploadDate,
      githubUrl: doc.githubUrl,
      fileName: doc.fileName,
      downloads: doc.downloads,
      likes: doc.likes,
      points: doc.points || 50,
      views: doc.views || 0,
      reports: doc.reports || 0,
      fileSize: doc.fileSize || null,
      noteType: doc.noteType || 'free',
      degree: doc.degree
    }));

    res.status(200).json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
}

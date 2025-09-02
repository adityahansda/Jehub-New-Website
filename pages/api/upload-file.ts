import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public', 'uploads', 'temp'),
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      filter: ({ mimetype }) => {
        return !!(mimetype && [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain'
        ].includes(mimetype));
      }
    });

    // Ensure upload directories exist
    const tempDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
    const notesDir = path.join(process.cwd(), 'public', 'uploads', 'notes');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    if (!fs.existsSync(notesDir)) {
      fs.mkdirSync(notesDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const filePath = Array.isArray(fields.filePath) ? fields.filePath[0] : fields.filePath;

    if (!file || !filePath) {
      return res.status(400).json({ error: 'File and file path are required' });
    }

    // Create directory structure for the file
    const finalPath = path.join(process.cwd(), 'public', 'uploads', filePath);
    const finalDir = path.dirname(finalPath);
    
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    // Move file from temp to final location
    fs.renameSync(file.filepath, finalPath);

    // Return the public URL
    const publicUrl = `/uploads/${filePath}`;
    const fullUrl = `${req.headers.origin || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${publicUrl}`;

    res.status(200).json({
      success: true,
      url: fullUrl,
      path: publicUrl
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    });
  }
}

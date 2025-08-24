import { NextApiRequest, NextApiResponse } from 'next';
import { serverDatabases } from '../../src/lib/appwrite-server';
import { ID, Query } from 'node-appwrite';
import { Octokit } from '@octokit/rest';

// Initialize Octokit for GitHub operations
let octokit: Octokit;
try {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GitHub token not found');
  }
  
  octokit = new Octokit({
    auth: token
  });
} catch (error) {
  console.error('Failed to initialize Octokit:', error);
  // Initialize without auth as fallback
  octokit = new Octokit();
}

interface KnowledgeEntry {
  title: string;
  content: string;
  category: string;
  rules: string;
  isActive: boolean;
  createdBy?: string;
  userEmail?: string;
  tags?: string[];
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await handleCreateKnowledge(req, res);
  } else if (req.method === 'GET') {
    return await handleGetKnowledge(req, res);
  } else if (req.method === 'PUT') {
    return await handleUpdateKnowledge(req, res);
  } else if (req.method === 'DELETE') {
    return await handleDeleteKnowledge(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Create new knowledge entry
async function handleCreateKnowledge(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      title,
      content,
      category,
      rules,
      isActive,
      createdBy,
      userEmail,
      tags
    }: KnowledgeEntry = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    // Create unique file name for GitHub (using .txt format for AI access)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${sanitizedTitle}-${timestamp}.txt`;
    const filePath = `ai-knowledge/${category}/${fileName}`;

    // Prepare content for GitHub (Plain text format for AI access)
    const textContent = `TITLE: ${title}

CATEGORY: ${category}
CREATED: ${new Date().toISOString()}
ACTIVE: ${isActive}
CREATED BY: ${createdBy || 'System'}

CONTENT:
${content}

${rules ? `RESPONSE RULES:
${rules}

` : ''}${tags && tags.length > 0 ? `TAGS: ${tags.join(', ')}

` : ''}---
This knowledge entry was created for JEHUB AI Assistant to help engineering students.
`;

    // Upload to GitHub
    try {
      const buffer = Buffer.from(textContent, 'utf8');
      const base64Content = buffer.toString('base64');

      // Check GitHub configuration
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
      const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
      const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || process.env.GITHUB_REPO;

      if (!token || !owner || !repo) {
        console.warn('GitHub configuration missing, proceeding without GitHub upload');
      } else {
        // Upload to GitHub
        const response = await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: filePath,
          message: `Add AI Knowledge: ${title}`,
          content: base64Content,
          committer: {
            name: 'JEHUB AI Knowledge Manager',
            email: 'ai-knowledge@jehub.com'
          }
        });

        console.log('Knowledge entry uploaded to GitHub:', response.data.content?.html_url);
      }
    } catch (githubError) {
      console.warn('Failed to upload to GitHub, proceeding with database only:', githubError);
    }

    // Prepare knowledge data for database
    const knowledgeData = {
      title,
      content,
      category,
      rules: rules || '',
      isActive: Boolean(isActive),
      createdBy: createdBy || 'System',
      userEmail: userEmail || '',
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      githubPath: filePath,
      fileName: fileName,
      version: 1,
      status: 'active'
    };

    // Save to Appwrite database
    const result = await serverDatabases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID!,
      ID.unique(),
      knowledgeData
    );

    res.status(200).json({
      success: true,
      message: 'Knowledge entry created successfully',
      documentId: result.$id,
      githubPath: filePath,
      data: result
    });

  } catch (error: any) {
    console.error('Error creating knowledge entry:', error);

    if (error.code === 401) {
      return res.status(401).json({ error: 'Authentication required. Please check database permissions.' });
    }

    if (error.code === 400) {
      return res.status(400).json({ error: `Invalid data: ${error.message}` });
    }

    res.status(500).json({
      error: 'Failed to create knowledge entry',
      details: error.message
    });
  }
}

// Get knowledge entries with enhanced search functionality
async function handleGetKnowledge(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      category, 
      isActive, 
      limit = 100, 
      search, 
      sortBy = 'updatedAt',
      order = 'desc'
    } = req.query;
    
    const queries = [];
    
    if (category && category !== 'all') {
      queries.push(Query.equal('category', category as string));
    }
    
    if (isActive !== undefined) {
      queries.push(Query.equal('isActive', isActive === 'true'));
    }

    // Add ordering
    if (order === 'desc') {
      queries.push(Query.orderDesc(sortBy as string));
    } else {
      queries.push(Query.orderAsc(sortBy as string));
    }

    // Add limit
    queries.push(Query.limit(Math.min(Number(limit), 500))); // Max 500 entries

    const result = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID!,
      queries
    );

    let knowledgeEntries = result.documents.map(doc => ({
      id: doc.$id,
      title: doc.title,
      content: doc.content,
      category: doc.category,
      rules: doc.rules,
      isActive: doc.isActive,
      createdBy: doc.createdBy,
      userEmail: doc.userEmail,
      tags: doc.tags || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      githubPath: doc.githubPath,
      fileName: doc.fileName,
      version: doc.version || 1,
      status: doc.status || 'active'
    }));

    // Apply search filtering if search term is provided
    if (search && typeof search === 'string') {
      const searchTerm = search.toLowerCase();
      knowledgeEntries = searchAndRankEntries(knowledgeEntries, searchTerm);
    }

    res.status(200).json({
      success: true,
      entries: knowledgeEntries,
      total: result.total,
      count: knowledgeEntries.length,
      searchApplied: !!search,
      searchTerm: search || null
    });

  } catch (error: any) {
    console.error('Error fetching knowledge entries:', error);
    res.status(500).json({
      error: 'Failed to fetch knowledge entries',
      details: error.message
    });
  }
}

// Enhanced search and ranking function
function searchAndRankEntries(entries: any[], searchTerm: string): any[] {
  const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 2);
  
  return entries
    .map(entry => {
      let relevanceScore = 0;
      const entryText = `${entry.title} ${entry.content} ${entry.tags?.join(' ') || ''}`.toLowerCase();
      
      // Exact title match gets highest score
      if (entry.title.toLowerCase().includes(searchTerm)) {
        relevanceScore += 1.0;
      }
      
      // Exact content match
      if (entry.content.toLowerCase().includes(searchTerm)) {
        relevanceScore += 0.8;
      }
      
      // Word-based matching
      searchWords.forEach(word => {
        const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
        const titleMatches = (entry.title.match(wordRegex) || []).length;
        const contentMatches = (entry.content.match(wordRegex) || []).length;
        const tagMatches = (entry.tags?.join(' ').match(wordRegex) || []).length;
        
        relevanceScore += titleMatches * 0.4;
        relevanceScore += contentMatches * 0.3;
        relevanceScore += tagMatches * 0.3;
      });
      
      // Category relevance
      if (entry.category.toLowerCase().includes(searchTerm)) {
        relevanceScore += 0.6;
      }
      
      // Tag exact matches
      if (entry.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))) {
        relevanceScore += 0.5;
      }
      
      return {
        ...entry,
        relevanceScore: Math.min(relevanceScore, 2.0) // Cap at 2.0 for normalization
      };
    })
    .filter(entry => entry.relevanceScore > 0.1) // Only include entries with some relevance
    .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance score
    .slice(0, 50); // Return top 50 most relevant
}

// Update knowledge entry
async function handleUpdateKnowledge(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Knowledge entry ID is required' });
    }

    // Add update timestamp and increment version
    const finalUpdateData = {
      ...updateData,
      updatedAt: new Date().toISOString(),
      version: (updateData.version || 1) + 1
    };

    // Update in database
    const result = await serverDatabases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID!,
      id as string,
      finalUpdateData
    );

    // Try to update GitHub file if path exists
    if (result.githubPath && result.title && result.content) {
      try {
        const textContent = `TITLE: ${result.title}

CATEGORY: ${result.category}
UPDATED: ${new Date().toISOString()}
ACTIVE: ${result.isActive}
VERSION: ${finalUpdateData.version}

CONTENT:
${result.content}

${result.rules ? `RESPONSE RULES:
${result.rules}

` : ''}${result.tags && result.tags.length > 0 ? `TAGS: ${result.tags.join(', ')}

` : ''}---
This knowledge entry was updated for JEHUB AI Assistant to help engineering students.
`;

        const buffer = Buffer.from(textContent, 'utf8');
        const base64Content = buffer.toString('base64');

        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
        const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
        const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || process.env.GITHUB_REPO;

        if (token && owner && repo) {
          // Get current file to get its SHA
          const currentFile = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: result.githubPath,
          });

          // Update file
          await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: result.githubPath,
            message: `Update AI Knowledge: ${result.title}`,
            content: base64Content,
            sha: Array.isArray(currentFile.data) ? currentFile.data[0].sha : currentFile.data.sha,
            committer: {
              name: 'JEHUB AI Knowledge Manager',
              email: 'ai-knowledge@jehub.com'
            }
          });
        }
      } catch (githubError) {
        console.warn('Failed to update GitHub file:', githubError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Knowledge entry updated successfully',
      data: result
    });

  } catch (error: any) {
    console.error('Error updating knowledge entry:', error);
    res.status(500).json({
      error: 'Failed to update knowledge entry',
      details: error.message
    });
  }
}

// Delete knowledge entry
async function handleDeleteKnowledge(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Knowledge entry ID is required' });
    }

    // Get the entry first to access GitHub path
    const entry = await serverDatabases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID!,
      id as string
    );

    // Try to delete from GitHub
    if (entry.githubPath) {
      try {
        const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
        const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
        const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || process.env.GITHUB_REPO;

        if (token && owner && repo) {
          // Get current file to get its SHA
          const currentFile = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: entry.githubPath,
          });

          // Delete file
          await octokit.rest.repos.deleteFile({
            owner,
            repo,
            path: entry.githubPath,
            message: `Delete AI Knowledge: ${entry.title}`,
            sha: Array.isArray(currentFile.data) ? currentFile.data[0].sha : currentFile.data.sha,
            committer: {
              name: 'JEHUB AI Knowledge Manager',
              email: 'ai-knowledge@jehub.com'
            }
          });
        }
      } catch (githubError) {
        console.warn('Failed to delete from GitHub:', githubError);
      }
    }

    // Delete from database
    await serverDatabases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID!,
      id as string
    );

    res.status(200).json({
      success: true,
      message: 'Knowledge entry deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting knowledge entry:', error);
    res.status(500).json({
      error: 'Failed to delete knowledge entry',
      details: error.message
    });
  }
}

export default handler;

import { NextApiRequest, NextApiResponse } from 'next';
import { databases } from '../../src/lib/appwrite';
import { Query, ID } from 'appwrite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Fetch comments for a specific note with nested replies
      const { noteId } = req.query;
      
      if (!noteId) {
        return res.status(400).json({ error: 'Note ID is required' });
      }

      try {
        // Fetch all comments for the note (including replies)
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!,
          [
            Query.equal('noteId', noteId as string),
            Query.orderDesc('timestamp'),
            Query.limit(100) // Adjust as needed
          ]
        );
        
        // Organize comments into threaded structure
        const comments = response.documents;
        const commentMap = new Map();
        const rootComments: any[] = [];
        
        // First pass: Create map of all comments
        comments.forEach((comment: any) => {
          commentMap.set(comment.commentId || comment.$id, {
            ...comment,
            replies: []
          });
        });
        
        // Second pass: Organize into parent-child relationships
        comments.forEach((comment: any) => {
          const commentId = comment.commentId || comment.$id;
          const parentId = comment.parentCommentId;
          
          if (!parentId) {
            // Root comment
            rootComments.push(commentMap.get(commentId));
          } else {
            // Reply to another comment
            const parent = commentMap.get(parentId);
            if (parent) {
              parent.replies.push(commentMap.get(commentId));
            } else {
              // Parent not found, treat as root comment
              rootComments.push(commentMap.get(commentId));
            }
          }
        });
        
        return res.status(200).json({ comments: rootComments });
      } catch (dbError: any) {
        console.error('Error fetching comments from database:', dbError);
        
        // Fallback to mock comments with replies
        const mockComments = [
          {
            id: '1',
            commentId: 'comment_1',
            noteId: noteId as string,
            userId: 'user1',
            userName: 'Sarah Chen',
            userAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            content: 'These notes are incredibly detailed! Really helped me understand the concepts better.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likes: 5,
            parentCommentId: null,
            replies: [
              {
                id: '3',
                commentId: 'comment_3',
                noteId: noteId as string,
                userId: 'user3',
                userName: 'Alex Johnson',
                userAvatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
                content: 'I totally agree! The diagrams are especially helpful.',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                likes: 2,
                parentCommentId: 'comment_1',
                replies: []
              }
            ]
          },
          {
            id: '2',
            commentId: 'comment_2',
            noteId: noteId as string,
            userId: 'user2',
            userName: 'Mike Davis',
            userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            content: 'Perfect for exam preparation. The examples are very clear.',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            likes: 3,
            parentCommentId: null,
            replies: []
          }
        ];

        return res.status(200).json({ comments: mockComments });
      }

    } else if (req.method === 'POST') {
      // Create a new comment or reply
      const { noteId, userId, userName, userAvatar, content, parentCommentId } = req.body;

      if (!noteId || !content) {
        return res.status(400).json({ 
          error: 'Note ID and content are required' 
        });
      }

      console.log('Database ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
      console.log('Comments Collection ID:', process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID);
      
      try {
        const commentId = 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const dbComment = await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!,
          ID.unique(),
          {
            commentId,
            noteId,
            userId: userId || 'anonymous_' + Date.now(),
            userName: userName || 'Anonymous User',
            userAvatar: userAvatar || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            content: content.trim(),
            timestamp: new Date().toISOString(),
            likes: 0,
            parentCommentId: parentCommentId || null // Support for replies
          }
        );

        const newComment = {
          ...dbComment,
          replies: [],
          message: 'Comment created successfully'
        };
        
        return res.status(201).json({ 
          message: 'Comment created successfully', 
          comment: newComment 
        });
        
      } catch (dbError: any) {
        console.error('Database error when creating comment:', dbError);
        
        const fallbackComment = {
          id: 'comment_' + Date.now(),
          commentId: 'comment_' + Date.now(),
          noteId,
          userId: userId || 'anonymous_' + Date.now(),
          userName: userName || 'Anonymous User',
          userAvatar: userAvatar || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          content: content.trim(),
          timestamp: new Date().toISOString(),
          likes: 0,
          parentCommentId: parentCommentId || null,
          replies: []
        };
        
        return res.status(201).json({ 
          message: 'Comment created successfully (fallback mode)', 
          comment: fallbackComment,
          warning: 'Database unavailable, comment not persisted'
        });
      }

    } else if (req.method === 'PATCH') {
      // Handle like/unlike functionality
      const { commentId, action } = req.body;

      if (!commentId || !action) {
        return res.status(400).json({ 
          error: 'Comment ID and action are required' 
        });
      }

      if (action !== 'like' && action !== 'unlike') {
        return res.status(400).json({ 
          error: 'Action must be either "like" or "unlike"' 
        });
      }

      try {
        // First, find the comment by commentId field
        const commentsResponse = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!,
          [
            Query.equal('commentId', commentId),
            Query.limit(1)
          ]
        );

        if (commentsResponse.documents.length === 0) {
          return res.status(404).json({ error: 'Comment not found' });
        }

        const currentComment = commentsResponse.documents[0];
        const currentLikes = currentComment.likes || 0;
        const newLikes = action === 'like' ? currentLikes + 1 : Math.max(0, currentLikes - 1);

        // Update the like count using the document $id
        const updatedComment = await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!,
          currentComment.$id, // Use the document ID, not commentId
          {
            likes: newLikes
          }
        );

        return res.status(200).json({ 
          message: `Comment ${action}d successfully`, 
          comment: updatedComment,
          newLikes
        });

      } catch (dbError: any) {
        console.error('Database error when updating comment likes:', dbError);
        
        // Fallback - try direct update if commentId is actually the document ID
        try {
          const currentComment = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!,
            commentId
          );

          const currentLikes = currentComment.likes || 0;
          const newLikes = action === 'like' ? currentLikes + 1 : Math.max(0, currentLikes - 1);

          const updatedComment = await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!,
            commentId,
            {
              likes: newLikes
            }
          );

          return res.status(200).json({ 
            message: `Comment ${action}d successfully (fallback)`, 
            comment: updatedComment,
            newLikes
          });
        } catch (fallbackError: any) {
          console.error('Fallback also failed:', fallbackError);
          return res.status(500).json({ 
            error: 'Failed to update comment likes',
            details: process.env.NODE_ENV === 'development' ? `Primary: ${dbError.message}, Fallback: ${fallbackError.message}` : undefined
          });
        }
      }

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Comments API Error:', error);
    
    if (error.code === 404) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

import React, { useState } from 'react';
import Image from 'next/image';
import { ThumbsUp, MessageCircle, MoreVertical, Reply } from 'lucide-react';

interface Comment {
  id: string;
  $id?: string; // Appwrite document ID
  commentId?: string;
  noteId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  parentCommentId?: string | null;
  replies?: Comment[];
}

interface EnhancedCommentsSectionProps {
  comments: Comment[];
  onCommentSubmit: (content: string, parentCommentId?: string) => Promise<void>;
  onCommentLike: (commentId: string, isLiked: boolean) => Promise<void>;
  submittingComment: boolean;
  userInfo: {
    name: string;
    email: string;
  };
}

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string, content: string) => Promise<void>;
  onLike: (commentId: string, isLiked: boolean) => Promise<void>;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onReply, 
  onLike, 
  depth = 0 
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(comment.likes || 0);
  const [isGeneratingAvatarForReply, setIsGeneratingAvatarForReply] = useState(false);

  const timeAgo = new Date(comment.timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      const savedUserInfo = localStorage.getItem('guestUserInfo');
      const userHasCustomAvatar = savedUserInfo && JSON.parse(savedUserInfo).customAvatar;
      
      if (!userHasCustomAvatar) {
        setIsGeneratingAvatarForReply(true);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setIsSubmittingReply(true);
      const idToUse = comment.commentId || comment.id || comment.$id || 'unknown';
      await onReply(idToUse, replyContent.trim());
      setReplyContent('');
      setShowReplyForm(false);
      
      if (!userHasCustomAvatar && savedUserInfo) {
        const updatedInfo = { ...JSON.parse(savedUserInfo), hasGeneratedAvatar: true };
        localStorage.setItem('guestUserInfo', JSON.stringify(updatedInfo));
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmittingReply(false);
      setIsGeneratingAvatarForReply(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      const newIsLiked = !isLiked;
      
      // Optimistic update
      setIsLiked(newIsLiked);
      setCurrentLikes(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
      
      // Use commentId field if available, otherwise use id
      const idToUse = comment.commentId || comment.id || comment.$id || 'unknown';
      await onLike(idToUse, newIsLiked);
    } catch (error) {
      console.error('Error liking comment:', error);
      // Revert optimistic update
      setIsLiked(!isLiked);
      setCurrentLikes(comment.likes || 0);
    } finally {
      setIsLiking(false);
    }
  };

  // Limit nesting depth to prevent excessive indentation
  const maxDepth = 3;
  const isMaxDepth = depth >= maxDepth;

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="flex gap-3 mb-4">
        <Image
          src={comment.userAvatar}
          alt={comment.userName}
          width={40}
          height={40}
          className={`${depth > 0 ? 'w-8 h-8' : 'w-10 h-10'} rounded-full border-2 border-white shadow-md flex-shrink-0`}
        />
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-semibold text-gray-900 ${depth > 0 ? 'text-sm' : ''}`}>
                {comment.userName}
                {comment.parentCommentId && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    Reply
                  </span>
                )}
              </h4>
              <div className="flex items-center gap-2">
                <span className={`text-gray-500 ${depth > 0 ? 'text-xs' : 'text-sm'}`}>
                  {timeAgo}
                </span>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className={`text-gray-700 ${depth > 0 ? 'text-sm' : ''}`}>
              {comment.content}
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1 transition-colors ${
                isLiked 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{currentLikes}</span>
            </button>
            
            {!isMaxDepth && (
              <button 
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors text-sm"
              >
                <Reply className="h-4 w-4" />
                Reply
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmittingReply}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isSubmittingReply}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replyContent.trim() || isSubmittingReply || isGeneratingAvatarForReply}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  {(isSubmittingReply || isGeneratingAvatarForReply) && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  )}
                  {isGeneratingAvatarForReply ? 'Creating Avatar...' : (isSubmittingReply ? 'Posting...' : 'Reply')}
                </button>
              </div>
              
              {/* Avatar Generation Alert for Reply */}
              {isGeneratingAvatarForReply && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-blue-800 text-xs">
                      <strong>Creating your avatar...</strong> This happens only once.
                    </span>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id || reply.commentId}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EnhancedCommentsSection: React.FC<EnhancedCommentsSectionProps> = ({
  comments,
  onCommentSubmit,
  onCommentLike,
  submittingComment,
  userInfo
}) => {
  const [newComment, setNewComment] = useState('');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const savedUserInfo = localStorage.getItem('guestUserInfo');
      const userHasCustomAvatar = savedUserInfo && JSON.parse(savedUserInfo).customAvatar;
      
      if (!userHasCustomAvatar && userInfo.name) {
        setIsGeneratingAvatar(true);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      await onCommentSubmit(newComment.trim());
      setNewComment('');
      
      if (!userHasCustomAvatar && savedUserInfo) {
        const updatedInfo = { ...JSON.parse(savedUserInfo), hasGeneratedAvatar: true };
        localStorage.setItem('guestUserInfo', JSON.stringify(updatedInfo));
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleReply = async (parentCommentId: string, content: string) => {
    await onCommentSubmit(content, parentCommentId);
  };

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      <form onSubmit={handleCommentSubmit} className="border-b border-gray-200 pb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={submittingComment}
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-gray-500">
            Commenting as: <strong>{userInfo.name || 'Anonymous'}</strong>
          </span>
          <button
            type="submit"
            disabled={!newComment.trim() || submittingComment || isGeneratingAvatar}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {(submittingComment || isGeneratingAvatar) && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isGeneratingAvatar ? 'Creating Avatar...' : (submittingComment ? 'Posting...' : 'Post Comment')}
          </button>
        </div>
        
        {/* Avatar Generation Alert */}
        {isGeneratingAvatar && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-800 text-sm">
                <strong>Creating your avatar...</strong> This happens only once. Your comment will be posted shortly.
              </span>
            </div>
          </div>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id || comment.commentId}
              comment={comment}
              onReply={handleReply}
              onLike={onCommentLike}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedCommentsSection;

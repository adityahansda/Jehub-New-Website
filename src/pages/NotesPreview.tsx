import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Download, 
  Eye, 
  Heart, 
  Share2, 
  Flag, 
  User, 
  Calendar, 
  BookOpen, 
  Tag, 
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';
import { mockNotes } from '../data/mockData';

const NotesPreview = () => {
  const router = useRouter();
  const { id } = router.query;
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Find the note by ID (in a real app, this would be an API call)
  const note = mockNotes.find(n => n.id === id) || mockNotes[0];
  
  // Mock preview pages (in a real app, this would be generated from the actual file)
  const totalPages = 15;
  
  // Mock comments
  const comments = [
    {
      id: '1',
      user: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'These notes are incredibly detailed! Really helped me understand the concepts better.',
      timestamp: '2 hours ago',
      likes: 5
    },
    {
      id: '2',
      user: 'Mike Davis',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'Perfect for exam preparation. The examples are very clear.',
      timestamp: '1 day ago',
      likes: 3
    }
  ];

  // Related notes (mock data)
  const relatedNotes = mockNotes.filter(n => n.id !== note.id && n.subject === note.subject).slice(0, 3);

  const handleDownload = () => {
    console.log('Downloading note:', note.id);
    // In a real app, this would trigger the actual download
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: note.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleReport = () => {
    console.log('Reporting note:', note.id);
    alert('Thank you for your report. We will review this content.');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      console.log('New comment:', newComment);
      setNewComment('');
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const zoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(zoomLevel + 25);
    }
  };

  const zoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(zoomLevel - 25);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/notes-download"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Notes
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Preview Area */}
          <div className="lg:col-span-3">
            {/* Note Header */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    {note.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{note.uploader}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{note.uploadDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{note.downloads} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>1,234 views</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{note.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {note.branch}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {note.semester} Semester
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {note.subject}
                    </span>
                    {note.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                  {note.points} pts
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Download className="h-5 w-5" />
                  Download Notes
                </button>
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isLiked 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-gray-200"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
                <button
                  onClick={handleReport}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-gray-200"
                >
                  <Flag className="h-5 w-5" />
                  Report
                </button>
              </div>
            </div>

            {/* Preview Controls */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={zoomOut}
                    disabled={zoomLevel <= 50}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[4rem] text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={zoomIn}
                    disabled={zoomLevel >= 200}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="bg-gray-100 rounded-lg p-8 text-center min-h-[600px] flex items-center justify-center">
                <div className="text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Preview Not Available</h3>
                  <p className="text-sm">
                    This is a demo preview area. In a real application, the actual document content would be displayed here.
                  </p>
                  <p className="text-xs mt-2">
                    Current page: {currentPage} | Zoom: {zoomLevel}%
                  </p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Comments ({comments.length})</h3>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {showComments ? 'Hide' : 'Show'} Comments
                </button>
              </div>

              {showComments && (
                <div className="space-y-6">
                  {/* Add Comment Form */}
                  <form onSubmit={handleCommentSubmit} className="border-b border-gray-200 pb-6">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Post Comment
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <img
                          src={comment.avatar}
                          alt={comment.user}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{comment.user}</h4>
                              <span className="text-sm text-gray-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                              <ThumbsUp className="h-4 w-4" />
                              <span className="text-sm">{comment.likes}</span>
                            </button>
                            <button className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Downloads</span>
                  <span className="font-semibold">{note.downloads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-semibold">{comments.length}</span>
                </div>
              </div>
            </div>

            {/* Uploader Info */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Uploader</h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                  alt={note.uploader}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{note.uploader}</h4>
                  <p className="text-sm text-gray-600">Scholar Level</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Notes Uploaded</span>
                  <span className="font-semibold">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Points</span>
                  <span className="font-semibold">2,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">Aug 2023</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                View Profile
              </button>
            </div>

            {/* Related Notes */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Related Notes</h3>
              <div className="space-y-4">
                {relatedNotes.map((relatedNote) => (
                  <Link
                    key={relatedNote.id}
                    href={`/notes-preview/${relatedNote.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  >
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                      {relatedNote.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      by {relatedNote.uploader}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600">{relatedNote.downloads} downloads</span>
                      <span className="text-xs font-medium text-purple-600">{relatedNote.points} pts</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/notes-download"
                className="block w-full mt-4 text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View All Notes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPreview;
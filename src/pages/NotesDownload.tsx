import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Download, Eye, Calendar, User, Tag, CheckCircle, X, Heart, Share2, Grid, List } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';
import LoadingSpinner from '../components/LoadingSpinner';
import { checkUrlStatus } from '../lib/pdfValidation';

// Convert raw GitHub URL to download URL
function convertToDownloadUrl(url: string): string {
  if (!url) return url;

  console.log('Converting URL to download:', url);

  // Handle raw.githubusercontent.com URLs
  if (url.includes('raw.githubusercontent.com')) {
    // Convert: https://raw.githubusercontent.com/user/repo/main/path/file.pdf
    // To: https://github.com/user/repo/raw/main/path/file.pdf
    const parts = url.replace('https://raw.githubusercontent.com/', '').split('/');
    if (parts.length >= 3) {
      const user = parts[0];
      const repo = parts[1];
      const branch = parts[2];
      const filePath = parts.slice(3).join('/');
      const downloadUrl = `https://github.com/${user}/${repo}/raw/${branch}/${filePath}`;
      console.log('Converted to download URL:', downloadUrl);
      return downloadUrl;
    }
  }

  // Handle github.com/user/repo/raw/ URLs
  if (url.includes('github.com') && url.includes('/raw/')) {
    console.log('Already a GitHub raw URL for download:', url);
    return url;
  }

  // Handle github.com/user/repo/blob/ URLs (convert to raw for download)
  if (url.includes('github.com') && url.includes('/blob/')) {
    const downloadUrl = url.replace('/blob/', '/raw/');
    console.log('Converted blob to raw URL:', downloadUrl);
    return downloadUrl;
  }

  // If it's already a download URL or other format, return as is
  console.log('URL unchanged:', url);
  return url;
}

type Note = {
  id: string;
  title: string;
  branch: string;
  semester: string;
  subject: string;
  description: string;
  tags: string[];
  uploader: string;
  uploadDate: string;
  githubUrl: string;
  fileName: string;
  downloads: number;
  likes: number;
  points: number;
  degree: string;
};

const NotesDownload = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    branch: '',
    semester: '',
    subject: '',
    degree: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [downloadPopup, setDownloadPopup] = useState<{
    show: boolean;
    noteTitle: string;
    status: 'downloading' | 'success' | 'error';
  }>({ show: false, noteTitle: '', status: 'downloading' });
  const [likedNotes, setLikedNotes] = useState<Set<string>>(new Set());

  // Load liked notes from localStorage on component mount
  useEffect(() => {
    const savedLikedNotes = localStorage.getItem('likedNotes');
    if (savedLikedNotes) {
      try {
        const likedNotesArray = JSON.parse(savedLikedNotes);
        setLikedNotes(new Set(likedNotesArray));
      } catch (error) {
        console.error('Error parsing liked notes from localStorage:', error);
      }
    }
  }, []);

  // Save liked notes to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('likedNotes', JSON.stringify(Array.from(likedNotes)));
  }, [likedNotes]);

  const branches = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics'];
  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  const degrees = ['B.Tech', 'Diploma'];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
          [Query.orderDesc('uploadDate')]
        );

        const fetchedNotes = response.documents.map(doc => ({
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
          points: doc.points || 0,
          degree: doc.degree
        }));

        setNotes(fetchedNotes);
      } catch (err) {
        setError('Failed to fetch notes. Please try again later.');
        console.error('Error fetching notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = !filters.branch || note.branch === filters.branch;
    const matchesSemester = !filters.semester || note.semester === filters.semester;
    const matchesDegree = !filters.degree || note.degree === filters.degree;
    const matchesSubject = !filters.subject || note.subject.toLowerCase().includes(filters.subject.toLowerCase());

    return matchesSearch && matchesBranch && matchesSemester && matchesSubject && matchesDegree;
  });

  const handleDownload = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Show download popup
    setDownloadPopup({
      show: true,
      noteTitle: note.title,
      status: 'downloading'
    });

    try {
      // First validate the PDF URL
      const urlValidation = await checkUrlStatus(note.githubUrl);
      
      if (urlValidation.status === 'deleted') {
        setDownloadPopup(prev => ({ ...prev, status: 'error' }));
        setTimeout(() => {
          setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
        }, 3000);
        alert('This PDF has been deleted from GitHub and is no longer available. Please contact the administrator.');
        return;
      }

      if (urlValidation.status === 'error') {
        console.warn('PDF validation failed, but attempting download anyway');
      }
      // Update download count in database
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
        noteId,
        {
          downloads: note.downloads + 1
        }
      );

      // Update local state
      setNotes(prevNotes =>
        prevNotes.map(n =>
          n.id === noteId
            ? { ...n, downloads: n.downloads + 1 }
            : n
        )
      );

      // Convert raw URL to download URL and create download link
      const downloadUrl = convertToDownloadUrl(note.githubUrl) || `https://example.com/notes/${note.fileName}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', note.fileName);
      link.target = '_blank'; // Open in new tab for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update popup status
      setTimeout(() => {
        setDownloadPopup(prev => ({ ...prev, status: 'success' }));

        // Auto-hide after 2 seconds
        setTimeout(() => {
          setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
        }, 2000);
      }, 500);
    } catch (error) {
      console.error('Error updating download count:', error);

      // Still proceed with download but show error status
      const downloadUrl = convertToDownloadUrl(note.githubUrl) || `https://example.com/notes/${note.fileName}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', note.fileName);
      link.target = '_blank'; // Open in new tab for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update popup status to show error
      setTimeout(() => {
        setDownloadPopup(prev => ({ ...prev, status: 'error' }));

        // Auto-hide after 3 seconds for error
        setTimeout(() => {
          setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
        }, 3000);
      }, 500);
    }
  };

  const closePopup = () => {
    setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
  };

  const handleLike = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const isLiked = likedNotes.has(noteId);
    const newLikes = isLiked ? note.likes - 1 : note.likes + 1;
    
    // Optimistic update - update UI immediately
    setNotes(prevNotes =>
      prevNotes.map(n =>
        n.id === noteId ? { ...n, likes: newLikes } : n
      )
    );
    
    setLikedNotes(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });

    try {
      // Update database
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
        noteId,
        { likes: newLikes }
      );
    } catch (error) {
      console.error('Error updating like:', error);
      
      // Revert optimistic update on error
      setNotes(prevNotes =>
        prevNotes.map(n =>
          n.id === noteId ? { ...n, likes: note.likes } : n
        )
      );
      
      setLikedNotes(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(noteId);
        } else {
          newSet.delete(noteId);
        }
        return newSet;
      });
    }
  };

  const handleShare = (note: Note) => {
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: note.description,
        url: `${window.location.origin}/notes-preview/${note.id}`,
      });
    } else {
      // Fallback: copy to clipboard
      const shareUrl = `${window.location.origin}/notes-preview/${note.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            📚 Download Notes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access thousands of high-quality notes from students worldwide
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg mt-8">
            {error}
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notes by title, subject, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <select
                    value={filters.branch}
                    onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Branches</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>

                  <select
                    value={filters.semester}
                    onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Semesters</option>
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>{semester}</option>
                    ))}
                  </select>

                  <select
                    value={filters.degree}
                    onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Degrees</option>
                    {degrees.map(degree => (
                      <option key={degree} value={degree}>{degree}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Subject"
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 w-full focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Found {filteredNotes.length} notes
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    title="Grid View"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notes Grid/List */}
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4'}`}>
              {filteredNotes.map((note) => (
                <div key={note.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {note.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <User className="h-4 w-4 mr-1" />
                          <span className="mr-4">{note.uploader}</span>
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(note.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {note.points} pts
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {note.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {note.branch}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {note.semester} Semester
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {note.subject}
                      </span>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
                        {note.degree}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-gray-600">
                            <Download className="h-4 w-4 mr-1" />
                            <span>{note.downloads}</span>
                            <span className="ml-1 hidden sm:inline">downloads</span>
                          </div>
                          <button
                            onClick={() => handleLike(note.id)}
                            className="flex items-center transition-all duration-200 hover:scale-105 group"
                          >
                            <Heart 
                              className={`h-4 w-4 mr-1 transition-all duration-200 stroke-2 ${
                                likedNotes.has(note.id) 
                                  ? 'fill-red-500 text-red-500 scale-110' 
                                  : 'text-gray-700 hover:text-red-500 group-hover:fill-red-100'
                              }`} 
                            />
                            <span className={`transition-colors ${
                              likedNotes.has(note.id) ? 'text-red-500 font-medium' : 'text-gray-700'
                            }`}>
                              {note.likes}
                            </span>
                            <span className="ml-1 hidden sm:inline text-gray-600">likes</span>
                          </button>
                        </div>
                        <div className="flex items-center space-x-2 pr-2">
                          <Link
                            href={`/notes-preview/${note.id}`}
                            className="flex items-center px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Link>
                          <button
                            onClick={() => handleDownload(note.id)}
                            className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-4">
                      {note.tags.map((tag, index) => (
                        <span key={index} className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No notes found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or filters to find what you&quot;re looking for.
                </p>
              </div>
            )}
          </>
        )}

        {/* Download Popup */}
        {downloadPopup.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform animate-slideUp">
              {/* Popup Content */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {downloadPopup.status === 'downloading' ? 'Downloading...' :
                    downloadPopup.status === 'success' ? 'Download Complete!' : 'Download Failed'}
                </h3>
                <button
                  onClick={closePopup}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center mb-4">
                {downloadPopup.status === 'downloading' && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                )}
                {downloadPopup.status === 'success' && (
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3 animate-bounce" />
                )}
                {downloadPopup.status === 'error' && (
                  <X className="h-8 w-8 text-red-600 mr-3" />
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {downloadPopup.status === 'downloading' ? 'Preparing your download...' :
                      downloadPopup.status === 'success' ? 'Your file is ready!' :
                        'Something went wrong. Please try again.'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {downloadPopup.noteTitle}
                  </p>
                </div>
              </div>

              {downloadPopup.status === 'downloading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                </div>
              )}

              {downloadPopup.status === 'success' && (
                <div className="flex justify-end">
                  <button
                    onClick={closePopup}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesDownload;

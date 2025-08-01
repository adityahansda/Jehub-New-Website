import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit3, 
  ChevronDown, 
  Search, 
  Filter,
  Link as LinkIcon,
  Download,
  Calendar,
  User,
  BookOpen,
  Loader
} from 'lucide-react';
import { databases } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { DATABASE_ID, NOTES_COLLECTION_ID } from '../../appwrite/config';
import { useAuth } from '../../contexts/AuthContext';

interface NotesCenterProps {
  userRole: string;
}

interface Note {
  $id: string;
  title: string;
  subject: string;
  semester: string;
  branch: string;
  authorName: string;
  authorEmail?: string;
  description?: string;
  tags?: string;
  noteType: string;
  githubUrl?: string;
  downloadCount?: number;
  likes?: number;
  status?: 'pending' | 'approved' | 'rejected';
  $createdAt: string;
  $updatedAt: string;
}

const NotesCenter: React.FC<NotesCenterProps> = ({ userRole }) => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({ subject: '', semester: '', submittedBy: '' });
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);

  // Fetch notes from database
  useEffect(() => {
    const fetchNotes = async () => {
      // Wait for authentication to complete
      if (authLoading) {
        console.log('Waiting for authentication...');
        return;
      }
      
      if (!user) {
        console.log('No user logged in');
        setError('Please log in to access notes.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('User authenticated:', {
          email: user.email,
          userProfile: userProfile?.role,
          userRole
        });
        
        console.log('Fetching notes from:', {
          DATABASE_ID,
          NOTES_COLLECTION_ID
        });
        
        // Try to fetch notes with error handling
        const response = await databases.listDocuments(
          DATABASE_ID,
          NOTES_COLLECTION_ID,
          [
            Query.orderDesc('$createdAt'),
            Query.limit(100)
          ]
        );
        
        console.log('Notes response:', response);
        
        const notesData = response.documents as unknown as Note[];
        setNotes(notesData);
        
        // Extract unique subjects and semesters for filters
        const uniqueSubjects = [...new Set(notesData.map(note => note.subject).filter(Boolean))];
        const uniqueSemesters = [...new Set(notesData.map(note => note.semester).filter(Boolean))];
        
        setSubjects(uniqueSubjects);
        setSemesters(uniqueSemesters);
        
        console.log(`Successfully loaded ${notesData.length} notes`);
        
      } catch (err: any) {
        console.error('Error fetching notes:', err);
        
        // Handle specific error types
        if (err.code === 401) {
          setError('Access denied. Your account may not have permission to view notes. Please contact an administrator.');
        } else if (err.code === 404) {
          setError('Notes collection not found. Please check the database configuration.');
        } else if (err.message?.includes('unauthorized')) {
          setError('Unauthorized access. Please ensure you have the correct permissions.');
        } else {
          setError(`Failed to fetch notes: ${err.message || 'Unknown error'}`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, [authLoading, user, userProfile, userRole]);

  // Filter notes based on search and filters
  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.authorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !filter.subject || note.subject === filter.subject;
    const matchesSemester = !filter.semester || note.semester === filter.semester;
    const matchesSubmittedBy = !filter.submittedBy || note.authorName?.includes(filter.submittedBy);

    return matchesSearch && matchesSubject && matchesSemester && matchesSubmittedBy;
  });

  const handleApprove = async (noteId: string) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        noteId,
        { status: 'approved' }
      );
      
      setNotes(prev => prev.map(note => 
        note.$id === noteId ? { ...note, status: 'approved' } : note
      ));
      alert('Note has been approved!');
    } catch (error) {
      console.error('Error approving note:', error);
      alert('Failed to approve note. Please try again.');
    }
  };

  const handleReject = async (noteId: string) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        noteId,
        { status: 'rejected' }
      );
      
      setNotes(prev => prev.map(note => 
        note.$id === noteId ? { ...note, status: 'rejected' } : note
      ));
      alert('Note has been rejected!');
    } catch (error) {
      console.error('Error rejecting note:', error);
      alert('Failed to reject note. Please try again.');
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }
    
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        noteId
      );
      
      setNotes(prev => prev.filter(note => note.$id !== noteId));
      alert('Note has been deleted successfully!');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleEditRequest = (noteId: string) => {
    console.log('Request edit for note:', noteId);
    alert(`Edit request sent for note ${noteId}`);
  };

  const handleGenerateLink = (noteId: string) => {
    const generatedLink = `${window.location.origin}/notes/preview/${noteId}`;
    navigator.clipboard.writeText(generatedLink);
    alert(`Shareable link copied to clipboard: ${generatedLink}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notes Center</h2>
          <p className="text-gray-600">Review and manage notes submissions</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter.subject}
            onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <select
            value={filter.semester}
            onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Semesters</option>
            {semesters.map(semester => (
              <option key={semester} value={semester}>{semester}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Notes</p>
              <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{notes.filter(n => n.status === 'approved').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{notes.filter(n => n.status === 'rejected').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Loader className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{notes.filter(n => n.status === 'pending' || !n.status).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notes Submissions ({filteredNotes.length})</h3>
          {loading && <Loader className="h-5 w-5 animate-spin text-blue-500" />}
        </div>
        
        {error && (
          <div className="p-6 text-center">
            <div className="text-red-600 mb-2">
              <XCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error Loading Notes</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        
        {loading && (
          <div className="p-8 text-center">
            <Loader className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading notes...</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="divide-y divide-gray-200">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notes found matching your criteria.</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div key={note.$id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {note.subject?.charAt(0) || 'N'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{note.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            note.status === 'approved' ? 'bg-green-100 text-green-800' :
                            note.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {note.status || 'pending'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {note.subject}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {note.semester} Semester
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {note.authorName}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(note.$createdAt).toLocaleDateString()}
                          </span>
                          {note.downloadCount && (
                            <span className="flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              {note.downloadCount} downloads
                            </span>
                          )}
                        </div>
                        {note.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{note.description}</p>
                        )}
                        {note.tags && (
                          <div className="flex flex-wrap gap-1">
                            {note.tags.split(',').map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {(!note.status || note.status === 'pending') && userRole === 'admin' && (
                        <>
                          <button
                            onClick={() => handleApprove(note.$id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve Note"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(note.$id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject Note"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleGenerateLink(note.$id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Copy Share Link"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEditRequest(note.$id)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Request Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDelete(note.$id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Note"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      {note.githubUrl && (
                        <a
                          href={note.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="View on GitHub"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesCenter;


import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit3, 
  ChevronDown, 
  Search, 
  Filter,
  Link as LinkIcon
} from 'lucide-react';

interface NotesCenterProps {
  userRole: string;
}

const NotesCenter: React.FC<NotesCenterProps> = ({ userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({ subject: '', semester: '', submittedBy: '' });

  const notesSubmissions = [
    {
      id: 1,
      title: 'Calculus 101',
      subject: 'Mathematics',
      semester: '1st',
      submittedBy: 'Alice Johnson',
      status: 'pending',
      submissionDate: '2025-01-15',
      shareLink: ''
    },
    {
      id: 2,
      title: 'World History',
      subject: 'History',
      semester: '2nd',
      submittedBy: 'Bob Smith',
      status: 'approved',
      submissionDate: '2025-02-01',
      shareLink: 'history.com/share/123'
    },
    {
      id: 3,
      title: 'Organic Chemistry',
      subject: 'Chemistry',
      semester: '3rd',
      submittedBy: 'Charlie Brown',
      status: 'rejected',
      submissionDate: '2025-01-20',
      shareLink: ''
    }
  ];

  const filteredNotes = notesSubmissions.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !filter.subject || note.subject === filter.subject;
    const matchesSemester = !filter.semester || note.semester === filter.semester;
    const matchesSubmittedBy = !filter.submittedBy || note.submittedBy.includes(filter.submittedBy);

    return matchesSearch && matchesSubject && matchesSemester && matchesSubmittedBy;
  });

  const handleApprove = (noteId: number) => {
    console.log('Approve note:', noteId);
  };

  const handleReject = (noteId: number) => {
    console.log('Reject note:', noteId);
  };

  const handleEditRequest = (noteId: number) => {
    console.log('Request edit for note:', noteId);
  };

  const handleGenerateLink = (noteId: number) => {
    console.log('Generate shareable link for note:', noteId);
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
            <option value="Mathematics">Mathematics</option>
            <option value="History">History</option>
            <option value="Chemistry">Chemistry</option>
          </select>
          <select
            value={filter.semester}
            onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Semesters</option>
            <option value="1st">1st</option>
            <option value="2nd">2nd</option>
            <option value="3rd">3rd</option>
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Notes Submissions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredNotes.map((note) => (
            <div key={note.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white">
                    {note.subject.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-semibold text-gray-900">{note.title}</h4>
                      <span className="text-xs text-gray-500">{note.semester} Semester</span>
                      <span className="text-xs text-gray-500">Submitted by {note.submittedBy}</span>
                      <span className="text-xs text-gray-500">{note.submissionDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {note.status === 'pending' && userRole === 'admin' && (
                    <>
                      <button
                        onClick={() => handleApprove(note.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReject(note.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditRequest(note.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {note.shareLink && (
                    <button
                      onClick={() => navigator.clipboard.writeText(note.shareLink)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  )}
                  {!note.shareLink && note.status === 'approved' && (
                    <button
                      onClick={() => handleGenerateLink(note.id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesCenter;


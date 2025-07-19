import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download,
  Eye,
  Calendar,
  User,
  ExternalLink,
  FileText,
  Database,
  Shield
} from 'lucide-react';
import { 
  validateAllPdfs, 
  autoCleanupDeletedNotes, 
  deleteNoteFromDatabase, 
  ValidationResult, 
  ValidationReport 
} from '../lib/pdfValidation';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPdfValidation = () => {
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'deleted' | 'error'>('all');
  const [showDeletedOnly, setShowDeletedOnly] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleValidateAll = async () => {
    setLoading(true);
    try {
      const report = await validateAllPdfs();
      setValidationReport(report);
      showMessage('success', `Validation complete! Found ${report.deletedUrls} deleted PDFs out of ${report.totalChecked} total.`);
    } catch (error) {
      showMessage('error', 'Failed to validate PDFs. Please try again.');
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCleanup = async () => {
    setCleanupLoading(true);
    try {
      const result = await autoCleanupDeletedNotes();
      setValidationReport(result.report);
      showMessage('success', `Auto-cleanup complete! Deleted ${result.deletedCount} notes from database.`);
    } catch (error) {
      showMessage('error', 'Failed to perform auto-cleanup. Please try again.');
      console.error('Cleanup error:', error);
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotes.size === 0) {
      showMessage('error', 'Please select notes to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedNotes.size} selected notes from the database?`)) {
      return;
    }

    setLoading(true);
    let deletedCount = 0;
    let failedCount = 0;

    const noteIds = Array.from(selectedNotes);
    for (const noteId of noteIds) {
      try {
        await deleteNoteFromDatabase(noteId);
        deletedCount++;
      } catch (error) {
        failedCount++;
        console.error('Failed to delete note:', noteId, error);
      }
    }

    // Refresh validation report
    try {
      const report = await validateAllPdfs();
      setValidationReport(report);
    } catch (error) {
      console.error('Failed to refresh validation report:', error);
    }

    setSelectedNotes(new Set());
    showMessage('success', `Deleted ${deletedCount} notes. ${failedCount > 0 ? `Failed to delete ${failedCount} notes.` : ''}`);
    setLoading(false);
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!validationReport) return;
    
    const filteredResults = getFilteredResults();
    const allIds = new Set(filteredResults.map(result => result.id));
    
    if (selectedNotes.size === allIds.size) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(allIds);
    }
  };

  const getFilteredResults = () => {
    if (!validationReport) return [];
    
    let filtered = validationReport.results;
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(result => result.status === filterStatus);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.githubUrl.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Show deleted only
    if (showDeletedOnly) {
      filtered = filtered.filter(result => result.status === 'deleted');
    }
    
    return filtered;
  };

  const getStatusColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'deleted': return 'text-red-600 bg-red-100';
      case 'error': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-4 w-4" />;
      case 'deleted': return <XCircle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PDF Validation System</h1>
              <p className="text-gray-600">Check and manage GitHub PDF URLs in the database</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </span>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleValidateAll}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <LoadingSpinner size="small" color="text-white" /> : <RefreshCw className="h-4 w-4" />}
                Validate All PDFs
              </button>
              
              <button
                onClick={handleAutoCleanup}
                disabled={cleanupLoading}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cleanupLoading ? <LoadingSpinner size="small" color="text-white" /> : <Database className="h-4 w-4" />}
                Auto-Cleanup Deleted
              </button>
            </div>
            
            {validationReport && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Valid: {validationReport.validUrls}</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Deleted: {validationReport.deletedUrls}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span>Error: {validationReport.errorUrls}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {validationReport && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by title or URL..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="valid">Valid</option>
                    <option value="deleted">Deleted (404)</option>
                    <option value="error">Error</option>
                  </select>
                  
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showDeletedOnly}
                      onChange={(e) => setShowDeletedOnly(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    Show deleted only
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {selectedNotes.size === filteredResults.length ? 'Deselect All' : 'Select All'}
                  </button>
                  
                  {selectedNotes.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedNotes.size})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedNotes.size === filteredResults.length && filteredResults.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GitHub URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedNotes.has(result.id)}
                          onChange={() => handleSelectNote(result.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                          {getStatusIcon(result.status)}
                          {result.status.toUpperCase()}
                          {result.statusCode && ` (${result.statusCode})`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {result.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {result.githubUrl}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <a
                            href={result.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Open GitHub URL"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          
                          {result.status === 'deleted' && (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this note from the database?')) {
                                  handleDeleteSelected();
                                }
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete from database"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredResults.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  {validationReport ? 'Try adjusting your search or filters.' : 'Run validation to see results.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How to use this system:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Click &quot;Validate All PDFs&quot; to check all GitHub URLs in your database</li>
            <li>Review the results - red entries indicate deleted/404 PDFs</li>
            <li>Use &quot;Auto-Cleanup Deleted&quot; to automatically remove all 404 entries from the database</li>
            <li>Or manually select specific entries and delete them individually</li>
            <li>The system will show a message like &quot;This note has been deleted, contact admin&quot; when users try to access deleted PDFs</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminPdfValidation;

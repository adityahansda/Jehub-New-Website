import React, { useState } from 'react';
import { Plus, ArrowUp, Clock, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { mockRequests } from '../data/mockData';
import PageHeader from '../components/PageHeader';

const NotesRequest = () => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'fulfilled' | 'popular'>('all');
  const [requestData, setRequestData] = useState({
    title: '',
    branch: '',
    semester: '',
    subject: '',
    description: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const branches = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics'];
  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle request submission
    console.log('Request submitted:', requestData);
    setShowRequestForm(false);
    setRequestData({
      title: '',
      branch: '',
      semester: '',
      subject: '',
      description: ''
    });
  };

  const handleUpvote = (requestId: string) => {
    // Handle upvote
    console.log('Upvoted request:', requestId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'fulfilled': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = mockRequests.filter(request => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return request.status === 'pending';
    if (activeTab === 'fulfilled') return request.status === 'fulfilled';
    if (activeTab === 'popular') return request.upvotes > 15;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Page Header */}
      <PageHeader 
        title="Request Notes"
        icon={HelpCircle}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-xl text-gray-600">
            Can&quot;t find what you&quot;re looking for? Request it from the community
          </p>
        </div>

        {/* Request Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowRequestForm(true)}
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="h-5 w-5 mr-2" />
            Make a Request
          </button>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Submit a Request
                </h2>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Request Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={requestData.title}
                      onChange={(e) => setRequestData({ ...requestData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Need Machine Learning Notes for CSE 6th Sem"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch *
                      </label>
                      <select
                        required
                        value={requestData.branch}
                        onChange={(e) => setRequestData({ ...requestData, branch: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Semester *
                      </label>
                      <select
                        required
                        value={requestData.semester}
                        onChange={(e) => setRequestData({ ...requestData, semester: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Semester</option>
                        {semesters.map(semester => (
                          <option key={semester} value={semester}>{semester}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={requestData.subject}
                      onChange={(e) => setRequestData({ ...requestData, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Machine Learning, Data Structures"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={requestData.description}
                      onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe what specific topics or materials you need..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Requests' },
            { key: 'pending', label: 'Pending' },
            { key: 'fulfilled', label: 'Fulfilled' },
            { key: 'popular', label: 'Popular' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {request.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {request.branch}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {request.semester} Semester
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                      {request.subject}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">
                    {request.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">By: {request.user}</span>
                    <span>{request.timestamp}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1 capitalize">{request.status}</span>
                  </span>
                  <button
                    onClick={() => handleUpvote(request.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors group"
                  >
                    <ArrowUp className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      {request.upvotes}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No requests found
            </h3>
            <p className="text-gray-600">
              Be the first to make a request in this category!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesRequest;
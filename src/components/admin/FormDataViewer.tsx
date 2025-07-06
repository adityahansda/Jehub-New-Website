import React from 'react';
import { FileText, MessageSquare, Zap, Download, Upload, Calendar } from 'lucide-react';

interface FormDataViewerProps {
  userRole: string;
}

const FormDataViewer: React.FC<FormDataViewerProps> = ({ userRole }) => {
  const formsData = [
    {
      id: 1,
      type: 'Join Request',
      submittedBy: 'John Doe',
      submissionDate: '2025-02-15',
      status: 'Pending',
      details: 'wants to join as Developer'
    },
    {
      id: 2,
      type: 'Feedback',
      submittedBy: 'Jane Smith',
      submissionDate: '2025-02-14',
      status: 'Reviewed',
      details: 'Great platform, but can improve UX.'
    },
    {
      id: 3,
      type: 'Leave Request',
      submittedBy: 'Michael Brown',
      submissionDate: '2025-02-12',
      status: 'Approved',
      details: 'Requesting leave for medical reasons.'
    }
  ];

  const exportData = () => {
    console.log('Exporting data to CSV or integrate with Google Sheets');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Form Data Viewer</h2>
        <p className="text-gray-600">View submissions from various forms</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Form Submissions</h3>
          {userRole === 'admin' && (
            <button
              onClick={exportData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          )}
        </div>

        <div className="space-y-4">
          {formsData.map((form) => (
            <div key={form.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{form.type}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Submitted by: {form.submittedBy}</p>
                      <p>Date: {form.submissionDate}</p>
                      <p>Status: {form.status}</p>
                    </div>
                  </div>
                </div>
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>

              <p className="mt-3 text-sm text-gray-600">Details: {form.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormDataViewer;


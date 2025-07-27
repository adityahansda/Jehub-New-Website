import React, { useState } from 'react';
import { X, Flag, User, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reportData: ReportData) => void;
  noteTitle: string;
  submitting?: boolean;
}

export interface ReportData {
  reason: string;
  description: string;
  reporterName: string;
  reporterEmail: string;
}

const REPORT_REASONS = [
  'Copyright Violation',
  'Inappropriate Content',
  'Spam or Misleading',
  'Wrong Subject/Category',
  'Poor Quality',
  'Broken Link/File',
  'Other'
];

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  noteTitle,
  submitting = false
}) => {
  const [reportData, setReportData] = useState<ReportData>({
    reason: '',
    description: '',
    reporterName: '',
    reporterEmail: ''
  });

  const [errors, setErrors] = useState<Partial<ReportData>>({});

  // Load saved user info on component mount
  React.useEffect(() => {
    const savedUserInfo = localStorage.getItem('guestUserInfo');
    if (savedUserInfo) {
      try {
        const userInfo = JSON.parse(savedUserInfo);
        setReportData(prev => ({
          ...prev,
          reporterName: userInfo.name || '',
          reporterEmail: userInfo.email || ''
        }));
      } catch (error) {
        console.error('Error loading saved user info:', error);
      }
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<ReportData> = {};

    if (!reportData.reason.trim()) {
      newErrors.reason = 'Please select a reason for the report';
    }

    if (!reportData.description.trim()) {
      newErrors.description = 'Please provide a description of the issue';
    }

    if (!reportData.reporterName.trim()) {
      newErrors.reporterName = 'Please provide your name';
    }

    if (!reportData.reporterEmail.trim()) {
      newErrors.reporterEmail = 'Please provide your email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Save user info for future use
    const userInfo = {
      name: reportData.reporterName,
      email: reportData.reporterEmail
    };
    localStorage.setItem('guestUserInfo', JSON.stringify(userInfo));

    onSubmit(reportData);
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      // Reset form
      setTimeout(() => {
        setReportData({
          reason: '',
          description: '',
          reporterName: reportData.reporterName, // Keep name for convenience
          reporterEmail: reportData.reporterEmail // Keep email for convenience
        });
        setErrors({});
      }, 300);
    }
  };

  console.log('ReportModal - isOpen prop:', isOpen);
  if (!isOpen) {
    console.log('ReportModal - returning null because isOpen is false');
    return null;
  }
  console.log('ReportModal - rendering modal');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Flag className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Report Content</h3>
              <p className="text-sm text-gray-600">Help us maintain quality by reporting issues</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Note Info */}
        <div className="px-6 py-4 bg-gray-50">
          <p className="text-sm text-gray-600 mb-1">Reporting:</p>
          <p className="font-medium text-gray-900 truncate">{noteTitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Reporter Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={reportData.reporterName}
                  onChange={(e) => setReportData(prev => ({ ...prev, reporterName: e.target.value }))}
                  placeholder="Enter your name"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.reporterName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                />
              </div>
              {errors.reporterName && (
                <p className="mt-1 text-sm text-red-600">{errors.reporterName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={reportData.reporterEmail}
                onChange={(e) => setReportData(prev => ({ ...prev, reporterEmail: e.target.value }))}
                placeholder="your.email@example.com"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.reporterEmail ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={submitting}
              />
              {errors.reporterEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.reporterEmail}</p>
              )}
            </div>
          </div>

          {/* Report Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Report <span className="text-red-500">*</span>
            </label>
            <select
              value={reportData.reason}
              onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={submitting}
            >
              <option value="">Select a reason...</option>
              {REPORT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reportData.description}
              onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Please describe the issue in detail..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={submitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Minimum 10 characters. Be specific about the issue you&apos;re reporting.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Important Notice</p>
                <p className="text-yellow-700">
                  Please only report content that violates our community guidelines. 
                  False reports may result in action being taken against your account.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;

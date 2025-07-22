import React, { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  User, 
  Calendar,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Shield
} from 'lucide-react';

export interface Report {
  id: string;
  reason: string;
  description: string;
  reporterName: string;
  reporterEmail?: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null; // User's current vote on this report
}

interface ReportsSectionProps {
  reports: Report[];
  onVoteReport: (reportId: string, voteType: 'up' | 'down') => void;
  loading?: boolean;
}

const ReportsSection: React.FC<ReportsSectionProps> = ({
  reports,
  onVoteReport,
  loading = false
}) => {
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());

  const toggleReportExpansion = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Copyright Violation':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Inappropriate Content':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Spam or Misleading':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Wrong Subject/Category':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Poor Quality':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Broken Link/File':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Community Reports</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Community Reports</h3>
        </div>
        <div className="text-center py-8">
          <Flag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reports have been submitted yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Help maintain quality by reporting any issues you find.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Community Reports</h3>
          <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
            {reports.length}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((report) => {
          const isExpanded = expandedReports.has(report.id);
          const netVotes = report.upvotes - report.downvotes;
          
          return (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                {/* Reporter Avatar */}
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-blue-600" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 truncate">
                          {report.reporterName}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getReasonColor(report.reason)}`}>
                          {report.reason}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatRelativeTime(report.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Voting Controls */}
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                        <button
                          onClick={() => onVoteReport(report.id, 'up')}
                          className={`p-2 transition-colors hover:bg-green-100 ${
                            report.userVote === 'up' 
                              ? 'bg-green-100 text-green-600' 
                              : 'text-gray-600 hover:text-green-600'
                          }`}
                          title="Upvote this report"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <span className={`px-2 py-1 text-sm font-medium ${
                          netVotes > 0 
                            ? 'text-green-600' 
                            : netVotes < 0 
                              ? 'text-red-600' 
                              : 'text-gray-600'
                        }`}>
                          {netVotes > 0 ? `+${netVotes}` : netVotes}
                        </span>
                        <button
                          onClick={() => onVoteReport(report.id, 'down')}
                          className={`p-2 transition-colors hover:bg-red-100 ${
                            report.userVote === 'down' 
                              ? 'bg-red-100 text-red-600' 
                              : 'text-gray-600 hover:text-red-600'
                          }`}
                          title="Downvote this report"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description Preview */}
                  <div className="mt-2">
                    <p className="text-gray-700 text-sm">
                      {isExpanded 
                        ? report.description 
                        : `${report.description.slice(0, 120)}${report.description.length > 120 ? '...' : ''}`
                      }
                    </p>
                    
                    {report.description.length > 120 && (
                      <button
                        onClick={() => toggleReportExpansion(report.id)}
                        className="flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            Show more
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Vote Summary */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {report.upvotes} helpful
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3" />
                      {report.downvotes} not helpful
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      Report #{report.id.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>Total Reports: {reports.length}</span>
            <span>
              Total Votes: {reports.reduce((sum, report) => sum + report.upvotes + report.downvotes, 0)}
            </span>
          </div>
          <div className="text-xs">
            Community moderation helps maintain quality content
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;

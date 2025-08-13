import React from 'react';
import { Download, Eye, Calendar, User, Tag, Heart, Share2, FileText, Coins, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

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
  views: number;
  reports: number;
  fileSize: number | null;
  noteType: 'free' | 'premium';
  degree: string;
};

interface HorizontalNotesCardProps {
  note: Note;
  index: number;
  onDownload: (noteId: string) => void;
  onPreview: (note: Note) => void;
  onLike: (noteId: string) => void;
  onShare: (note: Note) => void;
  isLiked: boolean;
  noteRequirements: { required: boolean; points: number; category: string } | undefined;
  userPoints: { availablePoints: number; points: number; pointsSpent: number };
  user: any;
  formatFileSize: (bytes: number) => string;
}

const HorizontalNotesCard: React.FC<HorizontalNotesCardProps> = ({
  note,
  index,
  onDownload,
  onPreview,
  onLike,
  onShare,
  isLiked,
  noteRequirements,
  userPoints,
  user,
  formatFileSize
}) => {
  const requiredPoints = noteRequirements?.points || note.points || 0;
  const isPointsRequired = requiredPoints > 0;
  const hasEnoughPoints = !isPointsRequired || !user || userPoints.availablePoints >= requiredPoints;
  const needsAuth = isPointsRequired && !user;

  // Calculate progress percentage (mock calculation based on downloads vs views)
  const progressPercentage = Math.min(Math.round((note.downloads / Math.max(note.views, 1)) * 100), 100);

  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200 group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -1 }}
    >
      <div className="flex items-center p-4 gap-4">
        {/* Left side - Document Thumbnail */}
        <div className="w-16 h-20 bg-gray-50 rounded-md border border-gray-200 flex-shrink-0 relative overflow-hidden">
          {/* Document preview with content */}
          <div className="absolute inset-0 p-2 flex flex-col space-y-1">
            <div className="h-0.5 bg-gray-300 rounded w-full"></div>
            <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
            <div className="h-0.5 bg-gray-300 rounded w-full"></div>
            <div className="h-0.5 bg-gray-300 rounded w-2/3"></div>
            <div className="h-0.5 bg-gray-300 rounded w-full"></div>
            <div className="h-0.5 bg-gray-300 rounded w-4/5"></div>
            <div className="h-0.5 bg-gray-300 rounded w-full"></div>
            <div className="h-0.5 bg-gray-300 rounded w-1/2"></div>
            <div className="h-0.5 bg-gray-300 rounded w-full"></div>
            <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
          </div>
          
          {/* Document type indicator */}
          <div className="absolute top-1 left-1">
            <FileText className="h-3 w-3 text-gray-400" />
          </div>
        </div>

        {/* Right side - Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Type Badge */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="text-base font-medium text-blue-600 hover:text-blue-700 transition-colors line-clamp-1 mb-1">
                {note.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                  {note.noteType === 'premium' ? 'Lecture notes' : 'Course'}
                </span>
                {isPointsRequired && (
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    {requiredPoints} pts
                  </span>
                )}
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{progressPercentage}%</span>
              <span className="text-gray-400">({note.downloads})</span>
            </div>
          </div>

          {/* Institution and Course Info */}
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center mr-2">
              <User className="h-2.5 w-2.5" />
            </div>
            <span className="truncate">{note.subject}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-500">{note.uploader}</span>
          </div>

          {/* Additional details */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500 gap-4">
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{note.fileSize ? formatFileSize(note.fileSize) : 'PDF'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(note.uploadDate).getFullYear()}/{new Date(note.uploadDate).getFullYear()}</span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Like button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(note.id);
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart 
                  className={`h-4 w-4 ${
                    isLiked 
                      ? 'fill-red-500 text-red-500' 
                      : 'hover:fill-red-100'
                  }`} 
                />
              </button>
              
              {/* Share button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(note);
                }}
                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
              
              {/* Preview button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(note);
                }}
                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
              
              {/* Download button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(note.id);
                }}
                className={`p-1 transition-colors ${
                  needsAuth || !hasEnoughPoints
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-400 hover:text-blue-500'
                }`}
                disabled={needsAuth || !hasEnoughPoints}
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HorizontalNotesCard;

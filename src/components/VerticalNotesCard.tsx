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

interface VerticalNotesCardProps {
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

const VerticalNotesCard: React.FC<VerticalNotesCardProps> = ({
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

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      {/* Document Preview Section */}
      <div className="relative bg-gray-50 p-4">
        {/* Document Preview */}
        <div className="w-full h-32 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center relative overflow-hidden">
          {/* Simulated document lines */}
          <div className="absolute inset-0 p-3 flex flex-col space-y-1">
            <div className="h-1 bg-gray-300 rounded w-full"></div>
            <div className="h-1 bg-gray-300 rounded w-3/4"></div>
            <div className="h-1 bg-gray-300 rounded w-full"></div>
            <div className="h-1 bg-gray-300 rounded w-2/3"></div>
            <div className="h-1 bg-gray-300 rounded w-full"></div>
            <div className="h-1 bg-gray-300 rounded w-4/5"></div>
            <div className="h-1 bg-gray-300 rounded w-full"></div>
            <div className="h-1 bg-gray-300 rounded w-1/2"></div>
          </div>
          
          {/* Document type indicator */}
          <div className="absolute top-2 left-2">
            <FileText className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Points/Free badge */}
        <div className="absolute top-2 right-2">
          {isPointsRequired ? (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
              <Coins className="h-3 w-3" />
              {requiredPoints}
            </span>
          ) : (
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
              FREE
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
          {note.title}
        </h3>
        
        {/* Meta info */}
        <div className="flex items-center text-sm text-gray-600 gap-3 mb-3">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-3 w-3" />
            </div>
            <span className="truncate max-w-[80px]">{note.uploader}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(note.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
          {note.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {note.branch}
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            {note.semester} Sem
          </span>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
            {note.subject}
          </span>
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
            {note.degree}
          </span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Download className="h-4 w-4 mr-1" />
              <span>{note.downloads}</span>
            </div>
            
            <button
              onClick={() => onLike(note.id)}
              className="flex items-center transition-all duration-200 hover:scale-105 group"
            >
              <Heart 
                className={`h-4 w-4 mr-1 transition-all duration-200 stroke-2 ${
                  isLiked 
                    ? 'fill-red-500 text-red-500 scale-110' 
                    : 'text-gray-700 hover:text-red-500 group-hover:fill-red-100'
                }`} 
              />
              <span className={`transition-colors ${
                isLiked ? 'text-red-500 font-medium' : 'text-gray-700'
              }`}>
                {note.likes}
              </span>
            </button>
          </div>

          {note.fileSize && note.fileSize > 0 && (
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              <span>{formatFileSize(note.fileSize)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onShare(note)}
            className="flex items-center justify-center px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm flex-1"
            title="Share note"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </button>

          <button
            onClick={() => onPreview(note)}
            className="flex items-center justify-center px-3 py-2 text-blue-600 border border-blue-300 hover:bg-blue-50 hover:border-blue-400 rounded-lg transition-all duration-200 text-sm font-medium flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </button>
          
          <button
            onClick={() => onDownload(note.id)}
            className={`flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium flex-1 ${
              needsAuth
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                : !hasEnoughPoints
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            }`}
            title={needsAuth ? 'Sign in required' : !hasEnoughPoints ? `Need ${requiredPoints - userPoints.availablePoints} more points` : 'Download note'}
          >
            {needsAuth ? (
              <>
                <User className="h-4 w-4 mr-1" />
                Sign In
              </>
            ) : !hasEnoughPoints ? (
              <>
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{requiredPoints - userPoints.availablePoints} more pts</span>
                <span className="sm:hidden">Need pts</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">
                  {isPointsRequired ? `${requiredPoints} pts` : 'Download'}
                </span>
                <span className="sm:hidden">Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VerticalNotesCard;

import React, { useState } from 'react';
import { Download, Eye, Calendar, User, Tag, Heart, Share2, FileText, Coins, AlertTriangle, Clock, Star, TrendingUp, Award, Zap, Lock, Shield, BookOpen, GraduationCap, ChevronRight } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);
  const requiredPoints = noteRequirements?.points || note.points || 0;
  const isPointsRequired = requiredPoints > 0;
  const hasEnoughPoints = !isPointsRequired || !user || userPoints.availablePoints >= requiredPoints;
  const needsAuth = isPointsRequired && !user;

  // Enhanced metrics calculations
  const popularityScore = Math.min(Math.round((note.downloads + note.likes) / 10), 5);
  const timeAgo = getTimeAgo(note.uploadDate);
  const difficultyLevel = getDifficultyLevel(note.semester);
  const qualityScore = Math.min(Math.round((note.likes / Math.max(note.downloads, 1)) * 5), 5);

  function getTimeAgo(uploadDate: string): string {
    const now = new Date();
    const uploaded = new Date(uploadDate);
    const diffTime = Math.abs(now.getTime() - uploaded.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1d';
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)}m`;
    return `${Math.ceil(diffDays / 365)}y`;
  }

  function getDifficultyLevel(semester: string): { level: string; color: string; icon: any } {
    const sem = parseInt(semester.replace(/\D/g, ''));
    if (sem <= 2) return { level: 'Beginner', color: 'text-green-400 bg-green-500/20', icon: BookOpen };
    if (sem <= 5) return { level: 'Intermediate', color: 'text-yellow-400 bg-yellow-500/20', icon: Award };
    return { level: 'Advanced', color: 'text-red-400 bg-red-500/20', icon: GraduationCap };
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl border border-slate-600/40 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 transition-all duration-300 group h-full flex flex-col max-w-sm mx-auto relative backdrop-blur-sm"
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Enhanced gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
      
      {/* Enhanced Document Preview Section */}
      <div className="relative bg-gradient-to-br from-slate-700 via-slate-750 to-slate-800 p-4">
        {/* Enhanced Document Preview */}
        <div className="w-full h-24 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg border border-slate-500/20 relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
          {/* Enhanced document preview with realistic design */}
          <div className="absolute inset-0">
            {/* Document header with brand colors */}
            <div className="h-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 flex items-center px-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-white/90 rounded-full shadow-sm"></div>
                <div className="w-2 h-2 bg-white/70 rounded-full shadow-sm"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full shadow-sm"></div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-3 h-0.5 bg-white/60 rounded"></div>
                <div className="w-3 h-0.5 bg-white/40 rounded"></div>
              </div>
            </div>
            
            {/* Content area with enhanced lines */}
            <div className="p-2.5 space-y-1.5 bg-gradient-to-b from-slate-50 to-slate-100">
              <div className="flex items-center gap-1 mb-2">
                <FileText className="h-3 w-3 text-blue-600" />
                <div className="h-1 bg-blue-400 rounded w-12"></div>
              </div>
              <div className="h-0.5 bg-gray-400 rounded w-full"></div>
              <div className="h-0.5 bg-gray-300 rounded w-4/5"></div>
              <div className="h-0.5 bg-gray-400 rounded w-full"></div>
              <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
              <div className="h-0.5 bg-gray-400 rounded w-full"></div>
              <div className="h-0.5 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        {/* Enhanced status indicators */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {/* Quality indicator */}
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-1.5 py-1 flex items-center gap-0.5">
            <Star className={`h-2.5 w-2.5 ${qualityScore >= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
            <span className="text-xs font-bold text-white">{qualityScore}</span>
          </div>
          
          {/* Points/Free indicator */}
          {isPointsRequired ? (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <Coins className="h-2.5 w-2.5" />
              {requiredPoints}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Zap className="h-2.5 w-2.5" />
              FREE
            </div>
          )}
        </div>
        
        {/* Trending indicator */}
        {popularityScore >= 4 && (
          <div className="absolute bottom-2 left-2">
            <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
              <TrendingUp className="h-2 w-2" />
              Hot
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Content Section */}
      <div className="p-4 flex-1 flex flex-col space-y-3 relative z-10">
        {/* Enhanced title */}
        <h3 className="text-base font-bold text-white line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors duration-300">
          {note.title}
        </h3>
        
        {/* Enhanced description */}
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 flex-1">
          {note.description}
        </p>
        
        {/* Enhanced meta information */}
        <div className="space-y-2">
          {/* Author and time */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="font-medium text-gray-300 truncate max-w-[80px]">{note.uploader}</span>
            </div>
            
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>
          
          {/* Enhanced badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-[10px] font-semibold border border-blue-500/20">
              {note.branch}
            </span>
            <span className={`px-2 py-1 rounded-md text-[10px] font-semibold border ${
              difficultyLevel.color
            } ${difficultyLevel.color.replace('text-', 'border-').replace('bg-', 'border-')}`}>
              <difficultyLevel.icon className="h-2.5 w-2.5 inline mr-1" />
              {difficultyLevel.level}
            </span>
            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-[10px] font-semibold border border-purple-500/20">
              Sem {note.semester}
            </span>
          </div>
        </div>
        
        {/* Enhanced stats */}
        <div className="flex items-center justify-between py-2 border-t border-slate-600/30">
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center text-blue-400">
              <Download className="h-3 w-3 mr-1" />
              <span className="font-bold">{note.downloads}</span>
            </div>
            
            <button
              onClick={() => onLike(note.id)}
              className={`flex items-center transition-all duration-200 hover:scale-110 ${
                isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart 
                className={`h-3 w-3 mr-1 transition-all duration-200 ${
                  isLiked ? 'fill-red-400' : 'hover:fill-red-100'
                }`} 
              />
              <span className="font-bold">{note.likes}</span>
            </button>
            
            <div className="flex items-center text-gray-500">
              <Eye className="h-3 w-3 mr-1" />
              <span className="font-bold">{note.views}</span>
            </div>
          </div>
          
          {note.fileSize && note.fileSize > 0 && (
            <div className="text-[10px] text-gray-500 bg-slate-700/50 px-2 py-1 rounded">
              {formatFileSize(note.fileSize)}
            </div>
          )}
        </div>

        {/* Enhanced action buttons */}
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={() => onShare(note)}
            className="flex items-center justify-center p-2 text-gray-400 hover:text-white bg-slate-700/50 hover:bg-slate-600/70 rounded-lg transition-all duration-200 backdrop-blur-sm"
            title="Share note"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => onPreview(note)}
            className="flex items-center justify-center px-3 py-2 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all duration-200 text-xs font-medium border border-blue-500/20 hover:border-blue-400/30 flex-1"
            title="Preview note"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Preview
          </button>
          
          <button
            onClick={() => onDownload(note.id)}
            disabled={!hasEnoughPoints && !needsAuth}
            className={`flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium flex-1 ${
              needsAuth
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                : !hasEnoughPoints
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-500/30'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
            title={needsAuth ? 'Sign in to download' : !hasEnoughPoints ? `Need ${requiredPoints - userPoints.availablePoints} more points` : 'Download note'}
          >
            {needsAuth ? (
              <>
                <User className="h-3.5 w-3.5 mr-1" />
                Sign in
              </>
            ) : !hasEnoughPoints ? (
              <>
                <Lock className="h-3.5 w-3.5 mr-1" />
                Locked
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 mr-1" />
                Get
                <ChevronRight className="h-3 w-3 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VerticalNotesCard;

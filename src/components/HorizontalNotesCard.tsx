import React, { useState } from 'react';
import { Download, Eye, Calendar, User, Tag, Heart, Share2, FileText, Coins, AlertTriangle, Star, Clock, TrendingUp, BookOpen, Award, Zap, Lock, Check, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

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
  const { isDarkMode } = useTheme();
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
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  }

  function getDifficultyLevel(semester: string): { level: string; color: string } {
    const sem = parseInt(semester.replace(/\D/g, ''));
    if (sem <= 2) return { level: 'Beginner', color: 'text-green-600 bg-green-100' };
    if (sem <= 5) return { level: 'Intermediate', color: 'text-yellow-600 bg-yellow-100' };
    return { level: 'Advanced', color: 'text-red-600 bg-red-100' };
  }

  return (
    <motion.div
      className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-xl border border-gray-200 dark:border-slate-700/40 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 transition-all duration-300 group cursor-pointer relative backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -2, scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Enhanced gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
      
      <div className="relative flex flex-col sm:flex-row items-stretch p-4 sm:p-5 gap-4 sm:gap-6">
        {/* Enhanced Document Thumbnail */}
        <div className="relative flex-shrink-0">
          <div className="w-full sm:w-20 h-24 sm:h-28 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-lg border border-gray-300 dark:border-slate-600/20 relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
            {/* Enhanced document preview */}
            <div className="absolute inset-0">
              {/* Header bar */}
              <div className="h-5 sm:h-6 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center px-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white/80 rounded-full shadow-sm"></div>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm"></div>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full shadow-sm"></div>
                </div>
              </div>
              
              {/* Content area */}
              <div className="p-2.5 space-y-1.5 bg-gradient-to-b from-white to-gray-100 dark:from-slate-50 dark:to-slate-100">
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
            
            {/* File type indicator */}
            <div className="absolute bottom-1 left-1">
              <div className="bg-gray-800/80 dark:bg-black/30 backdrop-blur-sm rounded px-1 py-0.5">
                <FileText className="h-3 w-3 text-red-400" />
              </div>
            </div>
            
            {/* Quality score */}
            <div className="absolute top-1 right-1">
              <div className="bg-gray-800/80 dark:bg-black/30 backdrop-blur-sm rounded px-1 py-0.5 flex items-center gap-0.5">
                <Star className={`h-2.5 w-2.5 ${qualityScore >= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                <span className="text-xs font-semibold text-white">{qualityScore}</span>
              </div>
            </div>
          </div>
          
          {/* Points/Free indicator */}
          <div className="absolute -bottom-2 -right-2">
            {isPointsRequired ? (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Coins className="h-3 w-3" />
                {requiredPoints}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                FREE
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Content Section */}
        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
          {/* Header section */}
          <div>
            {/* Title and badges */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
              <div className="flex-1 min-w-0 sm:mr-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white hover:text-blue-400 transition-colors line-clamp-2 leading-tight mb-2 group-hover:text-blue-400">
                  {note.title}
                </h3>
                
                {/* Enhanced badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-md text-xs font-semibold border border-blue-200 dark:border-blue-500/20">
                    {note.branch}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                    difficultyLevel.color.includes('green') ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20 border-green-200 dark:border-green-500/20' :
                    difficultyLevel.color.includes('yellow') ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20 border-yellow-200 dark:border-yellow-500/20' :
                    'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-500/20'
                  }`}>
                    {difficultyLevel.level}
                  </span>
                  <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-md text-xs font-semibold border border-purple-200 dark:border-purple-500/20">
                    Sem {note.semester}
                  </span>
                  {note.degree && (
                    <span className="bg-gray-100 dark:bg-slate-600/20 text-gray-600 dark:text-slate-300 px-2 py-1 rounded-md text-xs font-semibold border border-gray-200 dark:border-slate-500/20">
                      {note.degree}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Trending indicator */}
              {popularityScore >= 4 && (
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 px-2 py-1 rounded-full flex-shrink-0 border border-orange-200 dark:border-orange-500/20">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-semibold">Trending</span>
                </div>
              )}
            </div>

            {/* Enhanced description */}
            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-3">
              {note.description}
            </p>
          </div>
          
          {/* Meta information */}
          <div className="space-y-3">
            {/* Author and time info */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600 dark:text-slate-400">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                  <User className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium text-gray-700 dark:text-slate-300">{note.uploader}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{timeAgo}</span>
              </div>
              
              {note.fileSize && (
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{formatFileSize(note.fileSize)}</span>
                </div>
              )}
            </div>
            
            {/* Enhanced stats and actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-gray-200 dark:border-slate-700/30 gap-3">
              {/* Stats */}
              <div className="flex items-center space-x-3 sm:space-x-4 text-sm">
                <div className="flex items-center text-blue-500 dark:text-blue-400">
                  <Download className="h-4 w-4 mr-1" />
                  <span className="font-semibold">{note.downloads}</span>
                  <span className="text-gray-500 dark:text-slate-500 ml-1 hidden sm:inline">downloads</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike(note.id);
                  }}
                  className={`flex items-center transition-all duration-200 hover:scale-105 ${
                    isLiked ? 'text-red-400' : 'text-gray-500 dark:text-slate-400 hover:text-red-400'
                  }`}
                >
                  <Heart 
                    className={`h-4 w-4 mr-1 transition-all duration-200 ${
                      isLiked ? 'fill-red-400' : 'hover:fill-red-100'
                    }`} 
                  />
                  <span className="font-semibold">{note.likes}</span>
                  <span className="text-gray-500 dark:text-slate-500 ml-1 hidden sm:inline">likes</span>
                </button>
                
                <div className="flex items-center text-gray-500 dark:text-slate-400">
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="font-semibold">{note.views}</span>
                  <span className="ml-1 hidden sm:inline">views</span>
                </div>
              </div>
              
              {/* Enhanced action buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(note);
                  }}
                  className="p-2 text-gray-500 dark:text-slate-400 hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200 flex-shrink-0 backdrop-blur-sm"
                  title="Share note"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(note);
                  }}
                  className="px-3 py-2 text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/10 hover:bg-blue-200 dark:hover:bg-blue-500/20 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-1 flex-shrink-0 border border-blue-200 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-400/30"
                  title="Preview note"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(note.id);
                  }}
                  disabled={needsAuth || !hasEnoughPoints}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 text-sm flex-1 sm:flex-initial justify-center ${
                    needsAuth
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                      : !hasEnoughPoints
                        ? 'bg-gray-300 dark:bg-slate-600/50 text-gray-500 dark:text-slate-400 cursor-not-allowed border border-gray-400 dark:border-slate-500/30'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                  title={needsAuth ? 'Sign in to download' : !hasEnoughPoints ? `Need ${requiredPoints - userPoints.availablePoints} more points` : 'Download note'}
                >
                  {needsAuth ? (
                    <>
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Sign in</span>
                    </>
                  ) : !hasEnoughPoints ? (
                    <>
                      <Lock className="h-4 w-4" />
                      <span className="hidden sm:inline">Locked</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                      <ChevronRight className="h-3 w-3 hidden sm:inline" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HorizontalNotesCard;

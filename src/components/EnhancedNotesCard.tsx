import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, Eye, Heart, Share2, FileText, Coins, Star, Clock, 
  TrendingUp, Award, Zap, Lock, BookOpen, GraduationCap, 
  ChevronRight, User, CheckCircle, AlertCircle, Shield, 
  MessageSquare, ThumbsUp, Flag, Bookmark, ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface EnhancedNotesCardProps {
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
  viewMode?: 'compact' | 'detailed' | 'gallery';
}

const EnhancedNotesCard: React.FC<EnhancedNotesCardProps> = ({
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
  formatFileSize,
  viewMode = 'detailed'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const requiredPoints = noteRequirements?.points || note.points || 0;
  const isPointsRequired = requiredPoints > 0;
  const hasEnoughPoints = !isPointsRequired || !user || userPoints.availablePoints >= requiredPoints;
  const needsAuth = isPointsRequired && !user;

  // Enhanced metrics calculations
  const popularityScore = Math.min(Math.round((note.downloads + note.likes) / 10), 5);
  const qualityScore = Math.min(Math.round((note.likes / Math.max(note.downloads, 1)) * 5), 5);
  const freshnessDays = Math.ceil((Date.now() - new Date(note.uploadDate).getTime()) / (1000 * 60 * 60 * 24));
  const isFresh = freshnessDays <= 7;
  const isTrending = popularityScore >= 4 && freshnessDays <= 30;

  // Difficulty and subject categorization
  const getDifficultyInfo = (semester: string) => {
    const sem = parseInt(semester.replace(/\D/g, ''));
    if (sem <= 2) return { level: 'Beginner', color: 'emerald', icon: BookOpen };
    if (sem <= 5) return { level: 'Intermediate', color: 'amber', icon: Award };
    return { level: 'Advanced', color: 'red', icon: GraduationCap };
  };

  const getSubjectCategory = (branch: string) => {
    const categories: Record<string, { color: string; icon: any }> = {
      'Computer Science': { color: 'blue', icon: FileText },
      'Electronics': { color: 'purple', icon: Zap },
      'Mechanical': { color: 'orange', icon: Award },
      'Civil': { color: 'green', icon: Shield },
      'Mathematics': { color: 'indigo', icon: BookOpen },
      'Physics': { color: 'cyan', icon: Star }
    };
    return categories[branch] || { color: 'gray', icon: FileText };
  };

  const difficultyInfo = getDifficultyInfo(note.semester);
  const subjectCategory = getSubjectCategory(note.branch);

  // Time formatting
  const getTimeAgo = (uploadDate: string): string => {
    const diffDays = Math.ceil((Date.now() - new Date(uploadDate).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  // Rating system
  const handleRating = (rating: number) => {
    setUserRating(rating);
    // Here you would typically save to database
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        onClick={() => handleRating(i + 1)}
        className={`transition-all duration-200 ${ 
          i < userRating ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'
        }`}
      >
        <Star className={`h-3 w-3 ${i < userRating ? 'fill-yellow-400' : ''}`} />
      </button>
    ));
  };

  if (viewMode === 'compact') {
    return (
      <motion.div
        ref={cardRef}
        className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.02 }}
        whileHover={{ y: -2 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="flex items-center p-3 gap-3">
          {/* Mini document preview */}
          <div className="w-12 h-16 bg-gradient-to-br from-slate-100 to-gray-200 rounded border relative overflow-hidden flex-shrink-0">
            <div className="h-3 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="p-1 space-y-0.5">
              <div className="h-0.5 bg-gray-400 rounded w-full"></div>
              <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
              <div className="h-0.5 bg-gray-400 rounded w-full"></div>
            </div>
            <div className="absolute bottom-1 right-1">
              <FileText className="h-2 w-2 text-gray-500" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {note.title}
              </h3>
              {isPointsRequired && (
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                  <Coins className="h-2.5 w-2.5" />
                  {requiredPoints}
                </span>
              )}
            </div>
            
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <span className="font-medium">{note.branch}</span>
              <span className="mx-1">•</span>
              <span>Sem {note.semester}</span>
              <span className="mx-1">•</span>
              <span>{note.uploader}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {note.downloads}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {note.likes}
                </span>
              </div>
              
              <button
                onClick={() => onDownload(note.id)}
                disabled={needsAuth || !hasEnoughPoints}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  needsAuth || !hasEnoughPoints
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {needsAuth ? 'Sign in' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-2xl border border-gray-200/60 hover:border-blue-300/60 overflow-hidden hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 group relative backdrop-blur-sm"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Enhanced gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 transition-opacity duration-500 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
      
      {/* Status indicators */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {isFresh && (
          <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Zap className="h-3 w-3" />
            NEW
          </div>
        )}
        {isTrending && (
          <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <TrendingUp className="h-3 w-3" />
            HOT
          </div>
        )}
        {qualityScore >= 4 && (
          <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Award className="h-3 w-3" />
            TOP
          </div>
        )}
      </div>

      {/* Bookmark button */}
      <button
        onClick={() => setIsBookmarked(!isBookmarked)}
        className={`absolute top-4 left-4 p-2 rounded-full transition-all duration-200 z-10 ${
          isBookmarked 
            ? 'bg-blue-500 text-white shadow-lg' 
            : 'bg-white/80 text-gray-400 hover:text-blue-500 hover:bg-white'
        }`}
      >
        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-white' : ''}`} />
      </button>

      {/* Enhanced Document Preview */}
      <div className="relative bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 p-6 pt-16">
        <div className="w-full h-32 bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-gray-200 relative overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
          {/* Realistic document design */}
          <div className="absolute inset-0">
            {/* Header with brand colors */}
            <div className="h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 flex items-center px-4">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-white/90 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-white/70 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-white/50 rounded-full"></div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-4 h-0.5 bg-white/60 rounded"></div>
                <div className="w-4 h-0.5 bg-white/40 rounded"></div>
              </div>
            </div>
            
            {/* Document content */}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <subjectCategory.icon className="h-4 w-4 text-blue-600" />
                <div className="h-1.5 bg-blue-400 rounded w-16"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-1 bg-gray-400 rounded w-full"></div>
                <div className="h-1 bg-gray-300 rounded w-5/6"></div>
                <div className="h-1 bg-gray-400 rounded w-full"></div>
                <div className="h-1 bg-gray-300 rounded w-4/5"></div>
                <div className="h-1 bg-gray-400 rounded w-full"></div>
                <div className="h-1 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Points/Free indicator */}
        <div className="absolute bottom-4 right-4">
          {isPointsRequired ? (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
              <Coins className="h-4 w-4" />
              {requiredPoints} Points
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
              <Zap className="h-4 w-4" />
              FREE
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="p-6 space-y-4 relative z-10">
        {/* Title and rating */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300 mb-2">
            {note.title}
          </h3>
          
          {/* Rating display */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < qualityScore ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({qualityScore}/5)</span>
          </div>
        </div>
        
        {/* Enhanced description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {note.description}
        </p>
        
        {/* Enhanced badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`bg-${subjectCategory.color}-100 text-${subjectCategory.color}-800 px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1`}>
            <subjectCategory.icon className="h-3 w-3" />
            {note.branch}
          </span>
          <span className={`bg-${difficultyInfo.color}-100 text-${difficultyInfo.color}-800 px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1`}>
            <difficultyInfo.icon className="h-3 w-3" />
            {difficultyInfo.level}
          </span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-sm font-semibold">
            Semester {note.semester}
          </span>
          {note.degree && (
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-sm font-semibold">
              {note.degree}
            </span>
          )}
        </div>
        
        {/* Enhanced meta information */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">{note.uploader}</div>
                <div className="text-xs text-gray-500">{getTimeAgo(note.uploadDate)}</div>
              </div>
            </div>
            
            {note.fileSize && (
              <div className="flex items-center gap-1 text-gray-500">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{formatFileSize(note.fileSize)}</span>
              </div>
            )}
          </div>
          
          {/* Verification badge */}
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-semibold">Verified</span>
          </div>
        </div>
        
        {/* Enhanced stats */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center text-blue-600">
              <Download className="h-4 w-4 mr-2" />
              <span className="font-bold">{note.downloads.toLocaleString()}</span>
              <span className="text-gray-500 ml-1">downloads</span>
            </div>
            
            <button
              onClick={() => onLike(note.id)}
              className={`flex items-center transition-all duration-200 hover:scale-110 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart 
                className={`h-4 w-4 mr-2 transition-all duration-200 ${
                  isLiked ? 'fill-red-500' : 'hover:fill-red-100'
                }`} 
              />
              <span className="font-bold">{note.likes.toLocaleString()}</span>
              <span className="text-gray-400 ml-1">likes</span>
            </button>
            
            <div className="flex items-center text-gray-500">
              <Eye className="h-4 w-4 mr-2" />
              <span className="font-bold">{note.views.toLocaleString()}</span>
              <span className="ml-1">views</span>
            </div>
          </div>
          
          {/* User rating */}
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rate:</span>
              <div className="flex items-center">{renderStars()}</div>
            </div>
          )}
        </div>

        {/* Enhanced action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onShare(note)}
            className="flex items-center justify-center p-3 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all duration-200"
            title="Share note"
          >
            <Share2 className="h-5 w-5" />
          </button>

          <button
            onClick={() => onPreview(note)}
            className="flex items-center justify-center px-4 py-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 font-medium flex-1"
            title="Preview note"
          >
            <Eye className="h-5 w-5 mr-2" />
            Preview
          </button>
          
          <button
            onClick={() => onDownload(note.id)}
            disabled={needsAuth || !hasEnoughPoints}
            className={`flex items-center justify-center px-6 py-3 rounded-xl font-bold transition-all duration-200 flex-1 ${
              needsAuth
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                : !hasEnoughPoints
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
            title={needsAuth ? 'Sign in to download' : !hasEnoughPoints ? `Need ${requiredPoints - userPoints.availablePoints} more points` : 'Download note'}
          >
            {needsAuth ? (
              <>
                <User className="h-5 w-5 mr-2" />
                Sign in to Download
              </>
            ) : !hasEnoughPoints ? (
              <>
                <Lock className="h-5 w-5 mr-2" />
                {requiredPoints - userPoints.availablePoints} more points needed
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download Now
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedNotesCard;

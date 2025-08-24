import React, { useEffect, useState } from 'react';
import { X, Play, Clock, User, Eye, ExternalLink, Maximize2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    title: string;
    type: 'youtube' | 'vimeo' | 'direct';
    url: string;
    duration?: string;
    description?: string;
    thumbnail?: string;
    instructor?: string;
  } | null;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, video }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get embed URL for the video
  const getEmbedUrl = (video: any): string => {
    if (!video) return '';
    
    if (video.type === 'youtube') {
      const videoId = getYouTubeVideoId(video.url);
      if (videoId) {
        // Add autoplay, mute options and other parameters for better UX
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&showinfo=0`;
      }
    }
    
    return video.url;
  };

  // Get thumbnail URL for YouTube videos
  const getThumbnailUrl = (video: any): string => {
    if (video?.thumbnail) return video.thumbnail;
    
    if (video?.type === 'youtube') {
      const videoId = getYouTubeVideoId(video.url);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    return '/api/placeholder/640/360';
  };

  // Handle escape key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.keyCode === 27) onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc, false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc, false);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle video load
  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  if (!isOpen || !video) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 w-full max-w-6xl ${
            isFullscreen ? 'h-screen max-w-full rounded-none' : 'max-h-[90vh]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white line-clamp-1">
                  {video.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  {video.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{video.duration}</span>
                    </div>
                  )}
                  {video.instructor && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{video.instructor}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
                title="Toggle Fullscreen"
              >
                <Maximize2 className="h-5 w-5" />
              </button>

              <button
                onClick={() => window.open(video.url, '_blank')}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
                title="Open in YouTube"
              >
                <ExternalLink className="h-5 w-5" />
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-700/50"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading video...</p>
                </div>
              </div>
            )}

            <div className={`${isFullscreen ? 'h-[calc(100vh-80px)]' : 'aspect-video'} bg-black`}>
              <iframe
                src={getEmbedUrl(video)}
                title={video.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={handleVideoLoad}
              />
            </div>
          </div>

          {/* Video Info */}
          {video.description && !isFullscreen && (
            <div className="p-4 bg-slate-800/30 border-t border-slate-700">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {video.instructor?.split(' ').map(n => n[0]).join('') || 'IN'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">{video.title}</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {video.description}
                  </p>
                  {video.instructor && (
                    <div className="mt-3 flex items-center space-x-4 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{video.instructor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>Educational Content</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoModal;

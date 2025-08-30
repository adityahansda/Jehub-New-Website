import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    title: string;
    url: string;
    description?: string;
  } | null;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, video }) => {
  if (!video) return null;

  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  // Check if URL is a YouTube video
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Check if URL is a direct video file
  const isDirectVideoUrl = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i);
  };

  const videoId = isYouTubeUrl(video.url) ? getYouTubeVideoId(video.url) : null;

  const renderVideoPlayer = () => {
    if (videoId) {
      // YouTube embed
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg"
        />
      );
    } else if (isDirectVideoUrl(video.url)) {
      // Direct video file
      return (
        <video
          width="100%"
          height="100%"
          controls
          autoPlay
          className="rounded-lg bg-black"
        >
          <source src={video.url} type="video/mp4" />
          <source src={video.url} type="video/webm" />
          <source src={video.url} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      // Fallback - show link to open in new tab
      return (
        <div className="flex items-center justify-center h-full bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-600">
          <div className="text-center space-y-4">
            <Play className="h-16 w-16 text-slate-400 mx-auto" />
            <h3 className="text-xl font-semibold text-white">Video Not Embeddable</h3>
            <p className="text-slate-400 max-w-md">
              This video format cannot be played directly in the modal. 
              Click the button below to open it in a new tab.
            </p>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
            >
              <ExternalLink className="h-4 w-4" />
              Open Video
            </a>
          </div>
        </div>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-white mb-2">{video.title}</h2>
                {video.description && (
                  <p className="text-slate-400 text-sm leading-relaxed">{video.description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200 group"
                title="Close video"
              >
                <X className="h-5 w-5 text-slate-300 group-hover:text-white" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {renderVideoPlayer()}
            </div>

            {/* External Link Option */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
              <div className="text-sm text-slate-400">
                {isYouTubeUrl(video.url) && '🎬 YouTube Video'}
                {isDirectVideoUrl(video.url) && '📹 Direct Video File'}
                {!isYouTubeUrl(video.url) && !isDirectVideoUrl(video.url) && '🔗 External Video'}
              </div>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;

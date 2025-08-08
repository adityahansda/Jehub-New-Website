import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  X, 
  Share2, 
  Copy, 
  Check,
  MessageCircle,
  Send,
  Twitter,
  Facebook,
  QrCode,
  ExternalLink,
  BarChart3
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  note: {
    id: string;
    title: string;
    subject: string;
    branch: string;
    semester: string;
    uploader: string;
    description: string;
  };
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, note, userId }) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  // Generate share content when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
      setShareUrl(currentUrl);
      
      const message = `🎓 Check out "${note.title}"\n\n📚 ${note.subject} | ${note.branch} | ${note.semester} Semester\n👨‍💻 Uploaded by: ${note.uploader}\n\n💡 Find more engineering resources at Jharkhand Engineer's Hub!\n\n${currentUrl}`;
      setShareMessage(message);
    }
  }, [isOpen, note]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareMessage;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: shareMessage,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTelegramShare = () => {
    const encodedMessage = encodeURIComponent(shareMessage);
    const telegramUrl = `https://t.me/share/url?text=${encodedMessage}`;
    window.open(telegramUrl, '_blank');
  };

  const handleTwitterShare = () => {
    const encodedText = encodeURIComponent(`🎓 ${note.title}\n\n📚 ${note.subject} | ${note.branch}\n💡 Join Jharkhand Engineer's Hub for more resources!`);
    const encodedUrl = encodeURIComponent(shareUrl);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    window.open(twitterUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    window.open(facebookUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Share2 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Share Note</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Note Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{note.title}</h4>
            <p className="text-sm text-gray-600">
              {note.subject} • {note.branch} • {note.semester} Semester
            </p>
            <p className="text-xs text-gray-500 mt-1">by {note.uploader}</p>
          </div>

          {/* Share Message Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Message Preview
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
              {shareMessage}
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            {/* Native Share */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Share via Device</span>
              </button>
            )}

            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors group"
            >
              <div className="w-5 h-5 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                💬
              </div>
              <span className="font-medium text-gray-900 group-hover:text-green-700">Share on WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={handleTelegramShare}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
            >
              <Send className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-900 group-hover:text-blue-700">Share on Telegram</span>
            </button>

            {/* Twitter */}
            <button
              onClick={handleTwitterShare}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
            >
              <Twitter className="h-5 w-5 text-blue-400" />
              <span className="font-medium text-gray-900 group-hover:text-blue-700">Share on Twitter</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900 group-hover:text-blue-700">Share on Facebook</span>
            </button>

            {/* Copy Message */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Copy Message</span>
                </>
              )}
            </button>

            {/* Copy Just URL */}
            <button
              onClick={handleCopyUrl}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Copy URL Only</span>
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 Share this note with your friends and help them in their studies!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

import React, { useState, useEffect } from 'react';
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
import { useSettings, getShareMessageTemplate, isSharePlatformEnabled, useActiveTemplate } from '../hooks/useSettings';
import { useShare, useShareUtils } from '../hooks/useShare';
import { CreateShareRequest, SharePlatform } from '../types/share';

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
  const { settings, loading: settingsLoading } = useSettings();
  const { activeTemplate, loading: templateLoading } = useActiveTemplate();
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const { createShare, shares } = useShare(userId);
  const { generateQRCode, copyToClipboard } = useShareUtils();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const loading = settingsLoading || templateLoading;

  useEffect(() => {
    if (isOpen && !loading && userId) {
      generateCustomMessage();
    }
  }, [isOpen, loading, settings, note, userId]);

  const generateCustomMessage = () => {
    // Use active template if available, otherwise fall back to settings
    const template = activeTemplate || getShareMessageTemplate(settings);
    const currentUrl = window.location.href;
    
    let message = template
      .replace(/{title}/g, note.title)
      .replace(/{subject}/g, note.subject)
      .replace(/{branch}/g, note.branch)
      .replace(/{semester}/g, note.semester)
      .replace(/{uploader}/g, note.uploader)
      .replace(/{url}/g, currentUrl);

    setCustomMessage(message);
  };

  const handleCreateShare = async (platform: SharePlatform) => {
    if (!userId) return;
    const shareRequest: CreateShareRequest = {
      resourceType: 'note',
      resourceId: note.id,
      resourceTitle: note.title,
      resourceUrl: window.location.href,
      platform,
      customMessage
    };
    try {
      const response = await createShare(shareRequest);
      const qrUrl = await generateQRCode(response.shareUrl);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error creating share:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = customMessage;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    await handleCreateShare('native');
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: customMessage,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = async () => {
    await handleCreateShare('whatsapp');
    const encodedMessage = encodeURIComponent(customMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTelegramShare = async () => {
    await handleCreateShare('telegram');
    const encodedMessage = encodeURIComponent(customMessage);
    const telegramUrl = `https://t.me/share/url?text=${encodedMessage}`;
    window.open(telegramUrl, '_blank');
  };

  const handleTwitterShare = async () => {
    await handleCreateShare('twitter');
    const encodedText = encodeURIComponent(`🎓 ${note.title}\n\n📚 ${note.subject} | ${note.branch}\n💡 Join Jharkhand Engineer's Hub for more resources!`);
    const currentUrl = encodeURIComponent(window.location.href);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${currentUrl}`;
    window.open(twitterUrl, '_blank');
  };

  const handleFacebookShare = async () => {
    await handleCreateShare('facebook');
    const currentUrl = encodeURIComponent(window.location.href);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading share options...</span>
            </div>
          ) : (
            <>
              {/* Note Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{note.title}</h4>
                <p className="text-sm text-gray-600">
                  {note.subject} • {note.branch} • {note.semester} Semester
                </p>
                <p className="text-xs text-gray-500 mt-1">by {note.uploader}</p>
              </div>

              {/* Custom Message Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Message Preview
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {customMessage}
                </div>
              </div>

              {/* QR Code Section */}
              {qrCodeUrl && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code for Quick Sharing
                  </label>
                  <div className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Scan this QR code to quickly access the shared content
                  </p>
                </div>
              )}

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
                {isSharePlatformEnabled(settings, 'whatsapp') && (
                  <button
                    onClick={handleWhatsAppShare}
                    className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors group"
                  >
                    <div className="w-5 h-5 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                      💬
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-green-700">Share on WhatsApp</span>
                  </button>
                )}

                {/* Telegram */}
                {isSharePlatformEnabled(settings, 'telegram') && (
                  <button
                    onClick={handleTelegramShare}
                    className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                  >
                    <Send className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-gray-900 group-hover:text-blue-700">Share on Telegram</span>
                  </button>
                )}

                {/* Twitter */}
                {isSharePlatformEnabled(settings, 'twitter') && (
                  <button
                    onClick={handleTwitterShare}
                    className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                  >
                    <Twitter className="h-5 w-5 text-blue-400" />
                    <span className="font-medium text-gray-900 group-hover:text-blue-700">Share on Twitter</span>
                  </button>
                )}

                {/* Facebook */}
                {isSharePlatformEnabled(settings, 'facebook') && (
                  <button
                    onClick={handleFacebookShare}
                    className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900 group-hover:text-blue-700">Share on Facebook</span>
                  </button>
                )}

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
              </div>

              {/* Footer Note */}
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 This custom message can be modified by administrators in the settings panel.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

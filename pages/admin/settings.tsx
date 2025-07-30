import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  MessageSquare, 
  Share2, 
  Globe,
  ChevronLeft,
  Edit3,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface Setting {
  value: string;
  type: string;
  description: string;
  updatedAt: string;
}

interface AppSettings {
  [key: string]: Setting;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState<string | null>(null);

  // Default settings structure
  const defaultSettings: AppSettings = useMemo(() => ({
    'share_message_template': {
      value: '🎓 Check out this amazing study material: {title}\n\n📚 Subject: {subject}\n🎯 Branch: {branch}\n📅 Semester: {semester}\n👤 Shared by: {uploader}\n\n💡 Join Jharkhand Engineer\'s Hub for more quality resources!\n\n{url}',
      type: 'textarea',
      description: 'Template for share messages. Use placeholders: {title}, {subject}, {branch}, {semester}, {uploader}, {url}',
      updatedAt: new Date().toISOString()
    },
    'share_whatsapp_enabled': {
      value: 'true',
      type: 'boolean',
      description: 'Enable WhatsApp sharing option',
      updatedAt: new Date().toISOString()
    },
    'share_telegram_enabled': {
      value: 'true',
      type: 'boolean',
      description: 'Enable Telegram sharing option',
      updatedAt: new Date().toISOString()
    },
    'share_twitter_enabled': {
      value: 'true',
      type: 'boolean',
      description: 'Enable Twitter sharing option',
      updatedAt: new Date().toISOString()
    },
    'share_facebook_enabled': {
      value: 'true',
      type: 'boolean',
      description: 'Enable Facebook sharing option',
      updatedAt: new Date().toISOString()
    },
    'site_name': {
      value: 'Jharkhand Engineer\'s Hub',
      type: 'string',
      description: 'Site name displayed in shares',
      updatedAt: new Date().toISOString()
    },
    'site_tagline': {
      value: 'Your gateway to engineering excellence in Jharkhand',
      type: 'string',
      description: 'Site tagline for social media shares',
      updatedAt: new Date().toISOString()
    }
  }), []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (response.ok) {
        // Merge with default settings
        const mergedSettings = { ...defaultSettings };
        Object.keys(data.settings).forEach(key => {
          if (mergedSettings[key]) {
            mergedSettings[key] = { ...mergedSettings[key], ...data.settings[key] };
          }
        });
        setSettings(mergedSettings);
      } else {
        // If no settings exist, use defaults
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, [defaultSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: string, value: string) => {
    try {
      setSaving(key);
      setError('');
      
      const setting = settings[key];
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value,
          type: setting.type,
          description: setting.description
        })
      });

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          [key]: { ...prev[key], value }
        }));
        setSuccess(`Setting "${key}" updated successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      setError('Failed to update setting');
    } finally {
      setSaving(null);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };

  const previewShareMessage = (template: string) => {
    const sampleData = {
      title: 'Advanced Data Structures and Algorithms',
      subject: 'Computer Science',
      branch: 'Computer Science Engineering',
      semester: '5th',
      uploader: 'Aditya Kumar',
      url: 'https://jehub.vercel.app/notes/preview/sample-note-id'
    };

    let preview = template;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });

    return preview;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Admin Panel
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">App Settings</h1>
          </div>
          <p className="text-gray-600">
            Configure share messages, social media options, and other app settings.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Share Message Template */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Share Message Template</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Share Message
                  </label>
                  <textarea
                    value={settings['share_message_template']?.value || ''}
                    onChange={(e) => handleInputChange('share_message_template', e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Enter your custom share message template..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use placeholders: {'{title}'}, {'{subject}'}, {'{branch}'}, {'{semester}'}, {'{uploader}'}, {'{url}'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => updateSetting('share_message_template', settings['share_message_template']?.value || '')}
                    disabled={saving === 'share_message_template'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving === 'share_message_template' ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Template
                  </button>
                  
                  <button
                    onClick={() => setShowPreview(showPreview === 'share_message_template' ? null : 'share_message_template')}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    {showPreview === 'share_message_template' ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {showPreview === 'share_message_template' ? 'Hide Preview' : 'Preview'}
                  </button>
                </div>

                {showPreview === 'share_message_template' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Preview:</h4>
                    <div className="bg-white border rounded-lg p-3 text-sm whitespace-pre-wrap">
                      {previewShareMessage(settings['share_message_template']?.value || '')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media Settings */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Social Media Sharing</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'share_whatsapp_enabled', label: 'WhatsApp', icon: '💬' },
                  { key: 'share_telegram_enabled', label: 'Telegram', icon: '📱' },
                  { key: 'share_twitter_enabled', label: 'Twitter', icon: '🐦' },
                  { key: 'share_facebook_enabled', label: 'Facebook', icon: '📘' }
                ].map(({ key, label, icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{icon}</span>
                      <span className="font-medium text-gray-900">{label}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[key]?.value === 'true'}
                        onChange={(e) => {
                          const newValue = e.target.checked ? 'true' : 'false';
                          handleInputChange(key, newValue);
                          updateSetting(key, newValue);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Site Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Site Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings['site_name']?.value || ''}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter site name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Tagline
                  </label>
                  <input
                    type="text"
                    value={settings['site_tagline']?.value || ''}
                    onChange={(e) => handleInputChange('site_tagline', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter site tagline"
                  />
                </div>

                <button
                  onClick={() => {
                    updateSetting('site_name', settings['site_name']?.value || '');
                    updateSetting('site_tagline', settings['site_tagline']?.value || '');
                  }}
                  disabled={saving === 'site_name' || saving === 'site_tagline'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {(saving === 'site_name' || saving === 'site_tagline') ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Site Info
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={fetchSettings}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Settings
                </button>
                
                <Link
                  href="/admin/templates"
                  className="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Manage Templates
                </Link>
                
                <Link
                  href="/notes/preview/sample"
                  className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Test Share Feature
                </Link>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Template Variables</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{'{title}'}</code>
                  <span className="text-blue-700">Note title</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{'{subject}'}</code>
                  <span className="text-blue-700">Subject name</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{'{branch}'}</code>
                  <span className="text-blue-700">Branch name</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{'{semester}'}</code>
                  <span className="text-blue-700">Semester</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{'{uploader}'}</code>
                  <span className="text-blue-700">Uploader name</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{'{url}'}</code>
                  <span className="text-blue-700">Note URL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

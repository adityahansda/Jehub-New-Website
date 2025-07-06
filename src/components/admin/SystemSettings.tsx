import React, { useState } from 'react';
import { Settings, Palette, Bell, Mail, Link as LinkIcon, Save } from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    announcementBanner: {
      enabled: false,
      message: 'Notes Upload is now open for all subjects!',
      color: 'blue'
    },
    emailTemplates: {
      welcome: 'Welcome to JEHUB! We\'re excited to have you join our educational community.',
      rejection: 'Thank you for your interest. Unfortunately, we cannot process your request at this time.',
      approval: 'Congratulations! Your request has been approved.'
    },
    footerLinks: {
      about: '/about',
      privacy: '/privacy',
      terms: '/terms',
      contact: '/contact'
    }
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Configure global system preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      {/* Theme Settings */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Theme Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcement Banner */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Announcement Banner</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="bannerEnabled"
              checked={settings.announcementBanner.enabled}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                announcementBanner: { ...prev.announcementBanner, enabled: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="bannerEnabled" className="text-sm font-medium text-gray-700">
              Show announcement banner
            </label>
          </div>

          {settings.announcementBanner.enabled && (
            <div className="space-y-4 pl-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Message</label>
                <textarea
                  value={settings.announcementBanner.message}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    announcementBanner: { ...prev.announcementBanner, message: e.target.value }
                  }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Color</label>
                <select
                  value={settings.announcementBanner.color}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    announcementBanner: { ...prev.announcementBanner, color: e.target.value }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="yellow">Yellow</option>
                  <option value="red">Red</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Email</label>
            <textarea
              value={settings.emailTemplates.welcome}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                emailTemplates: { ...prev.emailTemplates, welcome: e.target.value }
              }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Email</label>
            <textarea
              value={settings.emailTemplates.rejection}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                emailTemplates: { ...prev.emailTemplates, rejection: e.target.value }
              }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approval Email</label>
            <textarea
              value={settings.emailTemplates.approval}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                emailTemplates: { ...prev.emailTemplates, approval: e.target.value }
              }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Footer Links</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About Page</label>
            <input
              type="text"
              value={settings.footerLinks.about}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                footerLinks: { ...prev.footerLinks, about: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Policy</label>
            <input
              type="text"
              value={settings.footerLinks.privacy}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                footerLinks: { ...prev.footerLinks, privacy: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms of Service</label>
            <input
              type="text"
              value={settings.footerLinks.terms}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                footerLinks: { ...prev.footerLinks, terms: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Page</label>
            <input
              type="text"
              value={settings.footerLinks.contact}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                footerLinks: { ...prev.footerLinks, contact: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;

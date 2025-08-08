import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Settings, Palette, Bell, Mail, Link as LinkIcon, Save, Home, ArrowLeft, Shield, Users, Lock, Unlock } from 'lucide-react';
import { betaSettingsService } from '../../services/betaSettingsService';
import type { BetaSettings } from '../../services/betaSettingsService';

const SystemSettings = () => {
  const router = useRouter();
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

  // Beta settings state
  const [betaSettings, setBetaSettings] = useState<BetaSettings>({
    betaAccessEnabled: true,
    restrictedPages: [],
    allowedRoles: []
  });
  
  // Load beta settings on component mount
  useEffect(() => {
    const loadedBetaSettings = betaSettingsService.getSettings();
    setBetaSettings(loadedBetaSettings);
  }, []);

  // Beta settings functions
  const handleBetaToggle = (enabled: boolean) => {
    betaSettingsService.setBetaAccessEnabled(enabled);
    setBetaSettings(prev => ({ ...prev, betaAccessEnabled: enabled }));
  };

  const handleAddRestrictedPage = (pageName: string) => {
    if (pageName && !betaSettings.restrictedPages.includes(pageName)) {
      betaSettingsService.addRestrictedPage(pageName);
      setBetaSettings(prev => ({
        ...prev,
        restrictedPages: [...prev.restrictedPages, pageName]
      }));
    }
  };

  const handleRemoveRestrictedPage = (pageName: string) => {
    betaSettingsService.removeRestrictedPage(pageName);
    setBetaSettings(prev => ({
      ...prev,
      restrictedPages: prev.restrictedPages.filter(page => page !== pageName)
    }));
  };

  const handleAddAllowedRole = (role: string) => {
    if (role && !betaSettings.allowedRoles.includes(role.toLowerCase())) {
      betaSettingsService.addAllowedRole(role);
      setBetaSettings(prev => ({
        ...prev,
        allowedRoles: [...prev.allowedRoles, role.toLowerCase()]
      }));
    }
  };

  const handleRemoveAllowedRole = (role: string) => {
    betaSettingsService.removeAllowedRole(role);
    setBetaSettings(prev => ({
      ...prev,
      allowedRoles: prev.allowedRoles.filter(r => r !== role)
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Simulate saving to backend
    alert('Settings saved successfully!');
    // You can add actual API call here
    // Example: await updateSystemSettings(settings);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToHome}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors group bg-white border border-gray-200 shadow-sm"
            title="Back to Home Page"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm font-medium">Home</span>
          </button>
          <div className="border-l border-gray-300 h-8"></div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
            <p className="text-gray-600 dark:text-gray-400">Configure global system preferences</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
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

      {/* Beta Access Control */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Beta Access Control</h3>
          <div className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
            betaSettings.betaAccessEnabled 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {betaSettings.betaAccessEnabled ? 'RESTRICTED' : 'UNRESTRICTED'}
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Master Toggle */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Beta Access Restrictions</h4>
                <p className="text-sm text-gray-500">
                  Enable to restrict access to selected pages for non-beta users
                </p>
              </div>
              <button
                onClick={() => handleBetaToggle(!betaSettings.betaAccessEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  betaSettings.betaAccessEnabled
                    ? 'bg-purple-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                    betaSettings.betaAccessEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Status Display */}
          <div className={`rounded-lg p-4 ${
            betaSettings.betaAccessEnabled 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center">
              {betaSettings.betaAccessEnabled ? (
                <>
                  <Lock className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Beta restrictions are ACTIVE
                    </p>
                    <p className="text-xs text-red-600">
                      {betaSettings.restrictedPages.length} pages restricted to beta users only
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Unlock className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      All pages are publicly accessible
                    </p>
                    <p className="text-xs text-green-600">
                      No beta restrictions are currently active
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Restricted Pages Management */}
          {betaSettings.betaAccessEnabled && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Restricted Pages</h4>
                <p className="text-xs text-gray-500 mb-3">
                  Pages that require beta access to view
                </p>
                
                {/* Current restricted pages */}
                <div className="space-y-2 mb-4">
                  {betaSettings.restrictedPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <span className="text-sm text-gray-700">{page}</span>
                      <button
                        onClick={() => handleRemoveRestrictedPage(page)}
                        className="text-red-600 hover:text-red-700 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {betaSettings.restrictedPages.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No pages currently restricted</p>
                  )}
                </div>

                {/* Add new restricted page */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter page name to restrict"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        handleAddRestrictedPage(input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      handleAddRestrictedPage(input.value);
                      input.value = '';
                    }}
                    className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Allowed Roles Management */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Allowed Roles</h4>
                <p className="text-xs text-gray-500 mb-3">
                  User roles that can access beta-restricted pages
                </p>
                
                {/* Current allowed roles */}
                <div className="space-y-2 mb-4">
                  {betaSettings.allowedRoles.map((role, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                      <span className="text-sm text-gray-700 capitalize">{role}</span>
                      <button
                        onClick={() => handleRemoveAllowedRole(role)}
                        className="text-red-600 hover:text-red-700 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {betaSettings.allowedRoles.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No roles currently allowed</p>
                  )}
                </div>

                {/* Add new allowed role */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter role name (e.g., admin, betauser)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        handleAddAllowedRole(input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      handleAddAllowedRole(input.value);
                      input.value = '';
                    }}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
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

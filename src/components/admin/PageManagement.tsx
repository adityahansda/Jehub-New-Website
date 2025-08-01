import React, { useState } from 'react';
import { Globe, ToggleLeft, ToggleRight, AlertTriangle, Calendar, Settings, Power, PowerOff } from 'lucide-react';

const PageManagement = () => {
  const [pages, setPages] = useState([
    { id: 1, name: 'Notes Upload', path: '/notes-upload', enabled: true, maintenance: false },
    { id: 2, name: 'Notes Download', path: '/notes-download', enabled: true, maintenance: false },
    { id: 3, name: 'Community', path: '/community', enabled: false, maintenance: true },
    { id: 4, name: 'Leaderboard', path: '/leaderboard', enabled: true, maintenance: false },
    { id: 5, name: 'User Dashboard', path: '/dashboard', enabled: true, maintenance: false },
    { id: 6, name: 'Profile Settings', path: '/profile', enabled: true, maintenance: false },
    { id: 7, name: 'Team Page', path: '/team', enabled: true, maintenance: false },
    { id: 8, name: 'Contact Us', path: '/contact', enabled: true, maintenance: false },
  ]);

  const [globalMaintenance, setGlobalMaintenance] = useState(false);
  
  const [maintenanceSettings, setMaintenanceSettings] = useState({
    scheduledMaintenance: false,
    maintenanceStart: '',
    maintenanceEnd: '',
    message: 'We are currently performing scheduled maintenance. Please check back later.'
  });

  const togglePageStatus = (pageId: number) => {
    setPages(prev => 
      prev.map(page => 
        page.id === pageId ? { ...page, enabled: !page.enabled } : page
      )
    );
    const page = pages.find(p => p.id === pageId);
    if (page) {
      alert(`${page.name} has been ${page.enabled ? 'disabled' : 'enabled'}!`);
    }
  };

  const toggleMaintenance = (pageId: number) => {
    setPages(prev => 
      prev.map(page => 
        page.id === pageId ? { ...page, maintenance: !page.maintenance } : page
      )
    );
    const page = pages.find(p => p.id === pageId);
    if (page) {
      alert(`${page.name} maintenance mode has been ${page.maintenance ? 'disabled' : 'enabled'}!`);
    }
  };

  const toggleGlobalMaintenance = () => {
    const newGlobalState = !globalMaintenance;
    setGlobalMaintenance(newGlobalState);
    
    if (newGlobalState) {
      // Enable maintenance mode for all pages
      setPages(prev => prev.map(page => ({ ...page, maintenance: true })));
      alert('Global maintenance mode enabled! All pages are now in maintenance mode.');
    } else {
      // Disable maintenance mode for all pages
      setPages(prev => prev.map(page => ({ ...page, maintenance: false })));
      alert('Global maintenance mode disabled! All pages are now accessible.');
    }
  };

  const enableAllPages = () => {
    setPages(prev => prev.map(page => ({ ...page, enabled: true })));
    alert('All pages have been enabled!');
  };

  const disableAllPages = () => {
    setPages(prev => prev.map(page => ({ ...page, enabled: false })));
    alert('All pages have been disabled!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Page Management</h2>
        <p className="text-gray-600">Control page visibility and maintenance modes</p>
      </div>

      {/* Global Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={toggleGlobalMaintenance}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              globalMaintenance 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
            {globalMaintenance ? 'Disable Global Maintenance' : 'Enable Global Maintenance'}
          </button>
          
          <button
            onClick={enableAllPages}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Power className="h-5 w-5" />
            Enable All Pages
          </button>
          
          <button
            onClick={disableAllPages}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            <PowerOff className="h-5 w-5" />
            Disable All Pages
          </button>
        </div>
        
        {globalMaintenance && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Global Maintenance Mode Active</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              All pages are currently in maintenance mode. Individual page settings are overridden.
            </p>
          </div>
        )}
      </div>

      {/* Individual Page Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Page Controls</h3>
        <div className="space-y-4">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <Globe className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">{page.name}</h4>
                  <p className="text-sm text-gray-600">{page.path}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Enabled</span>
                  <button 
                    onClick={() => togglePageStatus(page.id)}
                    className={`p-1 rounded ${page.enabled ? 'text-green-600' : 'text-gray-400'}`}
                    disabled={globalMaintenance}
                  >
                    {page.enabled ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Maintenance</span>
                  <button 
                    onClick={() => toggleMaintenance(page.id)}
                    className={`p-1 rounded ${
                      globalMaintenance 
                        ? 'text-orange-600 opacity-50 cursor-not-allowed' 
                        : page.maintenance 
                          ? 'text-orange-600' 
                          : 'text-gray-400'
                    }`}
                    disabled={globalMaintenance}
                    title={globalMaintenance ? 'Global maintenance mode is active' : ''}
                  >
                    {(globalMaintenance || page.maintenance) ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                  </button>
                  {globalMaintenance && (
                    <span className="text-xs text-orange-600 font-medium">(Global Override)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Settings */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Maintenance</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="scheduledMaintenance"
              checked={maintenanceSettings.scheduledMaintenance}
              onChange={(e) => setMaintenanceSettings(prev => ({ ...prev, scheduledMaintenance: e.target.checked }))}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="scheduledMaintenance" className="text-sm font-medium text-gray-700">
              Enable Scheduled Maintenance
            </label>
          </div>

          {maintenanceSettings.scheduledMaintenance && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={maintenanceSettings.maintenanceStart}
                  onChange={(e) => setMaintenanceSettings(prev => ({ ...prev, maintenanceStart: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  value={maintenanceSettings.maintenanceEnd}
                  onChange={(e) => setMaintenanceSettings(prev => ({ ...prev, maintenanceEnd: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Message</label>
                <textarea
                  value={maintenanceSettings.message}
                  onChange={(e) => setMaintenanceSettings(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageManagement;

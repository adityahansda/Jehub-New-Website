import React, { useState, useEffect } from 'react';
import { betaSettingsService, BetaSettings } from '../../services/betaSettingsService';
import {
    Lock,
    Unlock,
    Users,
    Eye,
    EyeOff,
    Settings,
    Save,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Info,
    Shield
} from 'lucide-react';

const BetaAccessControlPanel: React.FC = () => {
    const [settings, setSettings] = useState<BetaSettings>({
        betaAccessEnabled: false,
        restrictedPages: [],
        allowedRoles: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    // Available roles that can be granted beta access
    const availableRoles = ['admin', 'team', 'intern', 'manager', 'betatest'];

    // Available pages for beta configuration
    const availablePages = [
        'notes-download',
        'notes-upload', 
        'team-dashboard',
        'admin-dashboard',
        'messaging',
        'leaderboard',
        'points-management',
        'system-settings'
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        try {
            setLoading(true);
            const currentSettings = betaSettingsService.getSettings();
            setSettings(currentSettings);
            setMessage({ type: 'success', text: 'Settings loaded successfully!' });
        } catch (error) {
            console.error('Failed to load beta settings:', error);
            setMessage({ type: 'error', text: 'Failed to load beta settings' });
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = () => {
        try {
            setSaving(true);
            betaSettingsService.updateSettings(settings);
            setMessage({ type: 'success', text: 'Beta access settings saved successfully!' });
        } catch (error) {
            console.error('Failed to save beta settings:', error);
            setMessage({ type: 'error', text: 'Failed to save beta settings' });
        } finally {
            setSaving(false);
        }
    };

    const toggleRole = (role: string) => {
        setSettings(prev => ({
            ...prev,
            allowedRoles: prev.allowedRoles.includes(role)
                ? prev.allowedRoles.filter(r => r !== role)
                : [...prev.allowedRoles, role]
        }));
    };

    const toggleBetaPage = (page: string) => {
        setSettings(prev => ({
            ...prev,
            restrictedPages: prev.restrictedPages.includes(page)
                ? prev.restrictedPages.filter(p => p !== page)
                : [...prev.restrictedPages, page]
        }));
    };

    const clearMessage = () => {
        setMessage(null);
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    <span className="ml-4 text-gray-600 dark:text-gray-400">Loading beta access settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Lock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Beta Access Control</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage beta access permissions and page restrictions</p>
                    </div>
                </div>
            </div>

            {/* Message Display */}
            {message && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' :
                    message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                }`}>
                    <div className="flex items-center space-x-2">
                        {message.type === 'success' && <CheckCircle className="h-5 w-5" />}
                        {message.type === 'error' && <AlertTriangle className="h-5 w-5" />}
                        {message.type === 'info' && <Info className="h-5 w-5" />}
                        <span>{message.text}</span>
                    </div>
                    <button
                        onClick={clearMessage}
                        className="text-current hover:opacity-70"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Master Beta Access Toggle */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            settings.betaAccessEnabled 
                                ? 'bg-red-100 dark:bg-red-900/20' 
                                : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                            {settings.betaAccessEnabled ? (
                                <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                            ) : (
                                <Unlock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Beta Access Control
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {settings.betaAccessEnabled 
                                    ? 'Beta access restrictions are currently active'
                                    : 'Beta access restrictions are currently disabled'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSettings(prev => ({ ...prev, betaAccessEnabled: !prev.betaAccessEnabled }))}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                            settings.betaAccessEnabled 
                                ? 'bg-red-600' 
                                : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settings.betaAccessEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                    </button>
                </div>
            </div>

            {/* Beta Access Configuration */}
            {settings.betaAccessEnabled && (
                <>
                    {/* Allowed Roles */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Allowed Roles</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Select which user roles can access beta features</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableRoles.map((role) => (
                                <label key={role} className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={settings.allowedRoles.includes(role)}
                                        onChange={() => toggleRole(role)}
                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{role}</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {role === 'admin' && 'System administrators'}
                                            {role === 'team' && 'Team members'}
                                            {role === 'intern' && 'Interns'}
                                            {role === 'manager' && 'Managers'}
                                            {role === 'betatest' && 'Beta testers'}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Beta Restricted Pages */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <EyeOff className="h-6 w-6 text-red-600 dark:text-red-400" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Beta Restricted Pages</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Pages that require beta access (restricted to allowed roles only)</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availablePages.map((page) => (
                                <label key={page} className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={settings.restrictedPages.includes(page)}
                                        onChange={() => toggleBetaPage(page)}
                                        className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{page}</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Restricted access</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                <button
                    onClick={loadSettings}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Reload Settings</span>
                </button>
                
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            <span>Save Settings</span>
                        </>
                    )}
                </button>
            </div>

            {/* Beta Access Status Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Configuration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-2">Beta Access:</p>
                        <p className={`${settings.betaAccessEnabled ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {settings.betaAccessEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-2">Allowed Roles:</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {settings.allowedRoles.length > 0 ? settings.allowedRoles.join(', ') : 'None'}
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-2">Restricted Pages:</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {settings.restrictedPages.length > 0 ? `${settings.restrictedPages.length} pages` : 'None'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BetaAccessControlPanel;

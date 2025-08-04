import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X, AlertCircle, Settings, Power, Shield, Volume2, VolumeX, Clock, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { databases } from '../../lib/appwrite';
import { appwriteConfig } from '../../lib/appwriteConfig';
import { ID, Query } from 'appwrite';

interface NotificationSettings {
  newNotes: boolean;
  requestFulfilled: boolean;
  systemUpdates: boolean;
  weeklyDigest: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  globalEnabled: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  enabled: boolean;
  variant: 'enable' | 'disable' | 'toggle';
}

const PushNotificationPermission: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    newNotes: true,
    requestFulfilled: true,
    systemUpdates: false,
    weeklyDigest: false,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    },
    soundEnabled: true,
    vibrationEnabled: true,
    globalEnabled: true
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    checkNotificationStatus();
    loadUserNotificationSettings();
  }, [user]);

  const checkNotificationStatus = async () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Check if user is subscribed in database
      if (user) {
        await checkUserSubscriptionStatus();
      }
    }
  };

  const checkUserSubscriptionStatus = async () => {
    try {
      const subscriptions = await databases.listDocuments(
        appwriteConfig.databaseId,
        'push_subscriptions', // You may need to create this collection
        [
          Query.equal('userId', user!.$id),
          Query.equal('isActive', true)
        ]
      );
      
      setIsSubscribed(subscriptions.documents.length > 0);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const loadUserNotificationSettings = async () => {
    try {
      if (!user) return;
      
      const settings = await databases.listDocuments(
        appwriteConfig.databaseId,
        'notification_settings', // You may need to create this collection
        [Query.equal('userId', user.$id)]
      );

      if (settings.documents.length > 0) {
        const userSettings = settings.documents[0];
        setNotificationSettings({
          newNotes: userSettings.newNotes ?? true,
          requestFulfilled: userSettings.requestFulfilled ?? true,
          systemUpdates: userSettings.systemUpdates ?? false,
          weeklyDigest: userSettings.weeklyDigest ?? false,
          quietHours: {
            enabled: userSettings.quietHoursEnabled ?? false,
            startTime: userSettings.quietHoursStart ?? '22:00',
            endTime: userSettings.quietHoursEnd ?? '08:00'
          },
          soundEnabled: userSettings.soundEnabled ?? true,
          vibrationEnabled: userSettings.vibrationEnabled ?? true,
          globalEnabled: userSettings.globalEnabled ?? true
        });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setStatusMessage('Push notifications are not supported in this browser');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await subscribeToNotifications();
        setStatusMessage('🎉 Notifications enabled successfully! You\'ll now receive updates about new notes.');
        setMessageType('success');
      } else if (permission === 'denied') {
        setStatusMessage('Notifications blocked. You can enable them in your browser settings.');
        setMessageType('error');
      } else {
        setStatusMessage('Notification permission dismissed. You can enable them later.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setStatusMessage('Failed to enable notifications. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      if (!('serviceWorker' in navigator) || !user) return;

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Save subscription to database
      await saveSubscriptionToDatabase(subscription);
      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw error;
    }
  };

  const saveSubscriptionToDatabase = async (subscription: PushSubscription) => {
    try {
      const subscriptionData = {
        userId: user!.$id,
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        userAgent: navigator.userAgent,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Check if subscription already exists
      const existingSubscriptions = await databases.listDocuments(
        appwriteConfig.databaseId,
        'push_subscriptions',
        [Query.equal('userId', user!.$id)]
      );

      if (existingSubscriptions.documents.length > 0) {
        // Update existing subscription
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'push_subscriptions',
          existingSubscriptions.documents[0].$id,
          subscriptionData
        );
      } else {
        // Create new subscription
        await databases.createDocument(
          appwriteConfig.databaseId,
          'push_subscriptions',
          ID.unique(),
          subscriptionData
        );
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  };

  const unsubscribeFromNotifications = async () => {
    setLoading(true);
    try {
      // Unsubscribe from push manager
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
          }
        }
      }

      // Deactivate subscription in database
      const subscriptions = await databases.listDocuments(
        appwriteConfig.databaseId,
        'push_subscriptions',
        [Query.equal('userId', user!.$id)]
      );

      for (const sub of subscriptions.documents) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'push_subscriptions',
          sub.$id,
          { isActive: false, updatedAt: new Date().toISOString() }
        );
      }

      setIsSubscribed(false);
      setStatusMessage('Notifications disabled successfully.');
      setMessageType('success');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setStatusMessage('Failed to disable notifications. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async (newSettings: NotificationSettings) => {
    try {
      if (!user) return;

      const settingsData = {
        userId: user.$id,
        ...newSettings,
        updatedAt: new Date().toISOString()
      };

      // Check if settings already exist
      const existingSettings = await databases.listDocuments(
        appwriteConfig.databaseId,
        'notification_settings',
        [Query.equal('userId', user.$id)]
      );

      if (existingSettings.documents.length > 0) {
        // Update existing settings
        await databases.updateDocument(
          appwriteConfig.databaseId,
          'notification_settings',
          existingSettings.documents[0].$id,
          settingsData
        );
      } else {
        // Create new settings
        await databases.createDocument(
          appwriteConfig.databaseId,
          'notification_settings',
          ID.unique(),
          {
            ...settingsData,
            createdAt: new Date().toISOString()
          }
        );
      }

      setNotificationSettings(newSettings);
      setStatusMessage('Notification preferences saved successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setStatusMessage('Failed to save preferences. Please try again.');
      setMessageType('error');
    }
  };

  const clearStatusMessage = () => {
    setStatusMessage('');
    setMessageType('');
  };

  // Quick action functions
  const enableAllNotifications = async () => {
    const allEnabledSettings = {
      ...notificationSettings,
      newNotes: true,
      requestFulfilled: true,
      systemUpdates: true,
      weeklyDigest: true,
      globalEnabled: true
    };
    await saveNotificationSettings(allEnabledSettings);
    setStatusMessage('All notifications enabled successfully!');
    setMessageType('success');
  };

  const disableAllNotifications = async () => {
    const allDisabledSettings = {
      ...notificationSettings,
      newNotes: false,
      requestFulfilled: false,
      systemUpdates: false,
      weeklyDigest: false,
      globalEnabled: false
    };
    await saveNotificationSettings(allDisabledSettings);
    setStatusMessage('All notifications disabled successfully!');
    setMessageType('success');
  };

  const enableQuietMode = async () => {
    const quietModeSettings = {
      ...notificationSettings,
      quietHours: {
        ...notificationSettings.quietHours,
        enabled: true
      },
      soundEnabled: false,
      vibrationEnabled: false
    };
    await saveNotificationSettings(quietModeSettings);
    setStatusMessage('Quiet mode enabled. Notifications will be silent during quiet hours.');
    setMessageType('success');
  };

  const disableQuietMode = async () => {
    const normalModeSettings = {
      ...notificationSettings,
      quietHours: {
        ...notificationSettings.quietHours,
        enabled: false
      },
      soundEnabled: true,
      vibrationEnabled: true
    };
    await saveNotificationSettings(normalModeSettings);
    setStatusMessage('Quiet mode disabled. Normal notification sounds restored.');
    setMessageType('success');
  };

  const toggleEssentialOnly = async () => {
    const essentialSettings = {
      ...notificationSettings,
      newNotes: true,
      requestFulfilled: true,
      systemUpdates: false,
      weeklyDigest: false
    };
    await saveNotificationSettings(essentialSettings);
    setStatusMessage('Essential notifications only mode enabled.');
    setMessageType('success');
  };

  // Get quick actions based on current state
  const getQuickActions = (): QuickAction[] => [
    {
      id: 'enable-all',
      label: 'Enable All',
      description: 'Turn on all notification types',
      icon: Bell,
      action: enableAllNotifications,
      enabled: !notificationSettings.globalEnabled || (!notificationSettings.newNotes && !notificationSettings.requestFulfilled),
      variant: 'enable'
    },
    {
      id: 'disable-all',
      label: 'Disable All',
      description: 'Turn off all notifications',
      icon: BellOff,
      action: disableAllNotifications,
      enabled: notificationSettings.globalEnabled || notificationSettings.newNotes || notificationSettings.requestFulfilled,
      variant: 'disable'
    },
    {
      id: 'quiet-mode',
      label: notificationSettings.quietHours.enabled ? 'Disable Quiet Mode' : 'Enable Quiet Mode',
      description: notificationSettings.quietHours.enabled ? 'Turn off quiet hours' : 'Silent notifications during specified hours',
      icon: notificationSettings.quietHours.enabled ? Volume2 : VolumeX,
      action: notificationSettings.quietHours.enabled ? disableQuietMode : enableQuietMode,
      enabled: true,
      variant: 'toggle'
    },
    {
      id: 'essential-only',
      label: 'Essential Only',
      description: 'Only new notes and fulfilled requests',
      icon: Shield,
      action: toggleEssentialOnly,
      enabled: notificationSettings.systemUpdates || notificationSettings.weeklyDigest,
      variant: 'toggle'
    }
  ];

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isSubscribed 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Push Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isSubscribed 
                ? 'You\'ll receive notifications about new notes and updates'
                : 'Enable notifications to stay updated with new notes'
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
          messageType === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center">
            {messageType === 'success' ? (
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
            )}
            <span className={`text-sm ${
              messageType === 'success' 
                ? 'text-green-800 dark:text-green-300' 
                : 'text-red-800 dark:text-red-300'
            }`}>
              {statusMessage}
            </span>
          </div>
          <button
            onClick={clearStatusMessage}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {getQuickActions().map(action => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              disabled={loading || !action.enabled}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                action.variant === 'enable' 
                  ? 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30' 
                  : action.variant === 'disable' 
                  ? 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
              }`}
              title={action.description}
            >
              <IconComponent className="h-4 w-4" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notification Toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isSubscribed ? 'Notifications Enabled' : 'Enable Notifications'}
        </span>
        
        {!isSubscribed ? (
          <button
            onClick={requestNotificationPermission}
            disabled={loading || permission === 'denied'}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Bell className="h-4 w-4" />
            )}
            <span>{loading ? 'Enabling...' : 'Enable'}</span>
          </button>
        ) : (
          <button
            onClick={unsubscribeFromNotifications}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            <span>{loading ? 'Disabling...' : 'Disable'}</span>
          </button>
        )}
      </div>

      {/* Notification Settings */}
      {showSettings && isSubscribed && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Notification Preferences
          </h4>
          
          <div className="space-y-3">
            {[
              { key: 'newNotes', label: 'New Notes Available', description: 'When someone uploads new notes' },
              { key: 'requestFulfilled', label: 'Note Requests Fulfilled', description: 'When your requested notes are uploaded' },
              { key: 'systemUpdates', label: 'System Updates', description: 'Important announcements and updates' },
              { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of weekly activity' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings[item.key as keyof Pick<NotificationSettings, 'newNotes' | 'requestFulfilled' | 'systemUpdates' | 'weeklyDigest'>]}
                    onChange={(e) => {
                      const newSettings = {
                        ...notificationSettings,
                        [item.key]: e.target.checked
                      };
                      saveNotificationSettings(newSettings);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permission Status */}
      {permission === 'denied' && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
            <span className="text-sm text-yellow-800 dark:text-yellow-300">
              Notifications are blocked. To enable them, click the lock icon in your browser's address bar and allow notifications.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotificationPermission;

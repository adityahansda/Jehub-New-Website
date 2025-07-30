import { useState, useEffect } from 'react';

interface Setting {
  value: string;
  type: string;
  description: string;
  updatedAt: string;
}

interface AppSettings {
  [key: string]: Setting;
}

interface UseSettingsReturn {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (response.ok) {
        setSettings(data.settings || {});
      } else {
        setError(data.error || 'Failed to fetch settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings
  };
};

// Hook for fetching active template
export const useActiveTemplate = () => {
  const [activeTemplate, setActiveTemplate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveTemplate = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/templates');
        const data = await response.json();
        
        if (response.ok) {
          const active = data.templates?.find((t: any) => t.isActive);
          if (active) {
            setActiveTemplate(active.content);
          } else {
            // Fallback to default template
            setActiveTemplate('🎓 Check out this amazing study material: {title}\n\n📚 Subject: {subject}\n🎯 Branch: {branch}\n📅 Semester: {semester}\n👤 Shared by: {uploader}\n\n💡 Join Jharkhand Engineer\'s Hub for more quality resources!\n\n{url}');
          }
        }
      } catch (error) {
        console.error('Error fetching active template:', error);
        // Fallback to default template
        setActiveTemplate('🎓 Check out this amazing study material: {title}\n\n📚 Subject: {subject}\n🎯 Branch: {branch}\n📅 Semester: {semester}\n👤 Shared by: {uploader}\n\n💡 Join Jharkhand Engineer\'s Hub for more quality resources!\n\n{url}');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTemplate();
  }, []);

  return { activeTemplate, loading };
};

// Helper functions for specific settings
export const getShareMessageTemplate = (settings: AppSettings): string => {
  return settings['share_message_template']?.value || 
    '🎓 Check out this amazing study material: {title}\n\n📚 Subject: {subject}\n🎯 Branch: {branch}\n📅 Semester: {semester}\n👤 Shared by: {uploader}\n\n💡 Join Jharkhand Engineer\'s Hub for more quality resources!\n\n{url}';
};

export const isSharePlatformEnabled = (settings: AppSettings, platform: string): boolean => {
  const key = `share_${platform}_enabled`;
  return settings[key]?.value === 'true';
};

export const getSiteName = (settings: AppSettings): string => {
  return settings['site_name']?.value || 'Jharkhand Engineer\'s Hub';
};

export const getSiteTagline = (settings: AppSettings): string => {
  return settings['site_tagline']?.value || 'Your gateway to engineering excellence in Jharkhand';
};

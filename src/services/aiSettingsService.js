import { databases, ID } from '../lib/appwrite';

class AISettingsService {
  constructor() {
    this.databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    this.collectionId = process.env.NEXT_PUBLIC_APPWRITE_AI_SETTINGS_COLLECTION_ID;
  }

  // Default AI settings
  getDefaultSettings() {
    return {
      // Response Parameters
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      
      // System Configuration
      systemPrompt: "You are a helpful AI assistant for engineering students at Jharkhand Engineer's Hub. Help students with their academic questions, provide study guidance, and assist with course materials. Be supportive, accurate, and educational in your responses.",
      responseStyle: 'friendly',
      languagePreference: 'english',
      
      // Safety & Moderation
      contentFilter: true,
      moderationLevel: 'medium',
      allowPersonalInfo: false,
      
      // Performance Settings
      cacheEnabled: true,
      responseTimeLimit: 30,
      maxConversationLength: 50,
      
      // API Configuration
      apiProvider: 'google-gemini',
      apiKeyStatus: 'connected',
      rateLimitPerUser: 20,
      rateLimitPerHour: 100
    };
  }

  // Get AI settings from database or localStorage
  async getSettings() {
    try {
      // Try to get from localStorage first for faster loading
      const localSettings = localStorage.getItem('aiSettings');
      if (localSettings) {
        return JSON.parse(localSettings);
      }

      // If no local settings, return default settings
      return this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading AI settings:', error);
      return this.getDefaultSettings();
    }
  }

  // Save settings to both localStorage and database
  async saveSettings(settings) {
    try {
      // Validate settings
      const validatedSettings = this.validateSettings(settings);
      
      // Save to localStorage immediately
      localStorage.setItem('aiSettings', JSON.stringify(validatedSettings));
      
      // Try to save to database (if available)
      if (this.databaseId && this.collectionId) {
        try {
          // First, try to get existing settings document
          const existingSettings = await this.getSettingsFromDatabase();
          
          if (existingSettings) {
            // Update existing document
            await databases.updateDocument(
              this.databaseId,
              this.collectionId,
              existingSettings.$id,
              {
                settings: JSON.stringify(validatedSettings),
                lastUpdated: new Date().toISOString()
              }
            );
          } else {
            // Create new document
            await databases.createDocument(
              this.databaseId,
              this.collectionId,
              ID.unique(),
              {
                settings: JSON.stringify(validatedSettings),
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
              }
            );
          }
        } catch (dbError) {
          console.warn('Could not save to database, but saved to localStorage:', dbError);
        }
      }
      
      return { success: true, settings: validatedSettings };
    } catch (error) {
      console.error('Error saving AI settings:', error);
      return { success: false, error: error.message };
    }
  }

  // Get settings from database
  async getSettingsFromDatabase() {
    try {
      if (!this.databaseId || !this.collectionId) {
        return null;
      }

      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        []
      );

      if (response.documents.length > 0) {
        const settingsDoc = response.documents[0];
        return {
          ...settingsDoc,
          settings: JSON.parse(settingsDoc.settings)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting settings from database:', error);
      return null;
    }
  }

  // Validate settings object
  validateSettings(settings) {
    const defaults = this.getDefaultSettings();
    const validated = { ...defaults };

    // Validate numeric values
    if (typeof settings.maxTokens === 'number' && settings.maxTokens >= 100 && settings.maxTokens <= 2000) {
      validated.maxTokens = settings.maxTokens;
    }
    
    if (typeof settings.temperature === 'number' && settings.temperature >= 0 && settings.temperature <= 2) {
      validated.temperature = settings.temperature;
    }
    
    if (typeof settings.topP === 'number' && settings.topP >= 0 && settings.topP <= 1) {
      validated.topP = settings.topP;
    }
    
    if (typeof settings.frequencyPenalty === 'number' && settings.frequencyPenalty >= -2 && settings.frequencyPenalty <= 2) {
      validated.frequencyPenalty = settings.frequencyPenalty;
    }
    
    if (typeof settings.presencePenalty === 'number' && settings.presencePenalty >= -2 && settings.presencePenalty <= 2) {
      validated.presencePenalty = settings.presencePenalty;
    }

    if (typeof settings.responseTimeLimit === 'number' && settings.responseTimeLimit >= 5 && settings.responseTimeLimit <= 60) {
      validated.responseTimeLimit = settings.responseTimeLimit;
    }

    if (typeof settings.maxConversationLength === 'number' && settings.maxConversationLength >= 10 && settings.maxConversationLength <= 100) {
      validated.maxConversationLength = settings.maxConversationLength;
    }

    if (typeof settings.rateLimitPerUser === 'number' && settings.rateLimitPerUser >= 1 && settings.rateLimitPerUser <= 100) {
      validated.rateLimitPerUser = settings.rateLimitPerUser;
    }

    if (typeof settings.rateLimitPerHour === 'number' && settings.rateLimitPerHour >= 50 && settings.rateLimitPerHour <= 1000) {
      validated.rateLimitPerHour = settings.rateLimitPerHour;
    }

    // Validate string values
    if (typeof settings.systemPrompt === 'string' && settings.systemPrompt.trim().length > 0) {
      validated.systemPrompt = settings.systemPrompt.trim();
    }

    if (['friendly', 'professional', 'casual', 'academic'].includes(settings.responseStyle)) {
      validated.responseStyle = settings.responseStyle;
    }

    if (['english', 'hindi', 'both'].includes(settings.languagePreference)) {
      validated.languagePreference = settings.languagePreference;
    }

    if (['strict', 'medium', 'relaxed'].includes(settings.moderationLevel)) {
      validated.moderationLevel = settings.moderationLevel;
    }

    if (['google-gemini', 'openai-gpt', 'anthropic-claude', 'cohere'].includes(settings.apiProvider)) {
      validated.apiProvider = settings.apiProvider;
    }

    if (['connected', 'error', 'pending'].includes(settings.apiKeyStatus)) {
      validated.apiKeyStatus = settings.apiKeyStatus;
    }

    // Validate boolean values
    validated.contentFilter = Boolean(settings.contentFilter);
    validated.allowPersonalInfo = Boolean(settings.allowPersonalInfo);
    validated.cacheEnabled = Boolean(settings.cacheEnabled);

    return validated;
  }

  // Reset settings to defaults
  async resetToDefaults() {
    const defaultSettings = this.getDefaultSettings();
    return await this.saveSettings(defaultSettings);
  }

  // Test API connection
  async testAPIConnection(apiProvider = 'google-gemini') {
    try {
      // This would typically test the actual API connection
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate success/failure based on provider
      const connectionStatus = Math.random() > 0.2 ? 'connected' : 'error';
      
      return {
        success: connectionStatus === 'connected',
        status: connectionStatus,
        provider: apiProvider,
        message: connectionStatus === 'connected' 
          ? `Successfully connected to ${apiProvider}`
          : `Failed to connect to ${apiProvider}. Please check your API key.`
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        provider: apiProvider,
        message: error.message
      };
    }
  }

  // Get settings statistics
  getSettingsStats(settings) {
    return {
      totalSettings: Object.keys(settings).length,
      safetyLevel: settings.moderationLevel,
      performanceScore: this.calculatePerformanceScore(settings),
      apiHealth: settings.apiKeyStatus,
      lastModified: localStorage.getItem('aiSettingsLastModified') || 'Never'
    };
  }

  // Calculate performance score based on settings
  calculatePerformanceScore(settings) {
    let score = 100;
    
    // Deduct points for high resource usage
    if (settings.maxTokens > 1500) score -= 10;
    if (settings.temperature > 1.5) score -= 5;
    if (settings.responseTimeLimit > 45) score -= 5;
    if (!settings.cacheEnabled) score -= 15;
    
    // Add points for optimization
    if (settings.maxConversationLength <= 30) score += 5;
    if (settings.rateLimitPerUser <= 10) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  // Export settings
  exportSettings(settings) {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      settings: settings
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import settings
  async importSettings(file) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.settings) {
        throw new Error('Invalid settings file format');
      }
      
      const validatedSettings = this.validateSettings(importData.settings);
      const result = await this.saveSettings(validatedSettings);
      
      return {
        ...result,
        importDate: importData.exportDate || 'Unknown'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const aiSettingsService = new AISettingsService();

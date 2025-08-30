interface AISettings {
  // Response Parameters
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  
  // System Configuration
  systemPrompt: string;
  responseStyle: string;
  languagePreference: string;
  
  // Safety & Moderation
  contentFilter: boolean;
  moderationLevel: string;
  allowPersonalInfo: boolean;
  
  // Performance Settings
  cacheEnabled: boolean;
  responseTimeLimit: number;
  maxConversationLength: number;
  
  // API Configuration
  apiProvider: string;
  apiKeyStatus: string;
  rateLimitPerUser: number;
  rateLimitPerHour: number;
}

class AISettingsService {
  private readonly STORAGE_KEY = 'jehub_ai_settings';
  private readonly defaultSettings: AISettings = {
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

  /**
   * Get current AI settings
   */
  async getSettings(): Promise<AISettings> {
    try {
      if (typeof window === 'undefined') {
        return this.defaultSettings;
      }
      
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Merge with default settings to ensure all properties exist
        return { ...this.defaultSettings, ...parsedSettings };
      }
      return this.defaultSettings;
    } catch (error) {
      console.error('Error loading AI settings:', error);
      return this.defaultSettings;
    }
  }

  /**
   * Save AI settings
   */
  async saveSettings(settings: AISettings): Promise<{ success: boolean; error?: string }> {
    try {
      if (typeof window === 'undefined') {
        return { success: false, error: 'Not available on server side' };
      }
      
      // Validate settings
      const validationResult = this.validateSettings(settings);
      if (!validationResult.valid) {
        return { success: false, error: validationResult.error };
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      return { success: true };
    } catch (error) {
      console.error('Error saving AI settings:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.saveSettings(this.defaultSettings);
    } catch (error) {
      console.error('Error resetting AI settings:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reset settings' 
      };
    }
  }

  /**
   * Get default settings
   */
  getDefaultSettings(): AISettings {
    return { ...this.defaultSettings };
  }

  /**
   * Validate AI settings
   */
  private validateSettings(settings: AISettings): { valid: boolean; error?: string } {
    try {
      // Validate maxTokens
      if (settings.maxTokens < 100 || settings.maxTokens > 2000) {
        return { valid: false, error: 'Max tokens must be between 100 and 2000' };
      }

      // Validate temperature
      if (settings.temperature < 0 || settings.temperature > 2) {
        return { valid: false, error: 'Temperature must be between 0 and 2' };
      }

      // Validate topP
      if (settings.topP < 0 || settings.topP > 1) {
        return { valid: false, error: 'Top P must be between 0 and 1' };
      }

      // Validate frequency and presence penalty
      if (settings.frequencyPenalty < -2 || settings.frequencyPenalty > 2) {
        return { valid: false, error: 'Frequency penalty must be between -2 and 2' };
      }

      if (settings.presencePenalty < -2 || settings.presencePenalty > 2) {
        return { valid: false, error: 'Presence penalty must be between -2 and 2' };
      }

      // Validate response time limit
      if (settings.responseTimeLimit < 5 || settings.responseTimeLimit > 60) {
        return { valid: false, error: 'Response time limit must be between 5 and 60 seconds' };
      }

      // Validate conversation length
      if (settings.maxConversationLength < 10 || settings.maxConversationLength > 100) {
        return { valid: false, error: 'Max conversation length must be between 10 and 100' };
      }

      // Validate rate limits
      if (settings.rateLimitPerUser < 1 || settings.rateLimitPerUser > 100) {
        return { valid: false, error: 'Rate limit per user must be between 1 and 100' };
      }

      if (settings.rateLimitPerHour < 50 || settings.rateLimitPerHour > 1000) {
        return { valid: false, error: 'Rate limit per hour must be between 50 and 1000' };
      }

      // Validate system prompt
      if (!settings.systemPrompt || settings.systemPrompt.trim().length < 10) {
        return { valid: false, error: 'System prompt must be at least 10 characters long' };
      }

      // Validate enums
      const validResponseStyles = ['friendly', 'professional', 'casual', 'academic'];
      if (!validResponseStyles.includes(settings.responseStyle)) {
        return { valid: false, error: 'Invalid response style' };
      }

      const validLanguages = ['english', 'hindi', 'both'];
      if (!validLanguages.includes(settings.languagePreference)) {
        return { valid: false, error: 'Invalid language preference' };
      }

      const validModerationLevels = ['strict', 'medium', 'relaxed'];
      if (!validModerationLevels.includes(settings.moderationLevel)) {
        return { valid: false, error: 'Invalid moderation level' };
      }

      const validApiProviders = ['google-gemini', 'openai-gpt', 'anthropic-claude', 'cohere'];
      if (!validApiProviders.includes(settings.apiProvider)) {
        return { valid: false, error: 'Invalid API provider' };
      }

      const validApiStatuses = ['connected', 'error', 'pending'];
      if (!validApiStatuses.includes(settings.apiKeyStatus)) {
        return { valid: false, error: 'Invalid API key status' };
      }

      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Validation failed' 
      };
    }
  }

  /**
   * Update a specific setting
   */
  async updateSetting(key: keyof AISettings, value: any): Promise<{ success: boolean; error?: string }> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, [key]: value };
      return await this.saveSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating AI setting:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update setting' 
      };
    }
  }

  /**
   * Get setting by key
   */
  async getSetting(key: keyof AISettings): Promise<any> {
    try {
      const settings = await this.getSettings();
      return settings[key];
    } catch (error) {
      console.error('Error getting AI setting:', error);
      return this.defaultSettings[key];
    }
  }

  /**
   * Test API connection (mock implementation)
   */
  async testApiConnection(): Promise<{ success: boolean; error?: string; latency?: number }> {
    try {
      const startTime = Date.now();
      
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
      
      const latency = Date.now() - startTime;
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        return { success: true, latency };
      } else {
        return { success: false, error: 'API connection test failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  /**
   * Get system stats (mock implementation)
   */
  async getSystemStats(): Promise<{
    totalConversations: number;
    avgResponseTime: number;
    userSatisfaction: number;
    apiCallsToday: number;
  }> {
    // Mock stats - in real implementation, this would fetch from analytics service
    return {
      totalConversations: Math.floor(Math.random() * 1000) + 200,
      avgResponseTime: Math.random() * 2 + 0.5, // 0.5 to 2.5 seconds
      userSatisfaction: Math.random() * 0.5 + 4.5, // 4.5 to 5.0
      apiCallsToday: Math.floor(Math.random() * 500) + 100
    };
  }
}

// Export singleton instance
export const aiSettingsService = new AISettingsService();
export type { AISettings };

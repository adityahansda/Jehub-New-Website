import { databases } from '../lib/appwrite';
import { appwriteConfig } from '../lib/appwriteConfig';
import { Query, ID } from 'appwrite';

export interface DeviceInfo {
  $id?: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  fingerprint?: string;
  country?: string;
  city?: string;
  isp?: string;
  firstSeen: string;
  lastSeen: string;
  loginCount: number;
  isSuspicious: boolean;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface BannedDevice {
  $id?: string;
  ipAddress: string;
  reason: string;
  bannedBy: string;
  bannedAt: string;
  isActive: boolean;
  $createdAt?: string;
  $updatedAt?: string;
}

class DeviceTrackingService {
  private readonly DATABASE_ID = appwriteConfig.databaseId;
  private readonly DEVICE_TRACKING_COLLECTION = appwriteConfig.collections.deviceTracking;
  private readonly BANNED_DEVICES_COLLECTION = appwriteConfig.collections.bannedDevices;

  // Get client IP address from request headers
  async getClientIP(request?: Request): Promise<string> {
    try {
      if (typeof window === 'undefined') {
        // Server-side: get from request headers
        if (request) {
          const forwarded = request.headers.get('x-forwarded-for');
          const realIP = request.headers.get('x-real-ip');
          const cfConnectingIP = request.headers.get('cf-connecting-ip');
          
          if (cfConnectingIP) return cfConnectingIP;
          if (realIP) return realIP;
          if (forwarded) return forwarded.split(',')[0].trim();
        }
        return 'unknown';
      } else {
        // Client-side: fetch from API
        const response = await fetch('/api/ip');
        const data = await response.json();
        return data.ip || 'unknown';
      }
    } catch (error) {
      console.error('Error getting client IP:', error);
      return 'unknown';
    }
  }

  // Generate device fingerprint based on available information
  generateFingerprint(): string {
    if (typeof window === 'undefined') {
      return 'server-side';
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.platform,
      navigator.cookieEnabled,
    ].join('|');

    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  // Track device login
  async trackDeviceLogin(userId: string, userEmail: string, request?: Request): Promise<void> {
    try {
      const ipAddress = await this.getClientIP(request);
      const userAgent = typeof window !== 'undefined' 
        ? navigator.userAgent 
        : request?.headers.get('user-agent') || 'unknown';
      const fingerprint = this.generateFingerprint();
      const now = new Date().toISOString();

      // Check if this device already exists for this user
      const existingDevices = await databases.listDocuments(
        this.DATABASE_ID,
        this.DEVICE_TRACKING_COLLECTION,
        [
          Query.equal('userId', userId),
          Query.equal('ipAddress', ipAddress),
          Query.limit(1)
        ]
      );

      if (existingDevices.documents.length > 0) {
        // Update existing device record
        const device = existingDevices.documents[0];
        await databases.updateDocument(
          this.DATABASE_ID,
          this.DEVICE_TRACKING_COLLECTION,
          device.$id,
          {
            lastSeen: now,
            loginCount: (device.loginCount || 0) + 1,
            userAgent: userAgent,
            fingerprint: fingerprint
          }
        );
      } else {
        // Create new device record
        await databases.createDocument(
          this.DATABASE_ID,
          this.DEVICE_TRACKING_COLLECTION,
          ID.unique(),
          {
            userId,
            userEmail,
            ipAddress,
            userAgent,
            fingerprint,
            firstSeen: now,
            lastSeen: now,
            loginCount: 1,
            isSuspicious: false
          }
        );
      }

      // Check for suspicious activity
      await this.checkSuspiciousActivity(userId, ipAddress);
    } catch (error) {
      console.error('Error tracking device login:', error);
      // Don't throw error to avoid breaking login flow
    }
  }

  // Check for suspicious activity patterns
  private async checkSuspiciousActivity(userId: string, ipAddress: string): Promise<void> {
    try {
      // Check multiple accounts from same IP in short time
      const recentLogins = await databases.listDocuments(
        this.DATABASE_ID,
        this.DEVICE_TRACKING_COLLECTION,
        [
          Query.equal('ipAddress', ipAddress),
          Query.greaterThan('lastSeen', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
          Query.limit(10)
        ]
      );

      const uniqueUsers = new Set(recentLogins.documents.map(doc => doc.userId));
      
      if (uniqueUsers.size > 5) {
        // Mark as suspicious - too many different users from same IP
        await this.markAsSuspicious(ipAddress, 'Multiple users from same IP');
      }

      // Check for rapid login attempts from same user
      const userLogins = await databases.listDocuments(
        this.DATABASE_ID,
        this.DEVICE_TRACKING_COLLECTION,
        [
          Query.equal('userId', userId),
          Query.greaterThan('lastSeen', new Date(Date.now() - 60 * 60 * 1000).toISOString()),
          Query.limit(20)
        ]
      );

      if (userLogins.documents.length > 10) {
        await this.markAsSuspicious(ipAddress, 'Rapid login attempts');
      }
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
    }
  }

  // Mark device as suspicious
  private async markAsSuspicious(ipAddress: string, reason: string): Promise<void> {
    try {
      const devices = await databases.listDocuments(
        this.DATABASE_ID,
        this.DEVICE_TRACKING_COLLECTION,
        [Query.equal('ipAddress', ipAddress)]
      );

      for (const device of devices.documents) {
        await databases.updateDocument(
          this.DATABASE_ID,
          this.DEVICE_TRACKING_COLLECTION,
          device.$id,
          {
            isSuspicious: true,
            suspiciousReason: reason,
            flaggedAt: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error('Error marking device as suspicious:', error);
    }
  }

  // Check if IP is banned
  async isIPBanned(ipAddress: string): Promise<boolean> {
    try {
      const bannedDevices = await databases.listDocuments(
        this.DATABASE_ID,
        this.BANNED_DEVICES_COLLECTION,
        [
          Query.equal('ipAddress', ipAddress),
          Query.equal('isActive', true),
          Query.limit(1)
        ]
      );

      return bannedDevices.documents.length > 0;
    } catch (error) {
      console.error('Error checking if IP is banned:', error);
      return false;
    }
  }

  // Ban device by IP
  async banDevice(ipAddress: string, reason: string, bannedBy: string): Promise<void> {
    try {
      // Validate inputs
      if (!ipAddress || !reason || !bannedBy) {
        throw new Error('Missing required fields: ipAddress, reason, or bannedBy');
      }

      // Check if device is already banned
      const existingBan = await databases.listDocuments(
        this.DATABASE_ID,
        this.BANNED_DEVICES_COLLECTION,
        [
          Query.equal('ipAddress', ipAddress),
          Query.equal('isActive', true),
          Query.limit(1)
        ]
      );

      if (existingBan.documents.length > 0) {
        throw new Error(`Device with IP ${ipAddress} is already banned`);
      }

      // Create ban record with required fields only
      const banData = {
        ipAddress: String(ipAddress),
        reason: String(reason),
        bannedBy: String(bannedBy),
        bannedAt: new Date().toISOString(),
        isActive: true
      };

      console.log('Creating ban document with data:', banData);
      
      const result = await databases.createDocument(
        this.DATABASE_ID,
        this.BANNED_DEVICES_COLLECTION,
        ID.unique(),
        banData
      );

      console.log('Device banned successfully:', result.$id);
    } catch (error: any) {
      console.error('Error banning device:', {
        error: error.message,
        code: error.code,
        type: error.type,
        ipAddress,
        reason,
        bannedBy
      });
      
      // Provide more specific error messages
      if (error.message?.includes('already banned')) {
        throw new Error(error.message);
      } else if (error.code === 404) {
        throw new Error('Database or collection not found. Please check configuration.');
      } else if (error.code === 401) {
        throw new Error('Unauthorized access. Please check API keys.');
      } else if (error.code === 400) {
        throw new Error(`Invalid data provided: ${error.message}`);
      } else {
        throw new Error(`Failed to ban device: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Unban device
  async unbanDevice(banId: string): Promise<void> {
    try {
      if (!banId) {
        throw new Error('Ban ID is required');
      }

      console.log('Unbanning device with ID:', banId);
      
      const result = await databases.updateDocument(
        this.DATABASE_ID,
        this.BANNED_DEVICES_COLLECTION,
        banId,
        {
          isActive: false,
          unbannedAt: new Date().toISOString()
        }
      );

      console.log('Device unbanned successfully:', result.$id);
    } catch (error: any) {
      console.error('Error unbanning device:', {
        error: error.message,
        code: error.code,
        type: error.type,
        banId
      });
      
      // Provide more specific error messages
      if (error.code === 404) {
        throw new Error('Ban record not found or database/collection not found.');
      } else if (error.code === 401) {
        throw new Error('Unauthorized access. Please check API keys.');
      } else if (error.code === 400) {
        throw new Error(`Invalid ban ID or data: ${error.message}`);
      } else {
        throw new Error(`Failed to unban device: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Get all tracked devices
  async getAllDevices(limit: number = 100): Promise<DeviceInfo[]> {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.DEVICE_TRACKING_COLLECTION,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );
      return response.documents as unknown as DeviceInfo[];
    } catch (error) {
      console.error('Error getting devices:', error);
      return [];
    }
  }

  // Get banned devices
  async getBannedDevices(limit: number = 100): Promise<BannedDevice[]> {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.BANNED_DEVICES_COLLECTION,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );
      return response.documents as unknown as BannedDevice[];
    } catch (error) {
      console.error('Error getting banned devices:', error);
      return [];
    }
  }

  // Get devices for specific user
  async getUserDevices(userId: string): Promise<DeviceInfo[]> {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.DEVICE_TRACKING_COLLECTION,
        [
          Query.equal('userId', userId),
          Query.orderDesc('lastSeen')
        ]
      );
      return response.documents as unknown as DeviceInfo[];
    } catch (error) {
      console.error('Error getting user devices:', error);
      return [];
    }
  }

  // Get suspicious devices
  async getSuspiciousDevices(): Promise<DeviceInfo[]> {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.DEVICE_TRACKING_COLLECTION,
        [
          Query.equal('isSuspicious', true),
          Query.orderDesc('$updatedAt')
        ]
      );
      return response.documents as unknown as DeviceInfo[];
    } catch (error) {
      console.error('Error getting suspicious devices:', error);
      return [];
    }
  }
}

export const deviceTrackingService = new DeviceTrackingService();

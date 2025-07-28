// Share Types for Custom Sharing Feature

export interface ShareRecord {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  shareId: string; // Unique identifier for the share
  resourceType: 'note' | 'pdf' | 'link' | 'custom'; // Type of resource being shared
  resourceId: string; // ID of the resource (note ID, etc.)
  resourceTitle: string; // Title of the shared resource
  resourceUrl: string; // URL to the resource
  sharerId: string; // User ID of the person sharing
  sharerName: string; // Name of the person sharing
  sharerEmail?: string; // Optional email of sharer
  platform: SharePlatform; // Platform where it was shared
  shareMessage: string; // Actual message that was shared
  customData?: Record<string, any>; // Additional metadata
  isPublic: boolean; // Whether the share is public or private
  expiresAt?: string; // Optional expiration date
  accessCount: number; // Number of times accessed
  lastAccessedAt?: string; // Last time someone accessed this share
  tags?: string[]; // Optional tags for categorization
  status: 'active' | 'expired' | 'disabled'; // Share status
}

export type SharePlatform = 
  | 'whatsapp' 
  | 'telegram' 
  | 'twitter' 
  | 'facebook' 
  | 'email' 
  | 'sms' 
  | 'linkedin' 
  | 'discord' 
  | 'native' 
  | 'copy' 
  | 'qr' 
  | 'custom';

export interface ShareTemplate {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string; // Template name (e.g., "Default Note Share", "PDF Share")
  description?: string;
  template: string; // Message template with placeholders
  platforms: SharePlatform[]; // Platforms this template applies to
  resourceTypes: ('note' | 'pdf' | 'link' | 'custom')[]; // Resource types this template supports
  isActive: boolean;
  isDefault: boolean; // Whether this is the default template
  createdBy: string; // User ID who created this template
  variables: ShareVariable[]; // Available variables for this template
}

export interface ShareVariable {
  key: string; // Variable key (e.g., 'title', 'subject')
  label: string; // Human-readable label
  description?: string; // Description of what this variable represents
  required: boolean; // Whether this variable is required
  defaultValue?: string; // Default value if not provided
}

export interface ShareAnalytics {
  $id: string;
  $createdAt: string;
  shareId: string; // Reference to ShareRecord
  platform: SharePlatform;
  action: 'viewed' | 'clicked' | 'downloaded' | 'copied'; // Action taken
  userAgent?: string; // Browser/device info
  ipAddress?: string; // IP address (hashed for privacy)
  referrer?: string; // Where the user came from
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  metadata?: Record<string, any>; // Additional tracking data
}

export interface ShareSettings {
  $id: string;
  $updatedAt: string;
  enabledPlatforms: SharePlatform[]; // Which platforms are enabled
  defaultTemplate: string; // Default template ID
  requireAuth: boolean; // Whether sharing requires authentication
  allowCustomMessages: boolean; // Whether users can customize share messages
  trackAnalytics: boolean; // Whether to track share analytics
  maxSharesPerUser: number; // Max shares per user per day
  shareExpiration: number; // Default expiration in hours (0 = no expiration)
  allowQRGeneration: boolean; // Whether to allow QR code generation
  customDomainUrl?: string; // Custom domain for share links
  brandingEnabled: boolean; // Whether to include branding in shares
  autoDeleteExpired: boolean; // Whether to auto-delete expired shares
}

export interface CreateShareRequest {
  resourceType: 'note' | 'pdf' | 'link' | 'custom';
  resourceId: string;
  resourceTitle: string;
  resourceUrl: string;
  platform: SharePlatform;
  customMessage?: string;
  isPublic?: boolean;
  expiresAt?: string;
  tags?: string[];
  customData?: Record<string, any>;
}

export interface ShareResponse {
  shareId: string;
  shareUrl: string;
  qrCodeUrl?: string;
  message: string;
  expiresAt?: string;
}

export interface ShareStats {
  totalShares: number;
  sharesByPlatform: Record<SharePlatform, number>;
  sharesByResourceType: Record<string, number>;
  topSharedResources: Array<{
    resourceId: string;
    resourceTitle: string;
    shareCount: number;
  }>;
  recentShares: ShareRecord[];
  analyticsData: {
    views: number;
    clicks: number;
    downloads: number;
    uniqueUsers: number;
  };
}

// Custom hooks types
export interface UseShareReturn {
  shares: ShareRecord[];
  loading: boolean;
  error: string | null;
  createShare: (request: CreateShareRequest) => Promise<ShareResponse>;
  getShare: (shareId: string) => Promise<ShareRecord | null>;
  updateShare: (shareId: string, updates: Partial<ShareRecord>) => Promise<void>;
  deleteShare: (shareId: string) => Promise<void>;
  getShareStats: () => Promise<ShareStats>;
  refreshShares: () => Promise<void>;
}

export interface UseShareTemplatesReturn {
  templates: ShareTemplate[];
  loading: boolean;
  error: string | null;
  createTemplate: (template: Omit<ShareTemplate, '$id' | '$createdAt' | '$updatedAt'>) => Promise<void>;
  updateTemplate: (templateId: string, updates: Partial<ShareTemplate>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  getActiveTemplate: (platform: SharePlatform, resourceType: string) => ShareTemplate | null;
  refreshTemplates: () => Promise<void>;
}

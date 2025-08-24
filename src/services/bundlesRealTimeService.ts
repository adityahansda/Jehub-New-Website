import { Client, RealtimeResponseEvent } from 'appwrite';
import { Bundle } from './bundlesService';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BUNDLES_COLLECTION_ID!;

export type BundleEvent = 'create' | 'update' | 'delete';

export interface BundleRealtimeEvent {
  event: BundleEvent;
  bundle?: Bundle;
  bundleId?: string;
}

export type BundleSubscriptionCallback = (event: BundleRealtimeEvent) => void;

class BundlesRealTimeService {
  private subscriptions = new Map<string, () => void>();

  // Subscribe to bundle changes
  subscribeToBundles(
    callback: BundleSubscriptionCallback,
    filters?: {
      events?: BundleEvent[];
      bundleIds?: string[];
    }
  ): string {
    const subscriptionId = `bundle_${Date.now()}_${Math.random()}`;
    
    try {
      const channels = [`databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`];
      
      const unsubscribe = client.subscribe(channels, (response: RealtimeResponseEvent<Bundle>) => {
        const { events, payload } = response;
        
        // Parse the event type
        let eventType: BundleEvent | null = null;
        
        for (const event of events) {
          if (event.includes('.create')) {
            eventType = 'create';
            break;
          } else if (event.includes('.update')) {
            eventType = 'update';
            break;
          } else if (event.includes('.delete')) {
            eventType = 'delete';
            break;
          }
        }
        
        if (!eventType) return;
        
        // Apply filters
        if (filters?.events && !filters.events.includes(eventType)) {
          return;
        }
        
        if (filters?.bundleIds && payload.$id && !filters.bundleIds.includes(payload.$id)) {
          return;
        }
        
        // Create event object
        const bundleEvent: BundleRealtimeEvent = {
          event: eventType,
          ...(eventType === 'delete' 
            ? { bundleId: payload.$id } 
            : { bundle: payload as Bundle }
          )
        };
        
        callback(bundleEvent);
      });
      
      this.subscriptions.set(subscriptionId, unsubscribe);
      
      console.log(`🔄 Subscribed to bundle changes with ID: ${subscriptionId}`);
      return subscriptionId;
      
    } catch (error) {
      console.error('Error subscribing to bundle changes:', error);
      throw error;
    }
  }

  // Subscribe to specific bundle
  subscribeToBundle(
    bundleId: string,
    callback: BundleSubscriptionCallback
  ): string {
    const subscriptionId = `bundle_${bundleId}_${Date.now()}`;
    
    try {
      const channels = [`databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents.${bundleId}`];
      
      const unsubscribe = client.subscribe(channels, (response: RealtimeResponseEvent<Bundle>) => {
        const { events, payload } = response;
        
        // Parse the event type
        let eventType: BundleEvent | null = null;
        
        for (const event of events) {
          if (event.includes('.update')) {
            eventType = 'update';
            break;
          } else if (event.includes('.delete')) {
            eventType = 'delete';
            break;
          }
        }
        
        if (!eventType) return;
        
        // Create event object
        const bundleEvent: BundleRealtimeEvent = {
          event: eventType,
          ...(eventType === 'delete' 
            ? { bundleId: payload.$id } 
            : { bundle: payload as Bundle }
          )
        };
        
        callback(bundleEvent);
      });
      
      this.subscriptions.set(subscriptionId, unsubscribe);
      
      console.log(`🔄 Subscribed to bundle ${bundleId} changes`);
      return subscriptionId;
      
    } catch (error) {
      console.error(`Error subscribing to bundle ${bundleId} changes:`, error);
      throw error;
    }
  }

  // Subscribe to bundle creation events only
  subscribeToBundleCreations(callback: BundleSubscriptionCallback): string {
    return this.subscribeToBundles(callback, { events: ['create'] });
  }

  // Subscribe to bundle update events only
  subscribeToBundleUpdates(callback: BundleSubscriptionCallback): string {
    return this.subscribeToBundles(callback, { events: ['update'] });
  }

  // Subscribe to bundle deletion events only
  subscribeToBundleDeletions(callback: BundleSubscriptionCallback): string {
    return this.subscribeToBundles(callback, { events: ['delete'] });
  }

  // Unsubscribe from bundle changes
  unsubscribe(subscriptionId: string): boolean {
    const unsubscribeFunction = this.subscriptions.get(subscriptionId);
    
    if (unsubscribeFunction) {
      try {
        unsubscribeFunction();
        this.subscriptions.delete(subscriptionId);
        console.log(`🔄 Unsubscribed from bundle changes: ${subscriptionId}`);
        return true;
      } catch (error) {
        console.error('Error unsubscribing from bundle changes:', error);
        return false;
      }
    }
    
    return false;
  }

  // Unsubscribe from all bundle subscriptions
  unsubscribeAll(): void {
    for (const [subscriptionId, unsubscribeFunction] of this.subscriptions) {
      try {
        unsubscribeFunction();
        console.log(`🔄 Unsubscribed from bundle changes: ${subscriptionId}`);
      } catch (error) {
        console.error(`Error unsubscribing from ${subscriptionId}:`, error);
      }
    }
    
    this.subscriptions.clear();
    console.log('🔄 Unsubscribed from all bundle subscriptions');
  }

  // Get active subscription count
  getActiveSubscriptionsCount(): number {
    return this.subscriptions.size;
  }

  // Get active subscription IDs
  getActiveSubscriptionIds(): string[] {
    return Array.from(this.subscriptions.keys());
  }
}

export const bundlesRealTimeService = new BundlesRealTimeService();
export default bundlesRealTimeService;

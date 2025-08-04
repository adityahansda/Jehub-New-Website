import { databases } from '../lib/appwrite';
import { appwriteConfig } from '../lib/appwriteConfig';
import { ID, Query } from 'appwrite';

export interface PushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  isActive: boolean;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: any;
}

class PushNotificationService {
  private vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  private subscriptionsCollection = 'push_subscriptions';

  // Check if browser supports notifications and service workers
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Request notification permission from user
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  // Register service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Subscribe user to push notifications
  async subscribeUser(userId: string): Promise<PushSubscription> {
    try {
      const registration = await this.registerServiceWorker();
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlB64ToUint8Array(this.vapidPublicKey)
        });
      }

      // Save subscription to database
      const subscriptionData: Partial<PushSubscription> = {
        userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        },
        userAgent: navigator.userAgent,
        isActive: true
      };

      await this.saveSubscription(subscriptionData);
      
      console.log('User subscribed to push notifications:', subscription);
      return subscriptionData as PushSubscription;
    } catch (error) {
      console.error('Failed to subscribe user:', error);
      throw error;
    }
  }

  // Unsubscribe user from push notifications
  async unsubscribeUser(userId: string): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('User unsubscribed from push notifications');
      }

      // Deactivate subscription in database
      await this.deactivateSubscription(userId);
    } catch (error) {
      console.error('Failed to unsubscribe user:', error);
      throw error;
    }
  }

  // Save subscription to database
  private async saveSubscription(subscription: Partial<PushSubscription>): Promise<void> {
    try {
      // Check if subscription already exists for this user
      const existingSubscriptions = await databases.listDocuments(
        appwriteConfig.databaseId,
        this.subscriptionsCollection,
        [
          Query.equal('userId', subscription.userId!),
          Query.equal('isActive', true)
        ]
      );

      if (existingSubscriptions.documents.length > 0) {
        // Update existing subscription
        await databases.updateDocument(
          appwriteConfig.databaseId,
          this.subscriptionsCollection,
          existingSubscriptions.documents[0].$id,
          {
            ...subscription,
            updatedAt: new Date().toISOString()
          }
        );
      } else {
        // Create new subscription
        await databases.createDocument(
          appwriteConfig.databaseId,
          this.subscriptionsCollection,
          ID.unique(),
          {
            ...subscription,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error('Failed to save subscription:', error);
      throw error;
    }
  }

  // Deactivate subscription in database
  private async deactivateSubscription(userId: string): Promise<void> {
    try {
      const subscriptions = await databases.listDocuments(
        appwriteConfig.databaseId,
        this.subscriptionsCollection,
        [Query.equal('userId', userId)]
      );

      for (const subscription of subscriptions.documents) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          this.subscriptionsCollection,
          subscription.$id,
          {
            isActive: false,
            updatedAt: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error('Failed to deactivate subscription:', error);
      throw error;
    }
  }

  // Show local notification (fallback for when service worker is not available)
  showLocalNotification(payload: NotificationPayload): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        tag: payload.tag || 'jehub-notification',
        requireInteraction: payload.requireInteraction || false,
        data: payload.data
      });

      notification.onclick = () => {
        window.focus();
        if (payload.url) {
          window.location.href = payload.url;
        }
        notification.close();
      };

      // Auto close after 5 seconds if not requiring interaction
      if (!payload.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    }
  }

  // Send notification for new note upload
  async notifyNewNoteUpload(noteData: {
    title: string;
    subject: string;
    branch: string;
    semester: string;
    authorName: string;
    noteId: string;
  }): Promise<void> {
    const payload: NotificationPayload = {
      title: `📚 New ${noteData.subject} Notes Available!`,
      body: `${noteData.authorName} uploaded "${noteData.title}" for ${noteData.branch} - ${noteData.semester} semester`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      url: `/notes/preview/${noteData.noteId}`,
      tag: `new-note-${noteData.noteId}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Note',
          icon: '/icons/view-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss-icon.png'
        }
      ],
      data: {
        type: 'new-note',
        noteId: noteData.noteId,
        url: `/notes/preview/${noteData.noteId}`,
        timestamp: Date.now()
      }
    };

    // Show local notification as immediate feedback
    this.showLocalNotification(payload);
    
    // Send push notification to all subscribed users (this would be handled by server)
    console.log('New note notification payload:', payload);
  }

  // Send notification for note request fulfillment
  async notifyNoteRequestFulfilled(requestData: {
    subject: string;
    semester: string;
    noteTitle: string;
    noteId: string;
  }): Promise<void> {
    const payload: NotificationPayload = {
      title: `✅ Your Note Request Fulfilled!`,
      body: `Someone uploaded "${requestData.noteTitle}" for ${requestData.subject} - ${requestData.semester}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      url: `/notes/preview/${requestData.noteId}`,
      tag: `request-fulfilled-${requestData.noteId}`,
      requireInteraction: true,
      actions: [
        {
          action: 'download',
          title: 'Download Now',
          icon: '/icons/download-icon.png'
        },
        {
          action: 'later',
          title: 'View Later',
          icon: '/icons/later-icon.png'
        }
      ],
      data: {
        type: 'request-fulfilled',
        noteId: requestData.noteId,
        url: `/notes/preview/${requestData.noteId}`,
        timestamp: Date.now()
      }
    };

    this.showLocalNotification(payload);
    console.log('Request fulfilled notification payload:', payload);
  }

  // Convert VAPID key to Uint8Array
  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Check if user is subscribed
  async isUserSubscribed(userId: string): Promise<boolean> {
    try {
      const subscriptions = await databases.listDocuments(
        appwriteConfig.databaseId,
        this.subscriptionsCollection,
        [
          Query.equal('userId', userId),
          Query.equal('isActive', true)
        ]
      );

      return subscriptions.documents.length > 0;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();

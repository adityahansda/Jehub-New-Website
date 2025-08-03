import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { databases } from '../../src/lib/appwrite';
import { appwriteConfig } from '../../src/lib/appwriteConfig';
import { messagingService } from '../../src/services/messagingService';
import { Query } from 'appwrite';

interface SubscriptionData {
  email: string;
  timestamp: string;
  source: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source = 'website' } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  try {
    const timestamp = new Date().toISOString();
    
    // Store subscription data in both JSON file and Appwrite database
    await Promise.all([
      storeSubscription({ email, timestamp, source }),
      storeSubscriptionInAppwrite({ email, timestamp, source })
    ]);
    console.log(`Subscription stored for: ${email}`);

    // Try to send emails using Appwrite messaging
    try {
      await messagingService.sendWelcomeEmail(email);
      console.log(`Welcome email sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue anyway - subscription is still valid
    }

    try {
      await sendNotificationToTeam(email);
      console.log(`Team notification sent for: ${email}`);
    } catch (emailError) {
      console.error('Failed to send team notification:', emailError);
      // Continue anyway - subscription is still valid
    }

    res.status(200).json({ 
      message: 'Subscription successful!',
      email: email
    });

  } catch (error) {
    console.error('Subscription error:', error);
    
    // Check if it's a duplicate email error
    if (error instanceof Error && error.message === 'Email already subscribed') {
      return res.status(400).json({ error: 'This email is already subscribed to our newsletter.' });
    }
    
    res.status(500).json({ error: 'Failed to process subscription. Please try again later.' });
  }
}

async function storeSubscription(data: SubscriptionData) {
  try {
    const subscriptionsDir = path.join(process.cwd(), 'data', 'subscriptions');
    const subscriptionsFile = path.join(subscriptionsDir, 'subscribers.json');

    // Ensure directory exists
    try {
      await fs.mkdir(subscriptionsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    let subscriptions: SubscriptionData[] = [];

    // Read existing subscriptions
    try {
      const fileContent = await fs.readFile(subscriptionsFile, 'utf-8');
      subscriptions = JSON.parse(fileContent);
    } catch (error) {
      // File might not exist yet
      subscriptions = [];
    }

    // Check if email already exists
    const existingSubscription = subscriptions.find(sub => sub.email === data.email);
    if (existingSubscription) {
      throw new Error('Email already subscribed');
    }

    // Add new subscription
    subscriptions.push(data);

    // Write back to file
    await fs.writeFile(subscriptionsFile, JSON.stringify(subscriptions, null, 2));

  } catch (error) {
    console.error('Error storing subscription:', error);
    throw error;
  }
}

// Team notification function (simplified)
async function sendNotificationToTeam(subscriberEmail: string) {
  try {
    console.log(`Team notification: New subscription from ${subscriberEmail}`);
    // TODO: Implement team notification via Appwrite messaging if needed
    // For now, just log the notification
  } catch (error) {
    console.error('Error sending team notification:', error);
  }
}

async function storeSubscriptionInAppwrite(data: SubscriptionData) {
  try {
    const { databaseId, collections } = appwriteConfig;
    
    // Check if subscriber already exists in Appwrite
    const existingDocs = await databases.listDocuments(
      databaseId,
      collections.users,
      [Query.equal('email', data.email)]
    );

    if (existingDocs.documents.length > 0) {
      console.log(`Subscriber already exists in Appwrite: ${data.email}`);
      return existingDocs.documents[0];
    }

    // Create new subscriber document in Appwrite
    const response = await databases.createDocument(
      databaseId,
      collections.users,
      'unique()', // Auto-generate document ID
      {
        email: data.email,
        subscriptionTimestamp: data.timestamp,
        subscriptionSource: data.source || 'newsletter',
        isSubscribed: true,
        subscribedAt: new Date(data.timestamp).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add default fields for the users collection
        name: '', // Empty name initially
        profileComplete: false,
        role: 'user'
      }
    );

    console.log(`Subscriber stored in Appwrite: ${data.email} (ID: ${response.$id})`);
    return response;

  } catch (error: any) {
    console.error('Error storing subscription in Appwrite:', error.message);
    // Don't throw error - we still want the JSON storage to work
    // This ensures backward compatibility
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import path from 'path';

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
    // Store subscription data first
    await storeSubscription({ email, timestamp: new Date().toISOString(), source });
    console.log(`Subscription stored for: ${email}`);

    // Try to send emails, but don't fail if email service is down
    try {
      await sendWelcomeEmail(email);
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

async function sendWelcomeEmail(subscriberEmail: string) {
  // Check if email credentials are available
  if (!process.env.SMTP_PASSWORD || process.env.SMTP_PASSWORD === 'placeholder_password_replace_with_actual') {
    console.log('Email credentials not configured, skipping welcome email');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER || 'jharkhandengineershub@gmail.com',
      pass: process.env.SMTP_PASSWORD
    }
  });

  const welcomeEmailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to JEHUB Community!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to JEHUB! 🎉</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Jharkhand Engineer's Hub</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #667eea; margin-top: 0;">Thank you for subscribing!</h2>
            
            <p>Dear Engineering Student,</p>
            
            <p>Welcome to the <strong>Jharkhand Engineer's Hub (JEHUB)</strong> community! We're excited to have you on board as we build the future of student collaboration and learning.</p>
            
            <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #667eea; margin-top: 0;">What to expect:</h3>
                <ul style="padding-left: 20px;">
                    <li>📚 <strong>Quality Study Materials</strong> - Access to notes, question papers, and resources</li>
                    <li>🤝 <strong>Student Community</strong> - Connect with fellow engineering students</li>
                    <li>🚀 <strong>Launch Updates</strong> - Be the first to know when we go live</li>
                    <li>💡 <strong>Exclusive Content</strong> - Early access to features and tools</li>
                    <li>🎯 <strong>Career Opportunities</strong> - Internships, jobs, and skill development</li>
                </ul>
            </div>
            
            <p>We're working hard to create an amazing platform that will revolutionize how engineering students in Jharkhand (and beyond) collaborate, learn, and grow together.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://t.me/JharkhandEnginnersHub" style="background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">📱 Join Telegram</a>
                <a href="https://chat.whatsapp.com/CzByx8sK4DYGW0cqqn85rU" style="background: #25D366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">💬 Join WhatsApp</a>
            </div>
            
            <p>Stay tuned for more updates!</p>
            
            <p>Best regards,<br>
            <strong>The JEHUB Team</strong><br>
            Jharkhand Engineer's Hub</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
            <p style="margin: 0;">
                📧 jharkhandengineershub@gmail.com | 
                🌐 <a href="https://jehub.vercel.app" style="color: #667eea;">jehub.vercel.app</a>
            </p>
            <p style="margin: 5px 0 0;">
                You received this email because you subscribed to JEHUB updates. 
                <a href="#" style="color: #667eea;">Unsubscribe</a>
            </p>
        </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: {
      name: 'JEHUB - Jharkhand Engineer\'s Hub',
      address: process.env.SMTP_USER || 'jharkhandengineershub@gmail.com'
    },
    to: subscriberEmail,
    subject: '🎉 Welcome to JEHUB Community - Subscription Confirmed!',
    html: welcomeEmailHTML
  };

  await transporter.sendMail(mailOptions);
}

async function sendNotificationToTeam(subscriberEmail: string) {
  // Check if email credentials are available
  if (!process.env.SMTP_PASSWORD || process.env.SMTP_PASSWORD === 'placeholder_password_replace_with_actual') {
    console.log('Email credentials not configured, skipping team notification');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER || 'jharkhandengineershub@gmail.com',
      pass: process.env.SMTP_PASSWORD
    }
  });

  const teamNotificationHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #667eea;">New JEHUB Subscription! 🎉</h2>
      <p><strong>Email:</strong> ${subscriberEmail}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Source:</strong> Website Subscription Form</p>
      <hr>
      <p style="color: #666; font-size: 12px;">This is an automated notification from JEHUB subscription system.</p>
    </div>
  `;

  const teamMailOptions = {
    from: {
      name: 'JEHUB Subscription System',
      address: process.env.SMTP_USER || 'jharkhandengineershub@gmail.com'
    },
    to: 'jharkhandengineershub@gmail.com',
    subject: `New Subscription: ${subscriberEmail}`,
    html: teamNotificationHTML
  };

  await transporter.sendMail(teamMailOptions);
}

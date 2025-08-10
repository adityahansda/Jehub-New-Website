import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
  errorCode?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmailResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { to, subject, html, replyTo }: EmailRequest = req.body;

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: to, subject, html' 
      });
    }



    // Create transporter using SMTP configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'jharkhandengineershub@gmail.com',
        pass: 'fgtjkhcourqksqzs'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify SMTP connection
    console.log('Verifying SMTP connection...');
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.warn('SMTP verification failed, but continuing with email send:', verifyError);
    }

    // Email options
    const mailOptions = {
      from: `"JEHUB Contact Form" <jharkhandengineershub@gmail.com>`,
      to: to,
      subject: subject,
      html: html,
      replyTo: replyTo || 'jharkhandengineershub@gmail.com'
    };

    console.log('Attempting to send email...');
    console.log('Mail options:', { to: mailOptions.to, subject: mailOptions.subject, from: mailOptions.from });
    
    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);
    console.log('Response:', info.response);

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (error: any) {
    console.error('Email sending error:', error);
    
    // More detailed error response
    const errorMessage = error.message || 'Unknown error occurred';
    console.error('Full error details:', {
      message: errorMessage,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
      stack: error.stack
    });
    
    // Check for specific Gmail errors
    if (error.code === 'EAUTH') {
      console.error('Authentication failed - check Gmail app password');
      console.error('Make sure 2FA is enabled and app password is correct');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection failed - check network and Gmail settings');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timeout - Gmail may be blocking the connection');
    } else if (error.code === 'EAUTH') {
      console.error('Authentication failed - Gmail may have revoked the app password');
    }
    
    res.status(500).json({ 
      success: false, 
      message: `Email sending failed: ${errorMessage}`,
      errorCode: error.code
    });
  }
}

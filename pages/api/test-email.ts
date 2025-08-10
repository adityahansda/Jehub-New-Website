import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('Testing email service...');
    
    // Create transporter
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

    // Test connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Send test email
    const info = await transporter.sendMail({
      from: '"JEHUB Test" <jharkhandengineershub@gmail.com>',
      to: 'jharkhandengineershub@gmail.com',
      subject: 'Test Email from JEHUB',
      html: '<h1>Test Email</h1><p>This is a test email to verify the SMTP configuration.</p>'
    });

    console.log('Test email sent successfully:', info.messageId);

    res.status(200).json({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: info.messageId
    });

  } catch (error: any) {
    console.error('Test email error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: `Test failed: ${error.message}`,
      error: {
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
        response: error.response
      }
    });
  }
}

// Email Service using SMTP configuration
export interface EmailData {
  name: string;
  email: string;
  college?: string;
  message: string;
}

class EmailService {
  private async sendEmailViaAPI(emailData: EmailData): Promise<boolean> {
    try {
      // Use your existing API endpoint for sending emails
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'jharkhandengineershub@gmail.com',
          subject: `New Contact Form Message from ${emailData.name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${emailData.name}</p>
            <p><strong>Email:</strong> ${emailData.email}</p>
            <p><strong>College:</strong> ${emailData.college || 'Not specified'}</p>
            <p><strong>Message:</strong></p>
            <p>${emailData.message}</p>
            <hr>
            <p><em>This message was sent from the JEHUB website contact form.</em></p>
          `,
          replyTo: emailData.email
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  async sendContactFormEmail(emailData: EmailData): Promise<{ success: boolean; message: string }> {
    try {
      const success = await this.sendEmailViaAPI(emailData);
      
      if (success) {
        return {
          success: true,
          message: 'Message sent successfully! We\'ll get back to you soon.'
        };
      } else {
        return {
          success: false,
          message: 'Failed to send message. Please try again or contact us directly.'
        };
      }
    } catch (error) {
      console.error('Contact form email error:', error);
      return {
        success: false,
        message: 'An error occurred while sending your message. Please try again.'
      };
    }
  }
}

export const emailService = new EmailService();

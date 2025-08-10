// EmailJS Configuration
// You need to sign up at https://www.emailjs.com/ and get these credentials

// Direct Configuration with Gmail SMTP credentials
export const EMAILJS_CONFIG = {
  USER_ID: process.env.NEXT_PUBLIC_EMAILJS_USER_ID || 'jharkhandengineershub@gmail.com',
  SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'gmail',
  TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_jehub'
};

// Gmail SMTP Configuration
export const SMTP_CONFIG = {
  USER: 'jharkhandengineershub@gmail.com',
  PASSWORD: 'fgtjkhcourqksqzs'
};

// Instructions to set up EmailJS:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Create an Email Service (Gmail, Outlook, etc.)
// 3. Create an Email Template with variables: {{from_name}}, {{from_email}}, {{college}}, {{message}}
// 4. Get your User ID, Service ID, and Template ID
// 5. Option A: Add them to your .env.local file:
//    NEXT_PUBLIC_EMAILJS_USER_ID=your_user_id
//    NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
//    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
// 5. Option B: Replace the values directly in the commented section above

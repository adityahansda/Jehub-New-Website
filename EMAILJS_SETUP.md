# EmailJS Setup Guide

## How to Set Up Real Email Functionality

The contact form in the About page now uses EmailJS to send real emails. Follow these steps to configure it:

### 1. Sign Up for EmailJS
- Go to [https://www.emailjs.com/](https://www.emailjs.com/)
- Create a free account
- Verify your email address

### 2. Create an Email Service
- In your EmailJS dashboard, go to "Email Services"
- Click "Add New Service"
- Choose your email provider (Gmail, Outlook, etc.)
- Connect your email account
- Note down the **Service ID**

### 3. Create an Email Template
- Go to "Email Templates"
- Click "Create New Template"
- Use this template content:

```
Subject: New Contact Form Submission from {{from_name}}

Hello JEHUB Team,

You have received a new contact form submission:

Name: {{from_name}}
Email: {{from_email}}
College: {{college}}
Message: {{message}}

You can reply directly to this email to respond to {{from_name}}.

Best regards,
JEHUB Contact Form
```

- Save the template and note down the **Template ID**

### 4. Get Your User ID
- Go to "Account" → "API Keys"
- Copy your **Public Key** (this is your User ID)

### 5. Configure Environment Variables
Create a `.env.local` file in your project root with:

```
NEXT_PUBLIC_EMAILJS_USER_ID=your_user_id_here
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
```

### 6. Test the Form
- Restart your development server
- Go to the About page
- Fill out and submit the contact form
- Check your email inbox for the message

## Features
- ✅ Real email sending (no simulation)
- ✅ Form validation
- ✅ Loading states
- ✅ Success/error messages
- ✅ Auto-reset form after submission
- ✅ Email template with all form data

## Troubleshooting
- Make sure all environment variables are set correctly
- Check that your EmailJS account is verified
- Ensure your email service is properly connected
- Check the browser console for any error messages


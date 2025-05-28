# Contact Form Setup

This document provides instructions for setting up the contact form email functionality.

## Email Configuration

To enable the contact form to send emails, you need to add the following environment variables to your `.env.local` file:

```
# Email configuration for contact form
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=website@example.com
```

### Using Gmail as SMTP Provider

If you're using Gmail as your SMTP provider, you'll need to:

1. Enable 2-Step Verification on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate a new app password for "Mail" and "Other (Custom name)"
4. Use that password as EMAIL_PASSWORD in your environment variables

### Alternative SMTP Providers

You can use other SMTP providers by adjusting the EMAIL_HOST, EMAIL_PORT, and EMAIL_SECURE values accordingly.

## Contact Form Implementation

The contact form has been implemented with the following components:

1. **UI Component**: `src/components/ui/ContactForm.tsx`
2. **API Endpoint**: `src/app/api/contact/route.ts`
3. **Email Service**: `src/lib/services/EmailService.ts`

The form is configured to send emails to `easy@nxt.ru`. If you need to change this email address, you can modify it in the `EmailService.ts` file.

## Testing the Form

To test the contact form:

1. Make sure you've set up the environment variables
2. Run the development server with `npm run dev`
3. Navigate to the homepage where the contact form is displayed
4. Fill out the form and submit it
5. Check the recipient email inbox for the form submission

## Troubleshooting

If emails are not being sent:

1. Check your server logs for any errors
2. Verify that your SMTP credentials are correct
3. Make sure your SMTP provider allows sending emails from your application
4. If using Gmail, ensure that "Less secure app access" is enabled or that you're using an app password 
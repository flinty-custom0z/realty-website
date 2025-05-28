import nodemailer from 'nodemailer';
import { createLogger } from '@/lib/logging';

// Create a logger instance for email operations
const logger = createLogger('EmailService');

interface ContactFormData {
  name: string;
  phone: string;
  message?: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  /**
   * Send contact form submission to the specified email address
   */
  static async sendContactFormEmail(data: ContactFormData): Promise<boolean> {
    try {
      const { name, phone, message } = data;
      
      // Default recipient is the one specified in the request
      const recipient = 'easy@nxt.ru';
      
      // Format the email content
      const emailContent = `
        <h2>Новая заявка с сайта</h2>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Телефон:</strong> ${phone}</p>
        ${message ? `<p><strong>Сообщение:</strong> ${message}</p>` : ''}
        <p>Дата и время: ${new Date().toLocaleString('ru-RU')}</p>
      `;
      
      logger.info(`Sending contact form email to ${recipient}`);
      
      // Send the email
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'website@example.com',
        to: recipient,
        subject: 'Новая заявка на консультацию',
        html: emailContent,
      });
      
      logger.info('Email sent successfully', { messageId: info.messageId });
      return true;
    } catch (error) {
      logger.error('Failed to send email', { error });
      return false;
    }
  }
} 
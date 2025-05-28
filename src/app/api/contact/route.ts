import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { EmailService } from '@/lib/services/EmailService';
import { handleApiError } from '@/lib/validators/errorHandler';
import { createLogger } from '@/lib/logging';

// Create a logger for the contact API
const logger = createLogger('ContactAPI');

// Define validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  phone: z.string().min(1, 'Телефон обязателен'),
  message: z.string().optional(),
});

// POST handler for contact form submissions
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate the form data
    const result = contactFormSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const data = result.data;
    
    logger.info('Contact form submission received', { name: data.name });
    
    // Send email using EmailService
    const emailSent = await EmailService.sendContactFormEmail(data);
    
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json(
      { success: true, message: 'Сообщение успешно отправлено' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
} 
import { Resend } from 'resend';

// Environment variable validation
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';

if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set');
}

// Initialize Resend client
export const resend = new Resend(RESEND_API_KEY);

// Email error types
export class EmailError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

// Email options
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  tags?: EmailTag[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailTag {
  name: string;
  value: string;
}

// Email result
export interface EmailResult {
  id: string;
  from: string;
  to: string[];
  created_at: string;
}

/**
 * Send an email using Resend
 * @param options - Email options
 * @returns Email result
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const {
      to,
      subject,
      html,
      text,
      from = FROM_EMAIL,
      replyTo,
      cc,
      bcc,
      attachments,
      tags,
    } = options;

    // Validate inputs
    if (!to || (Array.isArray(to) && to.length === 0)) {
      throw new EmailError('Recipient email address is required', 'MISSING_RECIPIENT');
    }

    if (!subject || subject.trim().length === 0) {
      throw new EmailError('Email subject is required', 'MISSING_SUBJECT');
    }

    if (!html && !text) {
      throw new EmailError('Email must have HTML or text content', 'MISSING_CONTENT');
    }

    // Send email
    const response = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      reply_to: replyTo,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      attachments: attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        content_type: att.contentType,
      })),
      tags,
    });

    if (response.error) {
      throw new EmailError(
        `Failed to send email: ${response.error.message}`,
        'SEND_FAILED'
      );
    }

    return {
      id: response.data!.id,
      from,
      to: Array.isArray(to) ? to : [to],
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof EmailError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new EmailError(
        `Email sending failed: ${error.message}`,
        'SEND_FAILED'
      );
    }

    throw new EmailError('Unknown error occurred while sending email', 'UNKNOWN_ERROR');
  }
}

/**
 * Send an email with HTML template
 * @param to - Recipient email address(es)
 * @param subject - Email subject
 * @param html - HTML content
 * @param options - Additional email options
 * @returns Email result
 */
export async function sendHTMLEmail(
  to: string | string[],
  subject: string,
  html: string,
  options?: Partial<EmailOptions>
): Promise<EmailResult> {
  return sendEmail({
    to,
    subject,
    html,
    ...options,
  });
}

/**
 * Send a plain text email
 * @param to - Recipient email address(es)
 * @param subject - Email subject
 * @param text - Plain text content
 * @param options - Additional email options
 * @returns Email result
 */
export async function sendTextEmail(
  to: string | string[],
  subject: string,
  text: string,
  options?: Partial<EmailOptions>
): Promise<EmailResult> {
  return sendEmail({
    to,
    subject,
    text,
    ...options,
  });
}

/**
 * Send a batch of emails
 * @param emails - Array of email options
 * @returns Array of email results
 */
export async function sendBatchEmails(
  emails: EmailOptions[]
): Promise<EmailResult[]> {
  try {
    const results = await Promise.all(
      emails.map((email) => sendEmail(email))
    );

    return results;
  } catch (error) {
    if (error instanceof EmailError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new EmailError(
        `Batch email sending failed: ${error.message}`,
        'BATCH_SEND_FAILED'
      );
    }

    throw new EmailError(
      'Unknown error occurred while sending batch emails',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Get email delivery status (if supported by provider)
 * @param emailId - Email ID from send result
 * @returns Email status
 */
export async function getEmailStatus(emailId: string): Promise<{
  id: string;
  status: string;
  created_at: string;
  last_event?: string;
}> {
  try {
    // Note: Resend may not provide real-time status checking in all plans
    // This is a placeholder for future implementation
    throw new EmailError('Email status checking not yet implemented', 'NOT_IMPLEMENTED');
  } catch (error) {
    if (error instanceof EmailError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new EmailError(
        `Failed to get email status: ${error.message}`,
        'STATUS_CHECK_FAILED'
      );
    }

    throw new EmailError(
      'Unknown error occurred while checking email status',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Validate an email address
 * @param email - Email address to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate multiple email addresses
 * @param emails - Array of email addresses
 * @returns Array of validation results
 */
export function validateEmails(emails: string[]): {
  email: string;
  valid: boolean;
}[] {
  return emails.map((email) => ({
    email,
    valid: isValidEmail(email),
  }));
}

// Export constants
export { FROM_EMAIL };

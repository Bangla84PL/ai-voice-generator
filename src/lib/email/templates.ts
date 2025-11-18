import { sendHTMLEmail, EmailResult } from './client';

// Template data interfaces
export interface WelcomeEmailData {
  name: string;
  email: string;
  dashboardUrl?: string;
}

export interface GenerationCompleteData {
  name: string;
  generationId: string;
  text: string;
  voice: string;
  audioUrl: string;
  downloadUrl: string;
  creditsUsed: number;
  creditsRemaining: number;
}

export interface CreditAlertData {
  name: string;
  creditsRemaining: number;
  threshold: number;
  purchaseUrl?: string;
}

export interface InvoiceEmailData {
  name: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  paidAt: string;
  invoicePdfUrl?: string;
  invoiceUrl?: string;
  items: {
    description: string;
    amount: number;
  }[];
}

export interface SubscriptionEmailData {
  name: string;
  planName: string;
  amount: number;
  currency: string;
  nextBillingDate: string;
  manageUrl?: string;
}

// Base email styles
const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .header {
    text-align: center;
    padding: 20px 0;
    border-bottom: 2px solid #4F46E5;
  }
  .header h1 {
    margin: 0;
    color: #4F46E5;
    font-size: 28px;
  }
  .content {
    padding: 30px 0;
  }
  .button {
    display: inline-block;
    padding: 12px 24px;
    background-color: #4F46E5;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    margin: 20px 0;
  }
  .button:hover {
    background-color: #4338CA;
  }
  .footer {
    text-align: center;
    padding: 20px 0;
    border-top: 1px solid #e5e5e5;
    color: #666;
    font-size: 14px;
  }
  .info-box {
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 16px;
    margin: 16px 0;
  }
  .warning-box {
    background-color: #fef3c7;
    border: 1px solid #fbbf24;
    border-radius: 6px;
    padding: 16px;
    margin: 16px 0;
  }
  .success-box {
    background-color: #d1fae5;
    border: 1px solid #10b981;
    border-radius: 6px;
    padding: 16px;
    margin: 16px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
  }
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e5e5e5;
  }
  th {
    background-color: #f9fafb;
    font-weight: 600;
  }
`;

/**
 * Generate welcome email HTML
 */
export function generateWelcomeEmail(data: WelcomeEmailData): string {
  const { name, dashboardUrl = 'https://yourdomain.com/dashboard' } = data;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AI Voice Generator</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Voice Generator</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for signing up for AI Voice Generator. We're excited to have you on board!</p>

            <div class="success-box">
              <p><strong>Your account has been created successfully.</strong></p>
              <p>You can now start generating high-quality AI voices for your content.</p>
            </div>

            <h3>Getting Started</h3>
            <ul>
              <li>Choose from multiple voice options (alloy, echo, fable, onyx, nova, shimmer)</li>
              <li>Generate speech from text in seconds</li>
              <li>Download your audio files in multiple formats</li>
              <li>Track your usage and credits in the dashboard</li>
            </ul>

            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            </div>

            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} AI Voice Generator. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate generation complete email HTML
 */
export function generateGenerationCompleteEmail(data: GenerationCompleteData): string {
  const {
    name,
    generationId,
    text,
    voice,
    audioUrl,
    downloadUrl,
    creditsUsed,
    creditsRemaining,
  } = data;

  const previewText = text.length > 100 ? text.substring(0, 100) + '...' : text;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Voice Generation is Complete</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Voice Generator</h1>
          </div>
          <div class="content">
            <h2>Your Voice Generation is Ready!</h2>
            <p>Hi ${name},</p>
            <p>Your AI voice generation has been completed successfully.</p>

            <div class="info-box">
              <h3>Generation Details</h3>
              <p><strong>Generation ID:</strong> ${generationId}</p>
              <p><strong>Voice:</strong> ${voice}</p>
              <p><strong>Text Preview:</strong> "${previewText}"</p>
            </div>

            <div class="success-box">
              <p><strong>Credits Used:</strong> ${creditsUsed}</p>
              <p><strong>Credits Remaining:</strong> ${creditsRemaining}</p>
            </div>

            <div style="text-align: center;">
              <a href="${audioUrl}" class="button">Listen Now</a>
              <a href="${downloadUrl}" class="button" style="background-color: #059669;">Download Audio</a>
            </div>

            <p>Your audio file will be available for download for the next 30 days.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} AI Voice Generator. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate credit alert email HTML
 */
export function generateCreditAlertEmail(data: CreditAlertData): string {
  const {
    name,
    creditsRemaining,
    threshold,
    purchaseUrl = 'https://yourdomain.com/credits',
  } = data;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Credit Balance Alert</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Voice Generator</h1>
          </div>
          <div class="content">
            <h2>Credit Balance Alert</h2>
            <p>Hi ${name},</p>
            <p>This is a friendly reminder that your credit balance is running low.</p>

            <div class="warning-box">
              <p><strong>Current Balance:</strong> ${creditsRemaining} credits</p>
              <p><strong>Alert Threshold:</strong> ${threshold} credits</p>
            </div>

            <p>To ensure uninterrupted service, we recommend purchasing additional credits.</p>

            <div style="text-align: center;">
              <a href="${purchaseUrl}" class="button">Purchase Credits</a>
            </div>

            <h3>Credit Packages</h3>
            <ul>
              <li>Starter Package: 100 credits - $9.99</li>
              <li>Pro Package: 500 credits - $39.99</li>
              <li>Enterprise Package: 2000 credits - $149.99</li>
            </ul>

            <p>Thank you for using AI Voice Generator!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} AI Voice Generator. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate invoice email HTML
 */
export function generateInvoiceEmail(data: InvoiceEmailData): string {
  const {
    name,
    invoiceNumber,
    amount,
    currency,
    paidAt,
    invoicePdfUrl,
    invoiceUrl,
    items,
  } = data;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  const formattedDate = new Date(paidAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${invoiceNumber}</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Voice Generator</h1>
          </div>
          <div class="content">
            <h2>Payment Receipt</h2>
            <p>Hi ${name},</p>
            <p>Thank you for your payment. Here's your invoice:</p>

            <div class="info-box">
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Date Paid:</strong> ${formattedDate}</p>
              <p><strong>Amount:</strong> ${formattedAmount}</p>
            </div>

            <h3>Invoice Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td style="text-align: right;">${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency.toUpperCase(),
                    }).format(item.amount / 100)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <th style="text-align: right;">${formattedAmount}</th>
                </tr>
              </tfoot>
            </table>

            <div style="text-align: center;">
              ${invoicePdfUrl ? `<a href="${invoicePdfUrl}" class="button">Download PDF</a>` : ''}
              ${invoiceUrl ? `<a href="${invoiceUrl}" class="button" style="background-color: #059669;">View Invoice</a>` : ''}
            </div>

            <p>If you have any questions about this invoice, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} AI Voice Generator. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate subscription confirmation email HTML
 */
export function generateSubscriptionEmail(data: SubscriptionEmailData): string {
  const {
    name,
    planName,
    amount,
    currency,
    nextBillingDate,
    manageUrl = 'https://yourdomain.com/settings/billing',
  } = data;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  const formattedDate = new Date(nextBillingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Confirmation</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AI Voice Generator</h1>
          </div>
          <div class="content">
            <h2>Subscription Confirmed!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for subscribing to AI Voice Generator!</p>

            <div class="success-box">
              <h3>Subscription Details</h3>
              <p><strong>Plan:</strong> ${planName}</p>
              <p><strong>Amount:</strong> ${formattedAmount}/month</p>
              <p><strong>Next Billing Date:</strong> ${formattedDate}</p>
            </div>

            <h3>What's Included</h3>
            <ul>
              <li>Unlimited voice generations</li>
              <li>Access to all voice options</li>
              <li>Priority support</li>
              <li>Advanced features and customization</li>
            </ul>

            <div style="text-align: center;">
              <a href="${manageUrl}" class="button">Manage Subscription</a>
            </div>

            <p>You can cancel or modify your subscription at any time from your account settings.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} AI Voice Generator. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ============================================================================
// Email Sending Functions
// ============================================================================

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  data: WelcomeEmailData
): Promise<EmailResult> {
  const html = generateWelcomeEmail(data);

  return sendHTMLEmail(
    email,
    'Welcome to AI Voice Generator',
    html,
    {
      tags: [{ name: 'category', value: 'welcome' }],
    }
  );
}

/**
 * Send generation complete email
 */
export async function sendGenerationCompleteEmail(
  email: string,
  data: GenerationCompleteData
): Promise<EmailResult> {
  const html = generateGenerationCompleteEmail(data);

  return sendHTMLEmail(
    email,
    'Your Voice Generation is Complete',
    html,
    {
      tags: [
        { name: 'category', value: 'generation' },
        { name: 'generation_id', value: data.generationId },
      ],
    }
  );
}

/**
 * Send credit alert email
 */
export async function sendCreditAlertEmail(
  email: string,
  data: CreditAlertData
): Promise<EmailResult> {
  const html = generateCreditAlertEmail(data);

  return sendHTMLEmail(
    email,
    'Credit Balance Alert - AI Voice Generator',
    html,
    {
      tags: [{ name: 'category', value: 'alert' }],
    }
  );
}

/**
 * Send invoice email
 */
export async function sendInvoiceEmail(
  email: string,
  data: InvoiceEmailData
): Promise<EmailResult> {
  const html = generateInvoiceEmail(data);

  return sendHTMLEmail(
    email,
    `Invoice ${data.invoiceNumber} - AI Voice Generator`,
    html,
    {
      tags: [
        { name: 'category', value: 'invoice' },
        { name: 'invoice_number', value: data.invoiceNumber },
      ],
    }
  );
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionEmail(
  email: string,
  data: SubscriptionEmailData
): Promise<EmailResult> {
  const html = generateSubscriptionEmail(data);

  return sendHTMLEmail(
    email,
    'Subscription Confirmation - AI Voice Generator',
    html,
    {
      tags: [{ name: 'category', value: 'subscription' }],
    }
  );
}

import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  /**
   * Send a generic email
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@rendivo.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`📧 Email sent to ${options.to}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Generate a verification token
   */
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send email verification email
   */
  static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #df84dc;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .header h1 {
              margin: 0;
              color: white;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .content h2 {
              color: #333;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #df84dc;
              color: white !important;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: 600;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Rendivo</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Hello,</p>
              <p>Thank you for creating your Rendivo account! Please click the button below to verify your email address:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button" style="color: white;">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p><strong>This link is valid for 24 hours.</strong></p>
              <p>If you didn't create this account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Rendivo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Rendivo - Verify Your Email Address',
      html,
    });
  }

  /**
   * Send welcome email after verification
   */
  static async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    const displayName = name || 'User';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #df84dc;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .header h1 {
              margin: 0;
              color: white;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .content h2 {
              color: #333;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #df84dc;
              color: white !important;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome!</h1>
            </div>
            <div class="content">
              <h2>Hello ${displayName},</h2>
              <p>Welcome to the Rendivo family!</p>
              <p>Your email address has been successfully verified and you can now use all our features.</p>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/login" class="button" style="color: white;">Log In</a>
              </div>
              <p>Have a great day!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Rendivo - Welcome!',
      html,
    });
  }

  /**
   * Send password reset code email
   */
  static async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #df84dc;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .header h1 {
              margin: 0;
              color: white;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .content h2 {
              color: #333;
            }
            .code-box {
              background: white;
              border: 2px solid #df84dc;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 24px 0;
            }
            .code {
              font-size: 36px;
              font-weight: 700;
              letter-spacing: 0.5em;
              color: #df84dc;
              font-family: monospace;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Rendivo</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password. Use the code below to reset your password:</p>
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Rendivo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Rendivo - Password Reset Code',
      html,
    });
  }
}

export default EmailService;

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
              background-color: #4F46E5;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #4F46E5;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
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
              <h2>Email Adresinizi Doğrulayın</h2>
              <p>Merhaba,</p>
              <p>Rendivo hesabınızı oluşturduğunuz için teşekkür ederiz! Email adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Email Adresimi Doğrula</a>
              </div>
              <p>Veya aşağıdaki linki tarayıcınıza kopyalayın:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p><strong>Bu link 24 saat geçerlidir.</strong></p>
              <p>Eğer bu hesabı oluşturmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Rendivo. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Rendivo - Email Adresinizi Doğrulayın',
      html,
    });
  }

  /**
   * Send welcome email after verification
   */
  static async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    const displayName = name || 'Kullanıcı';
    
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
              background-color: #4F46E5;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #4F46E5;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Hoş Geldiniz!</h1>
            </div>
            <div class="content">
              <h2>Merhaba ${displayName},</h2>
              <p>Rendivo ailesine hoş geldiniz! 🎉</p>
              <p>Email adresiniz başarıyla doğrulandı ve artık tüm özelliklerimizi kullanabilirsiniz.</p>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/login" class="button">Giriş Yap</a>
              </div>
              <p>İyi günler dileriz!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Rendivo - Hoş Geldiniz!',
      html,
    });
  }
}

export default EmailService;

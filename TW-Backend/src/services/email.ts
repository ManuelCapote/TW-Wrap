import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import dotenv from 'dotenv'
import { createError } from '../middleware/errorHandler'

// Load environment variables
dotenv.config()

export class EmailService {
  private transporter: Transporter
  private from: string
  private frontendUrl: string

  constructor() {
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174'
    this.from = process.env.EMAIL_FROM || 'noreply@tw-web.com'

    // For development, we'll use Ethereal Email (fake SMTP for testing)
    // For production, configure real SMTP settings in .env
    const isProduction = process.env.NODE_ENV === 'production'

    if (isProduction) {
      // Production SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    } else {
      // Development: Use Ethereal Email for testing
      // This won't actually send emails, but provides a test inbox
      // Alternatively, configure your own test SMTP server
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025'),
        secure: false,
        // Fallback to console logging if no SMTP server
        // tls: { rejectUnauthorized: false }
      })

      console.log('📧 Email service initialized in DEVELOPMENT mode')
      console.log(`   SMTP Host: ${process.env.SMTP_HOST || 'localhost:1025'}`)
      console.log(`   For testing, consider using MailHog or Ethereal Email`)
    }
  }

  /**
   * Send password reset email to user
   * @param email - User's email address
   * @param resetToken - Password reset token
   * @param userName - User's name for personalization
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string
  ): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`

    // In development without a mail server, just log the reset URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📧 PASSWORD RESET EMAIL (Development Mode)')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`To: ${email}`)
      console.log(`User: ${userName}`)
      console.log(`\n🔗 Reset URL (click or copy):`)
      console.log(`${resetUrl}`)
      console.log('\n⏰ This link expires in 30 minutes')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      return // Skip actual email sending in development
    }

    // Production: send actual email
    const mailOptions = {
      from: `"TW-Web" <${this.from}>`,
      to: email,
      subject: 'Reset Your TW-Web Password',
      html: this.getPasswordResetTemplate(userName, resetUrl),
      text: this.getPasswordResetTextVersion(userName, resetUrl)
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log(`📧 Password reset email sent to: ${email}`)
      console.log(`   Message ID: ${info.messageId}`)
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error)
      throw createError('Failed to send password reset email. Please try again later.', 500)
    }
  }

  /**
   * Send password reset confirmation email
   * @param email - User's email address
   * @param userName - User's name
   */
  async sendPasswordResetConfirmation(email: string, userName: string): Promise<void> {
    const mailOptions = {
      from: `"TW-Web" <${this.from}>`,
      to: email,
      subject: 'Your Password Has Been Reset',
      html: this.getPasswordResetConfirmationTemplate(userName),
      text: this.getPasswordResetConfirmationTextVersion(userName)
    }

    try {
      await this.transporter.sendMail(mailOptions)

      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Password reset confirmation sent to:', email)
      }
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error)
      // Don't throw error here - confirmation email is optional
    }
  }

  /**
   * HTML template for password reset email
   */
  private getPasswordResetTemplate(userName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f0f; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 32px; text-align: center; background: linear-gradient(135deg, #1a1a1a 0%, #262626 100%);">
                      <h1 style="margin: 0; color: #fafafa; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                        🔐 Reset Your Password
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px 40px;">
                      <p style="margin: 0 0 16px; color: #fafafa; font-size: 16px; line-height: 1.6;">
                        Hi ${userName},
                      </p>
                      <p style="margin: 0 0 24px; color: #a3a3a3; font-size: 15px; line-height: 1.6;">
                        We received a request to reset your password for your TW-Web account. Click the button below to create a new password:
                      </p>

                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 24px 0 0; color: #737373; font-size: 14px; line-height: 1.6;">
                        This link will expire in <strong style="color: #a3a3a3;">30 minutes</strong> for security reasons.
                      </p>

                      <!-- Divider -->
                      <div style="margin: 32px 0; border-top: 1px solid #2a2a2a;"></div>

                      <p style="margin: 0 0 12px; color: #737373; font-size: 13px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="margin: 0; word-break: break-all;">
                        <a href="${resetUrl}" style="color: #3b82f6; font-size: 13px; text-decoration: none;">
                          ${resetUrl}
                        </a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background-color: #262626; border-top: 1px solid #2a2a2a;">
                      <p style="margin: 0 0 8px; color: #737373; font-size: 13px; line-height: 1.5;">
                        <strong>Didn't request this?</strong> You can safely ignore this email. Your password will not change.
                      </p>
                      <p style="margin: 0; color: #737373; font-size: 12px;">
                        TW-Web - Share wishlists, give perfect gifts
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }

  /**
   * Plain text version of password reset email
   */
  private getPasswordResetTextVersion(userName: string, resetUrl: string): string {
    return `
Hi ${userName},

We received a request to reset your password for your TW-Web account.

To reset your password, click the link below:
${resetUrl}

This link will expire in 30 minutes for security reasons.

If you didn't request this, you can safely ignore this email. Your password will not change.

---
TW-Web - Share wishlists, give perfect gifts
    `.trim()
  }

  /**
   * HTML template for password reset confirmation
   */
  private getPasswordResetConfirmationTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f0f; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
                  <tr>
                    <td style="padding: 40px; text-align: center;">
                      <h1 style="margin: 0 0 16px; color: #10b981; font-size: 48px;">✓</h1>
                      <h2 style="margin: 0 0 16px; color: #fafafa; font-size: 24px; font-weight: 600;">
                        Password Reset Successful
                      </h2>
                      <p style="margin: 0; color: #a3a3a3; font-size: 15px; line-height: 1.6;">
                        Hi ${userName}, your password has been successfully reset. You can now log in with your new password.
                      </p>
                      <div style="margin: 32px 0; border-top: 1px solid #2a2a2a;"></div>
                      <p style="margin: 0; color: #737373; font-size: 13px;">
                        If you didn't make this change, please contact support immediately.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }

  /**
   * Plain text version of confirmation email
   */
  private getPasswordResetConfirmationTextVersion(userName: string): string {
    return `
Hi ${userName},

Your password has been successfully reset. You can now log in with your new password.

If you didn't make this change, please contact support immediately.

---
TW-Web
    `.trim()
  }
}

// Export singleton instance
export const emailService = new EmailService()

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { LoggerService } from '../../logging/logger.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('SMTP_PORT') || 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM') || '"Auth System" <noreply@authbase.com>',
        to: email,
        subject: '✉️ Verify your email - Auth Base',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Welcome, ${firstName}! 🎉</h1>
            <p style="color: #666; font-size: 16px; text-align: center;">
              Thank you for registering. Please verify your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                Verify Email
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center;">
              This link expires in 24 hours. If you didn't create an account, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Or copy this link: ${verificationUrl}
            </p>
          </div>
        `,
      });

      this.logger.log(`Verification email sent to ${email}`, 'EmailService');
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}: ${error}`, undefined, 'EmailService');
      // Don't throw - email failure shouldn't block registration
      // In production, you'd want to queue this for retry
    }
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM') || '"Auth System" <noreply@authbase.com>',
        to: email,
        subject: '🔑 Reset your password - Auth Base',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
            <p style="color: #666; font-size: 16px; text-align: center;">
              Hi ${firstName}, we received a request to reset your password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2196F3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center;">
              This link expires in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
        `,
      });

      this.logger.log(`Password reset email sent to ${email}`, 'EmailService');
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}: ${error}`, undefined, 'EmailService');
    }
  }
}

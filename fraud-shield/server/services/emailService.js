const nodemailer = require('nodemailer');

/**
 * Creates and returns configured Nodemailer transporter
 */
const getTransporter = async () => {
  // Direct Gmail Service Support (with App Password)
  if (process.env.SMTP_SERVICE === 'gmail' || (process.env.SMTP_USER && process.env.SMTP_USER.includes('@gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : ''
      }
    });
  }

  // Custom SMTP (SendGrid, Mailgun, SES, etc.)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  return null;
};

/**
 * Send password reset OTP and instructions
 */
const sendPasswordResetEmail = async ({ toEmail, userName, otp }) => {
  const subject = '🔒 FraudShield - Password Reset Verification Code';
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 32px; margin-bottom: 6px;">🛡️</div>
        <h2 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 800;">FraudShield Security</h2>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: 600;">Real-Time Fraud & Identity Defense</p>
      </div>

      <div style="background-color: #f8fafc; border-radius: 12px; padding: 22px; margin-bottom: 22px; border: 1px solid #f1f5f9;">
        <p style="color: #334155; font-size: 15px; margin: 0 0 12px 0;">Hello <strong>${userName || 'User'}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 18px 0;">
          We received a request to reset your password for your FraudShield account. Please use the secure 6-digit verification code below:
        </p>

        <div style="text-align: center; margin: 26px 0;">
          <div style="display: inline-block; background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 14px 32px;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 8px; font-weight: 600;">⏱️ Code expires in 15 minutes</p>
        </div>
      </div>

      <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 22px;">
        If you did not request a password reset, you can safely ignore this email. No changes will be made to your account.
      </p>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">© FraudShield AI Cybersecurity Platform</p>
      </div>
    </div>
  `;

  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.warn('⚠️ SMTP email configuration missing in server/.env. Please provide SMTP_USER and SMTP_PASS.');
      return { success: false, message: 'SMTP credentials not configured in server/.env' };
    }

    const fromAddress = process.env.SMTP_FROM || `"FraudShield Security" <${process.env.SMTP_USER}>`;
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: subject,
      html: htmlContent
    });

    console.log(`✓ Password reset email sent successfully to ${toEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Failed to send email via SMTP:', err.message);
    throw new Error(`Email delivery failed: ${err.message}`);
  }
};

module.exports = {
  sendPasswordResetEmail
};

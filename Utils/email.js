const axios = require('axios');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.otp = user.otp || null;
    this.url = url;
    this.from = process.env.EMAIL_FROM || 'hello@natours.com';
  }

  // Returns raw HTML template strings
  getHtmlContent(template, subject) {
    if (template === 'otp') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #149d63; text-align: center;">Verify Your Email Address</h2>
          <p>Hello ${this.firstName},</p>
          <p>Thank you for signing up with Natours! Please use the following One-Time Password (OTP) to complete your verification:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #149d63; border-radius: 4px; margin: 20px 0;">
            ${this.otp}
          </div>
          <p>This code is valid for 10 minutes. If you did not request this, you can ignore this email.</p>
          <p>Happy adventuring,<br>The Natours Team</p>
        </div>
      `;
    }

    if (template === 'welcome') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #149d63; text-align: center;">Welcome to the Natours Family!</h2>
          <p>Hello ${this.firstName},</p>
          <p>We are absolutely thrilled to welcome you to Natours! You are now part of our community of adventure seekers.</p>
          <p>Click the button below to log in and explore our tours:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${this.url}" style="background-color: #149d63; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Explore Tours</a>
          </div>
          <p>Best regards,<br>The Natours Team</p>
        </div>
      `;
    }

    if (template === 'passwordReset') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #e74c3c; text-align: center;">Reset Your Password</h2>
          <p>Hello ${this.firstName},</p>
          <p>Forgot your password? Click the link below to reset it:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${this.url}" style="background-color: #e74c3c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>This link is only valid for 10 minutes. If you didn't request a password reset, please ignore this email.</p>
          <p>Best regards,<br>The Natours Team</p>
        </div>
      `;
    }

    if (template === 'bookingConfirmation') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #149d63; text-align: center;">Booking Confirmation</h2>
          <p>Hello ${this.firstName},</p>
          <p>Your booking has been confirmed! Get ready for an unforgettable adventure.</p>
          <p>You can view your booked tours anytime by clicking the button below:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${this.url}" style="background-color: #149d63; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">My Bookings</a>
          </div>
          <p>See you on the trail,<br>The Natours Team</p>
        </div>
      `;
    }

    // Fallback default basic template
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Natours Notification</h2>
        <p>${subject}</p>
        <p>Go here: <a href="${this.url}">${this.url}</a></p>
      </div>
    `;
  }

  // Sends the email using Brevo REST API (or logs in dev if no API key is configured)
  async send(template, subject) {
    const html = this.getHtmlContent(template, subject);
    const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_PASSWORD;

    // Use console logging in development if no API Key is set
    if (process.env.NODE_ENV !== 'production' && !apiKey) {
      console.log('✉️ [DEV EMAIL LOG]');
      console.log(`Recipient: ${this.to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Plain Text: ${convert(html).substring(0, 150)}...`);
      return;
    }

    if (!apiKey) {
      throw new Error('Brevo API key is not configured in production settings (set BREVO_API_KEY).');
    }

    // Direct HTTP POST to Brevo API (ignores port blocking completely)
    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: 'Natours', email: this.from },
          to: [{ email: this.to }],
          subject: subject,
          htmlContent: html,
        },
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (err) {
      console.error('Brevo REST API Error:', err.response?.data || err.message);
      throw new Error(`SMTP API Failure: ${err.message}`);
    }
  }

  // Helper sugar methods
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token (valid for 10 minutes)');
  }

  async sendBookingConfirmation() {
    await this.send('bookingConfirmation', 'Tour Booking Confirmation');
  }

  async sendOTP() {
    await this.send('otp', 'Your OTP for Email Verification');
  }
};

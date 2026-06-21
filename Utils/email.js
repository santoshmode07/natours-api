const nodemailer = require('nodemailer');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.otp = user.otp || null;
    this.url = url;
    this.from = `Santosh <${process.env.EMAIL_FROM}>`;
  }

  // Create SMTP transporter based on current NODE_ENV
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Connect directly to Brevo SMTP Relay
      return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // TLS
        auth: {
          user: process.env.BREVO_USERNAME,
          pass: process.env.BREVO_PASSWORD,
        },
      });
    }
    // Connect to Mailtrap SMTP in development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Returns raw HTML template strings instead of parsing Pug files
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

  // Sends the email using nodemailer
  async send(template, subject) {
    // 1) Render HTML directly using JS template strings
    const html = this.getHtmlContent(template, subject);

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: convert(html), // Generate automatic plain text fallback
    };

    // 3) Create a transporter and send email
    await this.newTransport().sendMail(mailOptions);
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

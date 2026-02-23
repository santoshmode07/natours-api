const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const fs = require('fs');
const path = require('path');

// new Email(user,url).sendWelcome();
module.exports = class Email {
  constructor(user, url, data = {}) {
    this.to = user.email;
    this.otp = user.otp || null;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Santosh <${process.env.EMAIL_FROM}>`;
    this.logoCid = 'natours-logo';
    this.logoPath = path.join(__dirname, '../public/img/logo-white.png');
    this.logoUrl = this.getLogoUrl(url);
    this.data = data;
  }

  getLogoUrl(url) {
    if (process.env.EMAIL_LOGO_URL) return process.env.EMAIL_LOGO_URL;

    try {
      const publicBaseUrl = process.env.PUBLIC_BASE_URL || url;
      const origin = new URL(publicBaseUrl).origin;
      return `${origin}/img/logo-white.png`;
    } catch (err) {
      return null;
    }
  }

  getLogoAttachment() {
    if (!fs.existsSync(this.logoPath)) return null;

    return {
      filename: 'natours-logo-white.png',
      path: this.logoPath,
      cid: this.logoCid,
    };
  }

  getInlineAttachments() {
    const attachments = [];
    const logoAttachment = this.getLogoAttachment();
    if (logoAttachment) attachments.push(logoAttachment);

    if (Array.isArray(this.data.inlineAttachments)) {
      this.data.inlineAttachments.forEach((attachment) => {
        if (!attachment || !attachment.path || !attachment.cid) return;
        if (!fs.existsSync(attachment.path)) return;
        attachments.push({
          filename: attachment.filename || path.basename(attachment.path),
          path: attachment.path,
          cid: attachment.cid,
        });
      });
    }

    return attachments;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Send Grid
      return nodemailer.createTransport({
        service: 'SendinBlue',
        auth: {
          user: process.env.BREVO_USERNAME,
          pass: process.env.BREVO_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //1)Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      otp: this.otp,
      url: this.url,
      logoUrl: this.logoUrl,
      logoCid: this.logoCid,
      subject,
      ...this.data,
    });
    //2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    const inlineAttachments = this.getInlineAttachments();
    if (inlineAttachments.length > 0) {
      mailOptions.attachments = inlineAttachments;
    }

    // 3)Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family !');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }

  async sendBookingConfirmation() {
    await this.send('bookingConfirmation', 'Tour Booking Confirmation');
  }

  async sendOTP() {
    await this.send('otp', 'Your OTP for Email Verification');
  }
};

const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

// new Email(user,url).sendWelcome();
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.otp = user.otp || null;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Santosh <${process.env.EMAIL_FROM}>`;
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
      subject,
    });
    //2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
      // html:
    };

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

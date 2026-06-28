const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set in .env. Skipping email and printing OTP to console.');
    console.log(`\n========================================`);
    console.log(`📧 To: ${options.email}`);
    console.log(`🔑 OTP Code: ${options.otp}`);
    console.log(`========================================\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'BLOXED Store <noreply@bloxed.tech>',
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f5; text-align: center;">
        <h2 style="color: #10b981;">BLOXED</h2>
        <p style="font-size: 16px; color: #3f3f46;">Welcome to BLOXED! Please use the following code to verify your account:</p>
        <div style="margin: 20px auto; padding: 15px; background: #fff; border-radius: 8px; width: fit-content; border: 1px solid #e2e8f0;">
          <h1 style="margin: 0; color: #3b82f6; letter-spacing: 4px;">${options.otp}</h1>
        </div>
        <p style="font-size: 12px; color: #a1a1aa;">This code will expire in 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"Presenz" <${process.env.DEFAULT_FROM_EMAIL}>`,
    to: email,
    subject: 'Your Presenz Verification Code',
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #EDE9FE; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #7C3AED; height: 8px;"></div>
        <div style="padding: 40px; background-color: #FFFFFF;">
          <h1 style="color: #0F0A1E; font-size: 24px; font-weight: 700; margin-bottom: 20px;">Verify Your Email</h1>
          <p style="color: #6B7280; font-size: 16px; margin-bottom: 30px;">Use the following code to complete your registration for Presenz.</p>
          <div style="background-color: #FAFAFF; border: 1px solid #EDE9FE; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
            <span style="font-size: 32px; font-weight: 700; color: #7C3AED; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #6B7280; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
        <div style="padding: 20px; background-color: #FAFAFF; border-top: 1px solid #EDE9FE; text-align: center;">
          <p style="color: #6B7280; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Presenz. Powered by RNS Solutions.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendPasswordResetOTP = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"Presenz" <${process.env.DEFAULT_FROM_EMAIL}>`,
    to: email,
    subject: 'Security Alert: Password Change Request',
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #EDE9FE; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #7C3AED; height: 8px;"></div>
        <div style="padding: 40px; background-color: #FFFFFF;">
          <h1 style="color: #0F0A1E; font-size: 24px; font-weight: 700; margin-bottom: 20px;">Password Change OTP</h1>
          <p style="color: #6B7280; font-size: 16px; margin-bottom: 30px;">You requested to change your admin password. Use the following code to verify your identity.</p>
          <div style="background-color: #FAFAFF; border: 1px solid #EDE9FE; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
            <span style="font-size: 32px; font-weight: 700; color: #7C3AED; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #6B7280; font-size: 14px;">If you did not request this, please change your password immediately or contact support.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

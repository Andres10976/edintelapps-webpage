const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Hotmail", // or 'smtp' if using a different service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send an email
async function sendEmail(to, subject, text) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

module.exports = { sendEmail };

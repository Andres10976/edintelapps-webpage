const msal = require("@azure/msal-node");
const nodemailer = require("nodemailer");
require("dotenv").config();

const msalConfig = {
  auth: {
    clientId: process.env.OAUTH_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.OAUTH_TENANT_ID}`,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
  },
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

const msalClientCredentialRequest = {
  scopes: ["https://graph.microsoft.com/.default"],
};

async function getAccessToken() {
  try {
    const response = await cca.acquireTokenByClientCredential(msalClientCredentialRequest);
    
    return response.accessToken;
  } catch (error) {
    console.error("Failed to acquire access token:", error);
    throw error;
  }
}

async function createTransporter() {
  const accessToken = await getAccessToken();
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      type: "OAuth2",
      accessToken: accessToken,
    },
    tls: {
      ciphers:'SSLv3'
    }
  });
  return transporter;
}

// Function to send an email
async function sendEmail(to, subject, text) {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
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
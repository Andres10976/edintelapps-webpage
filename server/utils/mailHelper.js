const msal = require("@azure/msal-node");
const graph = require('@microsoft/microsoft-graph-client');
require("dotenv").config();

async function sendEmail(subject, body, recipient) {

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

  const client = graph.Client.init({
    authProvider: (done) => {
      done(null, getAccessToken());
    },
  });

  const message = {
    subject: subject,
    body: {
      contentType: 'HTML',
      content: body,
    },
    toRecipients: [
      {
        emailAddress: {
          address: recipient,
        },
      },
    ],
  };

  await client.api('/users/reportes@edintel.com/sendMail').post({
    message: message,
  });
}

module.exports = sendEmail;
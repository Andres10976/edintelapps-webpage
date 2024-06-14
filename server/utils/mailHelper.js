const msal = require("@azure/msal-node");
const graph = require('@microsoft/microsoft-graph-client');
const fs = require('fs').promises;
const path = require('path');
require("dotenv").config();

async function sendEmail(subject, body, recipients, attachmentPaths = []) {
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

    const toRecipients = recipients.map((recipient) => ({
        emailAddress: {
            address: recipient,
        },
    }));

    let attachments = [];

    if (attachmentPaths && Array.isArray(attachmentPaths)) {
        attachments = await Promise.all(attachmentPaths.map(async (filePath) => {
            if (filePath) {
                const fileName = path.basename(filePath);
                const fileContent = await fs.readFile(filePath);
                const base64Content = fileContent.toString('base64');

                return {
                    "@odata.type": "#microsoft.graph.fileAttachment",
                    name: fileName,
                    contentType: "application/octet-stream",
                    contentBytes: base64Content,
                };
            }
        }));

        // Filter out any undefined attachments
        attachments = attachments.filter((attachment) => attachment);
    }

    const message = {
        subject: subject,
        body: {
            contentType: 'HTML',
            content: body,
        },
        toRecipients: toRecipients,
        attachments: attachments,
    };

    await client.api('/users/reportes@edintel.com/sendMail').post({
        message: message,
    });
}

module.exports = sendEmail;
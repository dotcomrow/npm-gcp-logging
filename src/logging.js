const axios = require('axios');
const fs = require('fs');
const jwt = require('jsonwebtoken');

class GCloudLogger {
  constructor(projectId, keyFilePath) {
    this.projectId = projectId;
    this.keyFilePath = keyFilePath;
    this.token = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.token && this.tokenExpiry > Date.now()) {
      return this.token;
    }

    const keyFile = JSON.parse(fs.readFileSync(this.keyFilePath, 'utf8'));

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600; // 1 hour expiry

    const payload = {
      iss: keyFile.client_email,
      sub: keyFile.client_email,
      scope: 'https://www.googleapis.com/auth/logging.write',
      aud: 'https://oauth2.googleapis.com/token',
      iat: iat,
      exp: exp,
    };

    const token = jwt.sign(payload, keyFile.private_key, { algorithm: 'RS256' });

    const response = await axios.post('https://oauth2.googleapis.com/token', {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token,
    });

    this.token = response.data.access_token;
    this.tokenExpiry = exp * 1000;

    return this.token;
  }

  async logEntry(logName, severity, message) {
    const url = `https://logging.googleapis.com/v2/entries:write`;
    
    const accessToken = await this.getAccessToken();

    const logEntry = {
      logName: `projects/${this.projectId}/logs/${logName}`,
      resource: {
        type: 'global',
      },
      entries: [
        {
          severity: severity,
          // textPayload: message,
          jsonPayload: {
            message: message
          }
        },
      ],
    };

    try {
      const response = await axios.post(url, logEntry, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`Logged: ${message}`);
    } catch (error) {
      console.error(`Error logging to ${logName}:`, error.response.data);
    }
  }
}

module.exports = GCloudLogger;

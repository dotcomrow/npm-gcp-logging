import axios from 'axios';
import jwt from 'jsonwebtoken';

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

class GCloudLogger {
  private projectId: string;
  private keyfile: string;
  private token: string;
  private tokenExpiry: number | null;

  constructor(projectId: string, keyFilePath: string) {
    this.projectId = projectId;
    this.keyfile = keyFilePath;
    this.token = '';
    this.tokenExpiry = null;
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      return this.token;
    }

    const keyFile: ServiceAccountKey = JSON.parse(this.keyfile);

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

  // public async logEntry(logName: string, severity: string, message: string): Promise<void> {
  //   const url = `https://logging.googleapis.com/v2/entries:write`;
    
  //   const accessToken = await this.getAccessToken();

  //   const logEntry = {
  //     logName: `projects/${this.projectId}/logs/${logName}`,
  //     resource: {
  //       type: 'global',
  //     },
  //     entries: [
  //       {
  //         severity: severity,
  //         // textPayload: message,
  //         jsonPayload: {
  //           message: message
  //         }
  //       },
  //     ],
  //   };

  //   try {
  //     await axios.post(url, logEntry, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });
  //     console.log(`Logged: ${message}`);
  //   } catch (error) {
  //     console.error(`Error logging to ${logName}:`, (error as any).response?.data || (error as any).message);
  //   }
  // }
}

export default GCloudLogger;

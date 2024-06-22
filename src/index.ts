import axios from 'axios';
import GetAccessToken from './getGoogleAccessToken';

class GCloudLogger {
  private projectId: string;
  private keyfile: string;

  public constructor(projectId: string, keyFilePath: string) {
    this.projectId = projectId;
    this.keyfile = keyFilePath;
  }

  public async logEntry(logName: string, severity: string, message: string): Promise<void> {
    const url = `https://logging.googleapis.com/v2/entries:write`;
    
    const scope = 'https://www.googleapis.com/auth/logging.write'; // replace with the desired scope


    const gcloudAuth = new GetAccessToken(this.projectId, this.keyfile);
    const accessToken = await gcloudAuth.getAccessToken(scope);

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
      await axios.post(url, logEntry, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`Logged: ${message}`);
    } catch (error) {
      console.error(`Error logging to ${logName}:`, (error as any).response?.data || (error as any).message);
    }
  }
}

export default GCloudLogger;

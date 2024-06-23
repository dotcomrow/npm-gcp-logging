import axios from 'axios';
import GetAccessToken from './getGoogleAccessToken';
import fetchAdapter from "@haverstack/axios-fetch-adapter";

class GCloudLogger {
  public static async logEntry(projectId: string, keyfile: string, logName: string, severity: string, message: string) {
    const url = `https://logging.googleapis.com/v2/entries:write`;
    
    const scope = 'https://www.googleapis.com/auth/logging.write'; // replace with the desired scope


    const gcloudAuth = new GetAccessToken(projectId, keyfile);
    const accessToken = await gcloudAuth.getAccessToken(scope);

    const logEntry = {
      logName: `projects/${projectId}/logs/${logName}`,
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
      const client = axios.create({
        adapter: fetchAdapter
      });
      await client.post(url, logEntry, {
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

import axios from 'axios';
import fetchAdapter from "@haverstack/axios-fetch-adapter";

class GCloudLogger {
  public static async logEntry(projectId: string, accessToken: string, keyfile: string, logName: string, logEntries: Array<any>) {
    const url = `https://logging.googleapis.com/v2/entries:write`;    
    
    const logEntry = {
      logName: `projects/${projectId}/logs/${logName}`,
      resource: {
        type: 'global',
      },
      entries: logEntries
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
    } catch (error) {
      console.error(`Error logging to ${logName}:`, (error as any).response?.data || (error as any).message);
    }
  }
}

export default GCloudLogger;

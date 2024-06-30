import axios from 'axios';

export default class GCPLogger {
  public static async logEntry(projectId: string, accessToken: string, logName: string, logEntries: Array<any>) {
    const url = `https://logging.googleapis.com/v2/entries:write`;    
    
    const logEntry = {
      logName: `projects/${projectId}/logs/${logName}`,
      resource: {
        type: 'global',
      },
      entries: logEntries
    };

    try {
      await axios.post(url, logEntry, {
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

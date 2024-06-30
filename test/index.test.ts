import GCloudLogger from '../src/GCPLogger.js';
import { GCPAccessToken } from 'npm-gcp-token';
import * as fs from 'fs';

const projectId = 'gcploggingproject-427121'; // replace with your GCP project ID    
const keyFilePath = '/Users/admin/Downloads/logging-test-key.json'; // replace with the path to your service account key file
const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');

const logName = 'my-log';
const severity = 'INFO';
const message = 'This is a log message test log17.';

var accessToken = new GCPAccessToken(keyFileContent);
var token = await accessToken.getAccessToken('https://www.googleapis.com/auth/logging.write');

GCloudLogger.logEntry(projectId, token.access_token, logName, 
    [
        {
          severity: severity,
          // textPayload: message,
          jsonPayload: {
            message: message
          }
        },
      ],
);

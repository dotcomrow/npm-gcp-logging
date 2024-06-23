import GCloudLogger from '../src/index';
import * as fs from 'fs';

const projectId = 'gcploggingproject-427121'; // replace with your GCP project ID    
const keyFilePath = '/Users/admin/Downloads/logging-test-key.json'; // replace with the path to your service account key file
const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');

const logName = 'my-log';
const severity = 'INFO';
const message = 'This is a log message test log13.';

GCloudLogger.logEntry(projectId, keyFileContent, logName, severity, message);

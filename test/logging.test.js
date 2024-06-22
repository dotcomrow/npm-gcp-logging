const GCloudLogger = require('../src/logging');

const projectId = 'gcploggingproject-427121'; // replace with your GCP project ID
const keyFilePath = '/Users/admin/Downloads/logging-test-key.json'; // replace with the path to your service account key file
const logger = new GCloudLogger(projectId, keyFilePath);

const logName = 'my-log';
const severity = 'ERROR';
const message = 'This is a log message.';

logger.logEntry(logName, severity, message);

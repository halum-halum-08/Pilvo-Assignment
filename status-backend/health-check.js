const http = require('http');
const https = require('https');

const isHttps = process.env.USE_HTTPS === 'true';
const protocol = isHttps ? https : http;
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 8080;
const path = process.env.HEALTH_PATH || '/health';

const requestOptions = {
  host: host,
  port: port,
  path: path,
  timeout: 2000,
  method: 'GET'
};

const request = protocol.request(requestOptions, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('Service is healthy');
    process.exit(0);
  } else {
    console.error('Service returned unhealthy status');
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Request timed out');
  request.destroy();
  process.exit(1);
});

request.end();

const http = require('http');

// Configuration
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3001;
const path = '/health';
const timeout = 5000;

console.log(`Checking backend server at http://${host}:${port}${path}...`);

const requestOptions = {
  host,
  port,
  path,
  timeout,
  method: 'GET'
};

const request = http.request(requestOptions, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('✅ Backend server is running!');
    process.exit(0);
  } else {
    console.error(`❌ Backend server returned status: ${res.statusCode}`);
    process.exit(1);
  }
});

request.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.error('❌ Connection refused: Backend server is not running');
  } else if (err.code === 'ETIMEDOUT') {
    console.error('❌ Connection timed out: Backend server might be unresponsive');
  } else {
    console.error(`❌ Error connecting to backend: ${err.message}`);
  }
  process.exit(1);
});

request.on('timeout', () => {
  console.error('❌ Request timed out: Backend server might be unresponsive');
  request.destroy();
  process.exit(1);
});

request.end();

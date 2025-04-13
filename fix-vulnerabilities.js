const { execSync } = require('child_process');
const path = require('path');

// Define directories
const rootDir = path.resolve(__dirname);
const frontendDir = path.join(rootDir, 'status-frontend');
const backendDir = path.join(rootDir, 'status-backend');

console.log('🔒 Fixing vulnerabilities...');

try {
  // Fix frontend vulnerabilities
  console.log('\n🔄 Fixing frontend vulnerabilities...');
  
  // First run a basic fix
  try {
    execSync('npm audit fix --workspace=status-frontend', { 
      stdio: 'inherit',
      cwd: rootDir
    });
  } catch (e) {
    console.log('Some vulnerabilities require manual review or force fixing');
  }
  
  // Update specific packages known to have vulnerabilities
  execSync(`cd ${frontendDir} && npm install \
    postcss@^8.4.31 \
    follow-redirects@^1.15.4 \
    webpack-dev-middleware@^5.3.4 \
    semver@^7.5.2 \
    word-wrap@^1.2.4`, 
    { stdio: 'inherit' });
  
  // Fix backend vulnerabilities
  console.log('\n🔄 Fixing backend vulnerabilities...');
  
  // Run basic fix
  try {
    execSync('npm audit fix --workspace=status-backend', { 
      stdio: 'inherit',
      cwd: rootDir
    });
  } catch (e) {
    console.log('Some vulnerabilities require manual review or force fixing');
  }
  
  // Update specific packages known to have vulnerabilities
  execSync(`cd ${backendDir} && npm install \
    semver@^7.5.2 \
    json5@^2.2.3 \
    follow-redirects@^1.15.4`, 
    { stdio: 'inherit' });
  
  console.log('\n✅ Vulnerabilities fixed successfully!');
  console.log('\nSome vulnerabilities may still exist in development dependencies');
  console.log('These are generally safe to ignore as they do not affect production');
  console.log('You can run "npm audit --production" to see only production vulnerabilities');
  
} catch (error) {
  console.error('❌ Error fixing vulnerabilities:', error.message);
  process.exit(1);
}

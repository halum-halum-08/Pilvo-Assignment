const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define directories
const frontendDir = path.join(__dirname, 'status-frontend');
const backendDir = path.join(__dirname, 'status-backend');

console.log('📦 Updating dependencies...');

try {
  // Update Babel related packages in frontend
  console.log('\n🔄 Updating deprecated Babel plugins in frontend...');
  execSync(`cd ${frontendDir} && npm install --save-dev \
    @babel/plugin-transform-private-methods \
    @babel/plugin-transform-class-properties \
    @babel/plugin-transform-nullish-coalescing-operator \
    @babel/plugin-transform-numeric-separator \
    @babel/plugin-transform-optional-chaining \
    @babel/plugin-transform-private-property-in-object`, 
    { stdio: 'inherit' });

  // Update ESLint related packages
  console.log('\n🔄 Updating ESLint packages...');
  execSync(`cd ${frontendDir} && npm install --save-dev \
    @eslint/config-array \
    @eslint/object-schema`,
    { stdio: 'inherit' });

  // Update deprecated packages
  console.log('\n🔄 Updating deprecated packages...');
  execSync('npm run fix-deprecated', { stdio: 'inherit' });
  
  execSync(`cd ${frontendDir} && npm install --save-dev \
    rimraf@latest \
    glob@latest \
    @rollup/plugin-terser \
    svgo@latest`,
    { stdio: 'inherit' });
    
  execSync(`cd ${backendDir} && npm install --save-dev \
    rimraf@latest \
    glob@latest`,
    { stdio: 'inherit' });

  // Fix vulnerabilities
  console.log('\n🔄 Fixing vulnerabilities...');
  execSync('npm run fix-vulnerabilities', { stdio: 'inherit' });

  console.log('\n✅ Dependencies updated successfully!\n');
  console.log('Run the following command to check for any remaining issues:');
  console.log('npm audit');

} catch (error) {
  console.error('❌ Error updating dependencies:', error);
  process.exit(1);
}

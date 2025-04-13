const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define the project directories
const rootDir = path.resolve(__dirname);
const backendDir = path.join(rootDir, 'status-backend');
const frontendDir = path.join(rootDir, 'status-frontend');

console.log('📦 Setting up Status Page application...');

// Install dependencies
console.log('\n🔧 Installing dependencies...');
try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: rootDir });
  
  console.log('Installing backend dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: backendDir });
  
  console.log('Installing frontend dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: frontendDir });
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Set up environment files if they don't exist
console.log('\n🔧 Setting up environment files...');
try {
  if (!fs.existsSync(path.join(backendDir, '.env'))) {
    fs.copyFileSync(
      path.join(backendDir, '.env.example'),
      path.join(backendDir, '.env')
    );
    console.log('Created backend .env file');
  }
  
  if (!fs.existsSync(path.join(frontendDir, '.env'))) {
    fs.copyFileSync(
      path.join(frontendDir, '.env.example'),
      path.join(frontendDir, '.env')
    );
    console.log('Created frontend .env file');
  }
} catch (error) {
  console.error('❌ Error setting up environment files:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npm run prisma:generate', { stdio: 'inherit', cwd: backendDir });
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  process.exit(1);
}

console.log('\n✅ Setup completed successfully!');
console.log('\nYou can now start the development servers:');
console.log('   - Backend: npm run dev:backend');
console.log('   - Frontend: npm run dev:frontend');
console.log('   - Both: npm run dev');

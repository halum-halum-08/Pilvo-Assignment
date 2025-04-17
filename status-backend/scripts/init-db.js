const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

// Remove existing database if it exists
console.log('Checking for existing database...');
if (fs.existsSync(dbPath)) {
  console.log('Removing existing database...');
  fs.unlinkSync(dbPath);
  console.log('Existing database removed.');
}

// Create prisma/migrations directory if it doesn't exist
const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  console.log('Creating migrations directory...');
  fs.mkdirSync(migrationsDir, { recursive: true });
}

try {
  // Push the schema directly to the database
  console.log('Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Generate the Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('Database setup complete!');
} catch (error) {
  console.error('Error setting up database:', error);
  process.exit(1);
}
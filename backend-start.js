const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Configuration
const backendPort = process.env.PORT || 3001;
const backendDirectory = path.join(__dirname, 'status-backend');
const envFilePath = path.join(backendDirectory, '.env');

// Check if .env file exists in backend directory
const setupEnvFile = () => {
  if (!fs.existsSync(envFilePath)) {
    console.log('⚠️ No .env file found in backend directory, creating one...');
    
    const envContent = `NODE_ENV=development
PORT=${backendPort}
DATABASE_URL=postgresql://postgres:password@localhost:5432/statuspage
JWT_SECRET=dev-jwt-secret-${Math.random().toString(36).substring(2)}
JWT_EXPIRY=7d
ALLOWED_ORIGINS=http://localhost:3001`;

    fs.writeFileSync(envFilePath, envContent);
    console.log('✅ Created .env file with default development values');
  } else {
    console.log('✅ Found existing .env file');
  }
};

// Check if PostgreSQL is running and configure a fallback to SQLite if not
const checkAndConfigureDatabase = () => {
  return new Promise((resolve) => {
    // Read .env file
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Check if PostgreSQL URL is already commented out and SQLite is being used
    if (envContent.includes('# DATABASE_URL=postgresql') && 
        envContent.includes('DATABASE_URL=file:./dev.db')) {
      console.log('📂 Using SQLite database (fallback mode)');
      resolve({ usingFallback: true });
      return;
    }
    
    // Try to extract PostgreSQL URL
    const dbUrlMatch = envContent.match(/DATABASE_URL=postgresql:\/\/(.+)/);
    
    if (!dbUrlMatch) {
      console.log('⚠️ PostgreSQL URL not found or already using SQLite');
      configureSqliteFallback();
      resolve({ usingFallback: true });
      return;
    }
    
    // Extract host and port from DATABASE_URL
    try {
      const fullUrl = 'postgresql://' + dbUrlMatch[1];
      const urlParts = new URL(fullUrl);
      const host = urlParts.hostname;
      const port = urlParts.port || 5432;
      
      // Try to connect to PostgreSQL
      const net = require('net');
      const socket = new net.Socket();
      
      const timeout = setTimeout(() => {
        socket.destroy();
        console.log('⚠️ PostgreSQL connection timed out. Switching to SQLite fallback.');
        configureSqliteFallback();
        resolve({ usingFallback: true });
      }, 2000);
      
      socket.connect(port, host, () => {
        clearTimeout(timeout);
        socket.destroy();
        console.log('✅ PostgreSQL is running and accessible');
        resolve({ usingFallback: false });
      });
      
      socket.on('error', (error) => {
        clearTimeout(timeout);
        console.log(`⚠️ PostgreSQL connection error: ${error.message}`);
        console.log('⚠️ Switching to SQLite database for local development');
        configureSqliteFallback();
        resolve({ usingFallback: true });
      });
    } catch (error) {
      console.log(`⚠️ Error parsing DATABASE_URL: ${error.message}`);
      configureSqliteFallback();
      resolve({ usingFallback: true });
    }
  });
};

// Configure SQLite as a fallback database
const configureSqliteFallback = () => {
  try {
    // Backup the original .env file
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    const backupPath = envFilePath + '.postgresql.backup';
    fs.writeFileSync(backupPath, envContent);
    console.log(`✅ Original database configuration backed up to ${backupPath}`);
    
    // Modify prisma schema to use SQLite
    const prismaSchemaPath = path.join(backendDirectory, 'prisma', 'schema.prisma');
    let prismaSchema = fs.readFileSync(prismaSchemaPath, 'utf8');
    
    // Change provider to sqlite if it's not already
    if (!prismaSchema.includes('provider = "sqlite"')) {
      prismaSchema = prismaSchema.replace(
        /provider = "postgresql"/,
        'provider = "sqlite"'
      );
      fs.writeFileSync(prismaSchemaPath, prismaSchema);
      console.log('✅ Updated Prisma schema to use SQLite');
    }
    
    // Update the .env file to use SQLite
    const newEnvContent = envContent
      .replace(/DATABASE_URL=postgresql:\/\/(.+)/, '# DATABASE_URL=postgresql://$1\n# Using SQLite as fallback for development\nDATABASE_URL=file:./dev.db');
    
    fs.writeFileSync(envFilePath, newEnvContent);
    console.log('✅ Updated .env file to use SQLite database');
    
    // Create a troubleshooting note
    const troubleshootingPath = path.join(backendDirectory, 'POSTGRESQL_TROUBLESHOOTING.md');
    const troubleshootingContent = `# PostgreSQL Connection Troubleshooting

The application has been configured to use SQLite as a fallback database because PostgreSQL was not accessible.

## How to Switch Back to PostgreSQL

To switch back to PostgreSQL once it's properly set up:

1. Make sure PostgreSQL is installed and running
2. Create a database named "statuspage" (or use another name and update the connection string)
3. Edit the \`.env\` file and uncomment the PostgreSQL DATABASE_URL line
4. Comment out or remove the SQLite DATABASE_URL line
5. Update the Prisma schema provider back to "postgresql" in \`prisma/schema.prisma\`
6. Run \`npx prisma generate\` and \`npx prisma migrate dev\` to update your schema

## Common PostgreSQL Setup Issues

### PostgreSQL Not Installed
- Windows: Download and install from https://www.postgresql.org/download/windows/
- macOS: Use Homebrew with \`brew install postgresql\`
- Linux: Use \`apt install postgresql\` or equivalent for your distribution

### PostgreSQL Service Not Running
- Windows: Check Services app, look for "PostgreSQL" service
- macOS: Run \`brew services start postgresql\`
- Linux: Run \`sudo service postgresql start\` or \`sudo systemctl start postgresql\`

### Wrong Credentials
The default connection string uses:
- Username: postgres
- Password: password
- Host: localhost
- Port: 5432
- Database: statuspage

Update these in your .env file if your configuration is different.

### Port Conflicts
If another service is using port 5432, configure PostgreSQL to use a different port and update your connection string.
`;
    
    fs.writeFileSync(troubleshootingPath, troubleshootingContent);
    console.log('✅ Created PostgreSQL troubleshooting guide at:', troubleshootingPath);
    
  } catch (error) {
    console.error('❌ Error configuring SQLite fallback:', error.message);
  }
};

// Check if port is already in use
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${port} is already in use`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
};

// Install backend dependencies
const installDependencies = () => {
  return new Promise((resolve, reject) => {
    console.log('📦 Installing backend dependencies...');
    
    const npm = spawn('npm', ['install'], { cwd: backendDirectory });
    
    npm.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    
    npm.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });
    
    npm.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Backend dependencies installed successfully');
        resolve();
      } else {
        console.error(`❌ Failed to install backend dependencies (exit code: ${code})`);
        reject();
      }
    });
  });
};

// Generate Prisma client
const generatePrisma = () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Generating Prisma client...');
    
    try {
      // Instead of using spawn with npx, use execSync with npm script
      execSync('npm run prisma:generate', { 
        cwd: backendDirectory, 
        stdio: 'inherit'
      });
      
      console.log('✅ Prisma client generated successfully');
      resolve();
    } catch (error) {
      console.error('❌ Failed to generate Prisma client with npm script');
      console.log('🔄 Trying alternative method...');
      
      try {
        // Alternative method: direct call to node_modules/.bin/prisma
        const prismaBinPath = path.join(backendDirectory, 'node_modules', '.bin', 'prisma');
        
        if (fs.existsSync(prismaBinPath)) {
          console.log('🔍 Found Prisma binary at:', prismaBinPath);
          execSync(`"${prismaBinPath}" generate`, { 
            cwd: backendDirectory, 
            stdio: 'inherit'
          });
          console.log('✅ Prisma client generated successfully with alternative method');
          resolve();
        } else {
          console.error('❌ Prisma binary not found at:', prismaBinPath);
          
          // Last resort: try direct module resolution
          console.log('🔄 Trying direct module resolution...');
          execSync('node ./node_modules/prisma/build/index.js generate', { 
            cwd: backendDirectory, 
            stdio: 'inherit'
          });
          console.log('✅ Prisma client generated successfully with direct module resolution');
          resolve();
        }
      } catch (alternativeError) {
        console.error('❌ All methods to generate Prisma client failed');
        console.error('Error details:', alternativeError.message);
        console.log('');
        console.log('Please try manually running the following command in your status-backend directory:');
        console.log('npm run prisma:generate');
        reject(alternativeError);
      }
    }
  });
};

// Start backend server
const startBackend = () => {
  console.log('🚀 Starting backend server...');
  
  const npm = spawn('npm', ['run', 'dev'], { cwd: backendDirectory });
  
  npm.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(output);
    
    // Check for successful server start
    if (output.includes('Server running on port')) {
      console.log('✅ Backend server started successfully');
    }
  });
  
  npm.stderr.on('data', (data) => {
    console.error(data.toString().trim());
  });
  
  npm.on('close', (code) => {
    console.error(`❌ Backend server exited with code ${code}`);
    process.exit(code);
  });
};

// Main function
const main = async () => {
  console.log('🔍 Starting backend server setup...');
  
  // Setup environment file
  setupEnvFile();
  
  // Check if port is available
  const portAvailable = await checkPort(backendPort);
  if (!portAvailable) {
    console.error(`❌ Port ${backendPort} is already in use. Please close the application using this port or change the PORT in .env file.`);
    process.exit(1);
  }
  
  // Check database and configure fallback if needed
  const { usingFallback } = await checkAndConfigureDatabase();
  
  try {
    // Install dependencies if needed
    const nodeModulesPath = path.join(backendDirectory, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      await installDependencies();
    }
    
    try {
      // Generate Prisma client
      await generatePrisma();
      
      // If using SQLite fallback, run an initial migration
      if (usingFallback) {
        console.log('🔄 Setting up SQLite database...');
        try {
          execSync('npx prisma migrate dev --name initial_sqlite_setup --create-only', {
            cwd: backendDirectory,
            stdio: 'inherit'
          });
          console.log('✅ SQLite database initialized');
        } catch (err) {
          console.log('⚠️ Could not create initial migration, but continuing anyway');
          console.log('You may need to manually run: npx prisma migrate dev');
        }
      }
    } catch (prismaError) {
      console.log('⚠️ Warning: Failed to generate Prisma client, but will attempt to start the server anyway');
      console.log('You may encounter database-related errors when starting the application');
    }
    
    // Start backend server
    startBackend();
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
};

// Run the main function
main();

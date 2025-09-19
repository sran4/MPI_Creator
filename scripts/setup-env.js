const fs = require('fs');
const path = require('path');

function createEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');

  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env.local file already exists');
    return;
  }

  // Create .env.local with default values
  const envContent = `# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/mpi-creator

# JWT Secret (change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Optional: MongoDB Atlas connection (uncomment and replace with your Atlas URI)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mpi-creator?retryWrites=true&w=majority
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file with default configuration');
    console.log(
      '📝 Please update the MONGODB_URI and JWT_SECRET values as needed'
    );
    console.log('🔧 File location:', envPath);
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error);
  }
}

createEnvFile();

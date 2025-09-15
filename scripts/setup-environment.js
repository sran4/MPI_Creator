const fs = require('fs')
const path = require('path')

function createEnvFile() {
  const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mpi-creator

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here`

  const envPath = path.join(process.cwd(), '.env.local')
  
  try {
    // Check if .env.local already exists
    if (fs.existsSync(envPath)) {
      console.log('⚠️  .env.local file already exists')
      console.log('📄 Current content:')
      console.log('=====================================')
      console.log(fs.readFileSync(envPath, 'utf8'))
      console.log('=====================================')
      return false
    }
    
    // Create .env.local file
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Created .env.local file successfully!')
    console.log('')
    console.log('📄 Environment variables set:')
    console.log('=====================================')
    console.log('MONGODB_URI=mongodb://localhost:27017/mpi-creator')
    console.log('JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random')
    console.log('NEXTAUTH_URL=http://localhost:3000')
    console.log('NEXTAUTH_SECRET=your-nextauth-secret-key-here')
    console.log('=====================================')
    return true
    
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message)
    return false
  }
}

function checkMongoDB() {
  console.log('')
  console.log('🔍 Checking MongoDB Setup...')
  console.log('=====================================')
  
  console.log('📋 To use this application, you need MongoDB running.')
  console.log('')
  console.log('🛠️  MongoDB Setup Options:')
  console.log('')
  console.log('Option 1: Install MongoDB Locally')
  console.log('1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community')
  console.log('2. Install and start MongoDB service')
  console.log('3. MongoDB will run on: mongodb://localhost:27017')
  console.log('')
  console.log('Option 2: Use MongoDB Atlas (Cloud)')
  console.log('1. Go to: https://www.mongodb.com/atlas')
  console.log('2. Create a free account and cluster')
  console.log('3. Get your connection string')
  console.log('4. Update MONGODB_URI in .env.local with your Atlas connection string')
  console.log('')
  console.log('Option 3: Use Docker')
  console.log('1. Install Docker Desktop')
  console.log('2. Run: docker run -d -p 27017:27017 --name mongodb mongo:latest')
  console.log('')
  console.log('⚠️  After setting up MongoDB, run:')
  console.log('   node scripts/create-admin.js')
}

function main() {
  console.log('🚀 Environment Setup for MPI Creator')
  console.log('=====================================')
  
  const envCreated = createEnvFile()
  
  if (envCreated) {
    console.log('')
    console.log('✅ Environment file created successfully!')
    console.log('')
    console.log('🎯 Next Steps:')
    console.log('=====================================')
    console.log('1. Set up MongoDB (see instructions below)')
    console.log('2. Run: node scripts/create-admin.js')
    console.log('3. Start the app: npm run dev')
    console.log('4. Login at: http://localhost:3000/login')
  }
  
  checkMongoDB()
}

main()

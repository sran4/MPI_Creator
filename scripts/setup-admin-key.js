const fs = require('fs')
const path = require('path')

// Default admin signup key
const defaultAdminKey = 'ADMIN_MPI_2024'

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')

function setupAdminKey() {
  try {
    console.log('🔧 Setting up Admin Signup Key...')
    
    let envContent = ''
    let adminKeyExists = false
    
    // Read existing .env.local if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
      adminKeyExists = envContent.includes('ADMIN_SIGNUP_KEY')
    }
    
    if (adminKeyExists) {
      console.log('✅ ADMIN_SIGNUP_KEY already exists in .env.local')
      console.log('📝 Current admin signup key is configured')
    } else {
      // Add ADMIN_SIGNUP_KEY to .env.local
      const newEnvLine = `\n# Admin Signup Key (change this for security)\nADMIN_SIGNUP_KEY=${defaultAdminKey}\n`
      
      if (envContent) {
        envContent += newEnvLine
      } else {
        envContent = `# MPI Creator Environment Variables\n${newEnvLine}`
      }
      
      fs.writeFileSync(envPath, envContent)
      console.log('✅ Added ADMIN_SIGNUP_KEY to .env.local')
      console.log(`🔑 Default admin key: ${defaultAdminKey}`)
    }
    
    console.log('\n📋 Admin Signup Setup Complete!')
    console.log('=====================================')
    console.log('🔐 Admin Signup Key:', defaultAdminKey)
    console.log('🌐 Admin Signup URL: /admin/signup')
    console.log('⚠️  Security Note: Change the admin key in production!')
    console.log('\n📖 Usage Instructions:')
    console.log('1. Navigate to /admin/signup')
    console.log('2. Enter the admin key:', defaultAdminKey)
    console.log('3. Provide email and secure password')
    console.log('4. Create admin account')
    
  } catch (error) {
    console.error('❌ Error setting up admin key:', error)
  }
}

setupAdminKey()

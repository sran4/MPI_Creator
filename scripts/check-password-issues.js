const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

// Import models
const Engineer = require('../models/Engineer')
const Admin = require('../models/Admin')

async function checkPasswordIssues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check engineers
    console.log('\n=== Checking Engineers ===')
    const engineers = await Engineer.find({})
    console.log(`Found ${engineers.length} engineers`)

    for (const engineer of engineers) {
      console.log(`\nEngineer: ${engineer.email}`)
      console.log(`- Full Name: ${engineer.fullName}`)
      console.log(`- Title: ${engineer.title}`)
      console.log(`- Is Active: ${engineer.isActive}`)
      console.log(`- Password Length: ${engineer.password.length}`)
      console.log(`- Created: ${engineer.createdAt}`)
      
      // Test password comparison with a dummy password
      try {
        const testResult = await engineer.comparePassword('test123')
        console.log(`- Password comparison test: ${testResult}`)
      } catch (error) {
        console.log(`- Password comparison error: ${error.message}`)
      }
    }

    // Check admins
    console.log('\n=== Checking Admins ===')
    const admins = await Admin.find({})
    console.log(`Found ${admins.length} admins`)

    for (const admin of admins) {
      console.log(`\nAdmin: ${admin.email}`)
      console.log(`- Full Name: ${admin.fullName}`)
      console.log(`- Password Length: ${admin.password.length}`)
      console.log(`- Created: ${admin.createdAt}`)
      
      // Test password comparison with a dummy password
      try {
        const testResult = await admin.comparePassword('test123')
        console.log(`- Password comparison test: ${testResult}`)
      } catch (error) {
        console.log(`- Password comparison error: ${error.message}`)
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

checkPasswordIssues()

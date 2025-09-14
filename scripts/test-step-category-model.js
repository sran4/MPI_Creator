const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Test the StepCategory model import
const testModelImport = async () => {
  try {
    console.log('Testing StepCategory model import...')
    
    // Try to import the model
    const StepCategory = require('../models/StepCategory').default
    console.log('StepCategory model imported successfully')
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    // Try to find a category
    const categories = await StepCategory.find({})
    console.log('Found categories:', categories.length)
    
    // Try to create a simple test
    console.log('Model test completed successfully')
    
  } catch (error) {
    console.error('Error testing model:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

testModelImport()

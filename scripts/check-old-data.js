const mongoose = require('mongoose')
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')

async function checkOldData() {
  try {
    console.log('🔍 Checking old model data...')
    
    // Get the database connection
    const db = mongoose.connection.db
    
    // Check StepCategorySimple collection
    const stepCategorySimpleCollection = db.collection('stepcategorysimples')
    const stepCategorySimpleCount = await stepCategorySimpleCollection.countDocuments()
    
    console.log(`📊 StepCategorySimple collection: ${stepCategorySimpleCount} documents`)
    
    if (stepCategorySimpleCount > 0) {
      const sampleDocs = await stepCategorySimpleCollection.find({}).limit(3).toArray()
      console.log('📄 Sample documents from StepCategorySimple:')
      sampleDocs.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.categoryName} (${doc.steps?.length || 0} steps)`)
      })
    }
    
    // Check StepCategory collection
    const stepCategoryCollection = db.collection('stepcategories')
    const stepCategoryCount = await stepCategoryCollection.countDocuments()
    
    console.log(`📊 StepCategory collection: ${stepCategoryCount} documents`)
    
    if (stepCategoryCount > 0) {
      const sampleDocs = await stepCategoryCollection.find({}).limit(3).toArray()
      console.log('📄 Sample documents from StepCategory:')
      sampleDocs.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.categoryName} (${doc.steps?.length || 0} steps)`)
      })
    }
    
    // Check GlobalSteps collection
    const globalStepsCollection = db.collection('globalsteps')
    const globalStepsCount = await globalStepsCollection.countDocuments()
    
    console.log(`📊 GlobalSteps collection: ${globalStepsCount} documents`)
    
    if (globalStepsCount > 0) {
      const sampleDocs = await globalStepsCollection.find({}).limit(3).toArray()
      console.log('📄 Sample documents from GlobalSteps:')
      sampleDocs.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.title} (${doc.categoryName})`)
      })
    }
    
    console.log('\n📋 Summary:')
    console.log(`- StepCategorySimple: ${stepCategorySimpleCount} documents`)
    console.log(`- StepCategory: ${stepCategoryCount} documents`)
    console.log(`- GlobalSteps: ${globalStepsCount} documents`)
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  } finally {
    mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

checkOldData()

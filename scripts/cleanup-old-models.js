const mongoose = require('mongoose')
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')

async function cleanupOldModels() {
  try {
    console.log('🧹 Starting cleanup of old models...')
    
    // Get the database connection
    const db = mongoose.connection.db
    
    // List all collections
    const collections = await db.listCollections().toArray()
    console.log('📋 Current collections:', collections.map(c => c.name))
    
    // Check if StepCategorySimple collection exists
    const stepCategorySimpleExists = collections.some(c => c.name === 'stepcategorysimples')
    
    if (stepCategorySimpleExists) {
      console.log('🗑️  Found old StepCategorySimple collection')
      
      // Drop the old collection
      await db.collection('stepcategorysimples').drop()
      console.log('✅ Dropped stepcategorysimples collection')
    } else {
      console.log('ℹ️  No StepCategorySimple collection found')
    }
    
    // List collections after cleanup
    const collectionsAfter = await db.listCollections().toArray()
    console.log('📋 Collections after cleanup:', collectionsAfter.map(c => c.name))
    
    console.log('🎉 Cleanup completed successfully!')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  } finally {
    mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

cleanupOldModels()

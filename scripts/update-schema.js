const mongoose = require('mongoose')
require('dotenv').config()

async function updateSchema() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Get the database connection
    const db = mongoose.connection.db

    // Drop the existing GlobalSteps collection to force schema refresh
    // WARNING: This will delete all existing global steps
    console.log('Dropping existing GlobalSteps collection...')
    await db.collection('globalsteps').drop()
    console.log('GlobalSteps collection dropped successfully')

    console.log('Schema update completed! The new schema will be applied when the application starts.')

  } catch (error) {
    if (error.code === 26) {
      console.log('GlobalSteps collection does not exist yet - this is normal for new databases')
    } else {
      console.error('Error updating schema:', error)
    }
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the update
updateSchema()

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

async function backupCollections() {
  try {
    console.log('💾 Starting database backup...')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas')
    
    // Get the database connection
    const db = mongoose.connection.db
    
    // Create backup directory
    const backupDir = path.join(__dirname, '..', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    // Create timestamp for backup folder
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(backupDir, `backup-${timestamp}`)
    fs.mkdirSync(backupPath, { recursive: true })
    
    console.log(`📁 Backup directory: ${backupPath}`)
    
    // List all collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    console.log(`📋 Found ${collectionNames.length} collections to backup`)
    
    // Backup each collection
    for (const collectionName of collectionNames) {
      try {
        console.log(`📄 Backing up collection: ${collectionName}`)
        
        const documents = await db.collection(collectionName).find({}).toArray()
        const backupFile = path.join(backupPath, `${collectionName}.json`)
        
        fs.writeFileSync(backupFile, JSON.stringify(documents, null, 2))
        console.log(`✅ Backed up ${documents.length} documents from ${collectionName}`)
        
      } catch (error) {
        console.error(`❌ Failed to backup ${collectionName}:`, error.message)
      }
    }
    
    // Create backup info file
    const backupInfo = {
      timestamp: new Date().toISOString(),
      database: db.databaseName,
      collections: collectionNames.map(name => ({
        name,
        count: 0 // We'll update this if needed
      }))
    }
    
    // Update collection counts
    for (const collection of backupInfo.collections) {
      try {
        collection.count = await db.collection(collection.name).countDocuments()
      } catch (error) {
        collection.count = 'error'
      }
    }
    
    fs.writeFileSync(
      path.join(backupPath, 'backup-info.json'), 
      JSON.stringify(backupInfo, null, 2)
    )
    
    console.log('\n🎉 Backup completed successfully!')
    console.log(`📁 Backup location: ${backupPath}`)
    console.log(`📊 Total collections backed up: ${collectionNames.length}`)
    
    return backupPath
    
  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw error
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Database connection closed')
  }
}

// Run backup if called directly
if (require.main === module) {
  backupCollections()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

module.exports = { backupCollections }

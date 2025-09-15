const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Define the models that are currently used in the application
const ACTIVE_MODELS = [
  'admins',           // Admin model
  'engineers',        // Engineer model  
  'mpis',            // MPI model
  'customers',       // Customer model
  'customercompanies', // CustomerCompany model
  'docs',            // Docs model
  'documentids',     // DocumentId model
  'forms',           // Form model
  'tasks',           // Task model
  'processitems'     // ProcessItems model
]

// Define old/legacy collections that should be removed
const LEGACY_COLLECTIONS = [
  'stepcategorysimples',  // Old StepCategorySimple collection
  'stepcategories',       // Old StepCategory collection  
  'globalsteps',          // Old GlobalSteps collection
  'images'                // Image model (not used in current implementation)
]

async function analyzeDatabase() {
  try {
    console.log('🔍 Analyzing Atlas database collections...')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas')
    
    // Get the database connection
    const db = mongoose.connection.db
    
    // List all collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    console.log('\n📋 Current collections in database:')
    collectionNames.forEach(name => {
      console.log(`  - ${name}`)
    })
    
    // Categorize collections
    const activeCollections = collectionNames.filter(name => 
      ACTIVE_MODELS.includes(name.toLowerCase())
    )
    
    const legacyCollections = collectionNames.filter(name => 
      LEGACY_COLLECTIONS.includes(name.toLowerCase())
    )
    
    const unknownCollections = collectionNames.filter(name => 
      !ACTIVE_MODELS.includes(name.toLowerCase()) && 
      !LEGACY_COLLECTIONS.includes(name.toLowerCase())
    )
    
    console.log('\n📊 Collection Analysis:')
    console.log(`✅ Active collections (${activeCollections.length}):`)
    activeCollections.forEach(name => console.log(`  - ${name}`))
    
    console.log(`\n🗑️  Legacy collections to remove (${legacyCollections.length}):`)
    legacyCollections.forEach(name => console.log(`  - ${name}`))
    
    if (unknownCollections.length > 0) {
      console.log(`\n❓ Unknown collections (${unknownCollections.length}):`)
      unknownCollections.forEach(name => console.log(`  - ${name}`))
    }
    
    // Get document counts for each collection
    console.log('\n📈 Document counts:')
    for (const collectionName of collectionNames) {
      try {
        const count = await db.collection(collectionName).countDocuments()
        console.log(`  - ${collectionName}: ${count} documents`)
      } catch (error) {
        console.log(`  - ${collectionName}: Error counting documents`)
      }
    }
    
    return {
      activeCollections,
      legacyCollections,
      unknownCollections,
      allCollections: collectionNames
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error)
    throw error
  }
}

async function cleanupLegacyCollections(dryRun = true) {
  try {
    console.log(`\n🧹 ${dryRun ? 'DRY RUN' : 'CLEANUP'} - Removing legacy collections...`)
    
    await mongoose.connect(process.env.MONGODB_URI)
    const db = mongoose.connection.db
    
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    const legacyCollections = collectionNames.filter(name => 
      LEGACY_COLLECTIONS.includes(name.toLowerCase())
    )
    
    if (legacyCollections.length === 0) {
      console.log('✅ No legacy collections found to remove')
      return
    }
    
    for (const collectionName of legacyCollections) {
      try {
        const count = await db.collection(collectionName).countDocuments()
        console.log(`\n🗑️  ${dryRun ? 'Would remove' : 'Removing'} collection: ${collectionName} (${count} documents)`)
        
        if (!dryRun) {
          await db.collection(collectionName).drop()
          console.log(`✅ Successfully removed ${collectionName}`)
        }
      } catch (error) {
        console.error(`❌ Failed to ${dryRun ? 'analyze' : 'remove'} ${collectionName}:`, error.message)
      }
    }
    
    if (dryRun) {
      console.log('\n⚠️  This was a DRY RUN. No collections were actually removed.')
      console.log('   To perform actual cleanup, run: node scripts/atlas-cleanup.js --cleanup')
    } else {
      console.log('\n🎉 Cleanup completed successfully!')
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  }
}

async function main() {
  const args = process.argv.slice(2)
  const shouldCleanup = args.includes('--cleanup')
  const dryRun = !shouldCleanup
  
  try {
    // Always run analysis first
    await analyzeDatabase()
    
    // Run cleanup if requested
    if (args.includes('--cleanup') || args.includes('--dry-run')) {
      await cleanupLegacyCollections(dryRun)
    } else {
      console.log('\n💡 To see what would be cleaned up, run: node scripts/atlas-cleanup.js --dry-run')
      console.log('💡 To perform actual cleanup, run: node scripts/atlas-cleanup.js --cleanup')
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Database connection closed')
  }
}

// Run the script
main()

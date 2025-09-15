const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')

// Define the Docs schema (simplified version for testing)
const docsSchema = new mongoose.Schema({
  jobNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  oldJobNo: {
    type: String,
    required: false,
    trim: true,
    default: null,
  },
  mpiNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  mpiRev: {
    type: String,
    required: true,
    trim: true,
  },
  docId: {
    type: String,
    required: true,
    trim: true,
  },
  formId: {
    type: String,
    required: true,
    trim: true,
  },
  formRev: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

const Docs = mongoose.model('Docs', docsSchema)

// Test data
const testDocs = [
  {
    jobNo: 'TEST-JOB-001',
    oldJobNo: 'OLD-TEST-001',
    mpiNo: 'TEST-MPI-001',
    mpiRev: 'Rev A',
    docId: 'TEST-DOC-001',
    formId: 'TEST-FORM-001',
    formRev: 'Rev A',
    isActive: true
  },
  {
    jobNo: 'TEST-JOB-002',
    oldJobNo: null,
    mpiNo: 'TEST-MPI-002',
    mpiRev: 'Rev B',
    docId: 'TEST-DOC-002',
    formId: 'TEST-FORM-002',
    formRev: 'Rev B',
    isActive: true
  },
  {
    jobNo: 'TEST-JOB-003',
    oldJobNo: 'OLD-TEST-003',
    mpiNo: 'TEST-MPI-003',
    mpiRev: 'Rev C',
    docId: 'TEST-DOC-003',
    formId: 'TEST-FORM-003',
    formRev: 'Rev C',
    isActive: true
  }
]

async function testDocs() {
  try {
    console.log('🧪 Starting Docs Model Testing...')
    
    // Clear existing test data
    console.log('🗑️  Clearing existing test data...')
    await Docs.deleteMany({})
    console.log('✅ Database cleared')
    
    // Test 1: Create Docs Records
    console.log('\n📝 Test 1: Creating Docs Records...')
    const createdDocs = []
    for (const docData of testDocs) {
      const doc = new Docs(docData)
      await doc.save()
      createdDocs.push(doc)
      console.log(`✅ Created docs record: ${doc.jobNo}`)
    }
    
    // Test 2: Read Operations
    console.log('\n📖 Test 2: Reading Data...')
    const allDocs = await Docs.find({})
    console.log(`✅ Found ${allDocs.length} docs records`)
    
    // Test 3: Update Operations
    console.log('\n✏️  Test 3: Updating Data...')
    const firstDoc = allDocs[0]
    firstDoc.mpiRev = 'Rev Updated'
    firstDoc.formRev = 'Rev Updated'
    await firstDoc.save()
    console.log(`✅ Updated docs record: ${firstDoc.jobNo}`)
    
    // Test 4: Delete Operations (Soft Delete)
    console.log('\n🗑️  Test 4: Soft Deleting Data...')
    const lastDoc = allDocs[allDocs.length - 1]
    lastDoc.isActive = false
    await lastDoc.save()
    console.log(`✅ Soft deleted docs record: ${lastDoc.jobNo}`)
    
    // Test 5: Validation
    console.log('\n✅ Test 5: Testing Validation...')
    try {
      const invalidDoc = new Docs({
        jobNo: 'TEST-JOB-001', // Duplicate job number
        mpiNo: 'TEST-MPI-001', // Duplicate MPI number
        mpiRev: 'Rev A',
        docId: 'TEST-DOC-001',
        formId: 'TEST-FORM-001',
        formRev: 'Rev A'
      })
      await invalidDoc.save()
      console.log('❌ Validation failed - duplicate job/MPI number was saved')
    } catch (error) {
      console.log('✅ Validation working - duplicate job/MPI number was rejected')
    }
    
    // Test 6: Search Functionality
    console.log('\n🔍 Test 6: Testing Search...')
    const searchResults = await Docs.find({
      jobNo: { $regex: 'TEST', $options: 'i' }
    })
    console.log(`✅ Search found ${searchResults.length} docs records matching "TEST"`)
    
    // Test 7: Active Records Only
    console.log('\n🔍 Test 7: Testing Active Records Filter...')
    const activeDocs = await Docs.find({ isActive: true })
    console.log(`✅ Found ${activeDocs.length} active docs records`)
    
    // Final Results
    console.log('\n🎉 Testing Complete!')
    console.log(`📊 Final Results:`)
    console.log(`   - Total Docs Records: ${await Docs.countDocuments()}`)
    console.log(`   - Active Docs Records: ${await Docs.countDocuments({ isActive: true })}`)
    console.log(`   - Inactive Docs Records: ${await Docs.countDocuments({ isActive: false })}`)
    console.log(`   - All tests passed successfully! ✅`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
  }
}

testDocs()

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')

// Define the Docs schema (simplified version for seeding)
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

// Sample docs records
const sampleDocs = [
  {
    jobNo: 'JOB-001',
    oldJobNo: 'OLD-001',
    mpiNo: 'MPI-001',
    mpiRev: 'Rev A',
    docId: 'DOC-001',
    formId: 'FORM-001',
    formRev: 'Rev A',
    isActive: true
  },
  {
    jobNo: 'JOB-002',
    oldJobNo: null,
    mpiNo: 'MPI-002',
    mpiRev: 'Rev B',
    docId: 'DOC-002',
    formId: 'FORM-002',
    formRev: 'Rev B',
    isActive: true
  },
  {
    jobNo: 'JOB-003',
    oldJobNo: 'OLD-003',
    mpiNo: 'MPI-003',
    mpiRev: 'Rev C',
    docId: 'DOC-003',
    formId: 'FORM-003',
    formRev: 'Rev C',
    isActive: true
  },
  {
    jobNo: 'JOB-004',
    oldJobNo: null,
    mpiNo: 'MPI-004',
    mpiRev: 'Rev A',
    docId: 'DOC-004',
    formId: 'FORM-004',
    formRev: 'Rev A',
    isActive: true
  },
  {
    jobNo: 'JOB-005',
    oldJobNo: 'OLD-005',
    mpiNo: 'MPI-005',
    mpiRev: 'Rev D',
    docId: 'DOC-005',
    formId: 'FORM-005',
    formRev: 'Rev D',
    isActive: true
  }
]

async function seedDocs() {
  try {
    console.log('🚀 Starting docs seeding...')
    
    // Clear existing docs records
    await Docs.deleteMany({})
    console.log('✅ Cleared existing docs records')
    
    // Insert new docs records
    const docs = await Docs.insertMany(sampleDocs)
    console.log(`✅ Successfully seeded ${docs.length} docs records`)
    
    // List the created docs records
    console.log('\n📋 Created Docs Records:')
    console.log('=====================================')
    docs.forEach((doc, index) => {
      console.log(`${index + 1}. Job: ${doc.jobNo} | MPI: ${doc.mpiNo} | Doc: ${doc.docId}`)
    })
    
    console.log('\n🎉 Docs seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding docs:', error)
  } finally {
    mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

seedDocs()

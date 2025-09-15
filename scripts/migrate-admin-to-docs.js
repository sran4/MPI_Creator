const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')

// Define the old Admin schema (with all fields)
const oldAdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  jobNo: {
    type: String,
    required: true,
    unique: true,
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
  },
  mpiRev: {
    type: String,
    required: true,
  },
  docId: {
    type: String,
    required: true,
  },
  formId: {
    type: String,
    required: true,
  },
  formRev: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Define the new Admin schema (simplified)
const newAdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
}, {
  timestamps: true,
})

// Define the new Docs schema
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

const OldAdmin = mongoose.model('OldAdmin', oldAdminSchema)
const NewAdmin = mongoose.model('NewAdmin', newAdminSchema)
const Docs = mongoose.model('Docs', docsSchema)

async function migrateAdminToDocs() {
  try {
    console.log('🚀 Starting Admin to Docs migration...')
    
    // Get all existing admin records
    const existingAdmins = await OldAdmin.find({})
    console.log(`📋 Found ${existingAdmins.length} admin records to migrate`)
    
    if (existingAdmins.length === 0) {
      console.log('ℹ️  No admin records found to migrate')
      return
    }
    
    // Create new admin records (without the moved fields)
    const newAdmins = []
    const docsRecords = []
    
    for (const admin of existingAdmins) {
      // Create new admin record with only email and password
      const newAdmin = new NewAdmin({
        email: admin.email,
        password: admin.password,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      })
      newAdmins.push(newAdmin)
      
      // Create docs record with the moved fields
      const docsRecord = new Docs({
        jobNo: admin.jobNo,
        oldJobNo: admin.oldJobNo,
        mpiNo: admin.mpiNo,
        mpiRev: admin.mpiRev,
        docId: admin.docId,
        formId: admin.formId,
        formRev: admin.formRev,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      })
      docsRecords.push(docsRecord)
    }
    
    // Save new admin records
    console.log('💾 Creating new admin records...')
    await NewAdmin.insertMany(newAdmins)
    console.log(`✅ Created ${newAdmins.length} new admin records`)
    
    // Save docs records
    console.log('📄 Creating docs records...')
    await Docs.insertMany(docsRecords)
    console.log(`✅ Created ${docsRecords.length} docs records`)
    
    // List the migrated records
    console.log('\n📋 Migration Summary:')
    console.log('=====================================')
    newAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. Admin: ${admin.email}`)
    })
    
    console.log('\n📄 Docs Records:')
    console.log('=====================================')
    docsRecords.forEach((docs, index) => {
      console.log(`${index + 1}. Job: ${docs.jobNo} | MPI: ${docs.mpiNo} | Doc: ${docs.docId}`)
    })
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('⚠️  Note: You may need to manually update your application to use the new models')
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
  } finally {
    mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

migrateAdminToDocs()

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')

// Define the Admin schema (simplified version for seeding)
const AdminSchema = new mongoose.Schema({
  email: String,
  password: String,
}, {
  timestamps: true,
})

const Admin = mongoose.model('Admin', AdminSchema)

// Define the Docs schema
const DocsSchema = new mongoose.Schema({
  jobNo: String,
  oldJobNo: String,
  mpiNo: String,
  mpiRev: String,
  docId: String,
  formId: String,
  formRev: String,
  isActive: Boolean,
}, {
  timestamps: true,
})

const Docs = mongoose.model('Docs', DocsSchema)

async function deleteAllAdmins() {
  try {
    console.log('🗑️  Starting admin deletion...')
    
    // Check if there are any admins
    const adminCount = await Admin.countDocuments()
    if (adminCount === 0) {
      console.log('ℹ️  No admins found to delete')
      return
    }
    
    // List existing admins
    const existingAdmins = await Admin.find({}, 'email')
    console.log('📋 Existing admins:')
    existingAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email}`)
    })
    
    // Delete all admin records
    const adminResult = await Admin.deleteMany({})
    console.log(`✅ Deleted ${adminResult.deletedCount} admin record(s)`)
    
    // Delete all docs records
    const docsCount = await Docs.countDocuments()
    if (docsCount > 0) {
      const docsResult = await Docs.deleteMany({})
      console.log(`✅ Deleted ${docsResult.deletedCount} docs record(s)`)
    } else {
      console.log('ℹ️  No docs records found to delete')
    }
    
    console.log('🎉 All admin and docs data cleared successfully!')
    
  } catch (error) {
    console.error('❌ Error deleting admins:', error)
  } finally {
    mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

deleteAllAdmins()
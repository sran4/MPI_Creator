const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')

// Define the Admin schema (simplified version for seeding)
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
  },
}, {
  timestamps: true,
})

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const bcrypt = require('bcryptjs')
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

const Admin = mongoose.model('Admin', adminSchema)

// Define the Docs schema
const docsSchema = new mongoose.Schema({
  jobNo: {
    type: String,
    required: [true, 'Job number is required'],
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
    required: [true, 'MPI number is required'],
    unique: true,
    trim: true,
  },
  mpiRev: {
    type: String,
    required: [true, 'MPI revision is required'],
    trim: true,
  },
  docId: {
    type: String,
    required: [true, 'Document ID is required'],
    trim: true,
  },
  formId: {
    type: String,
    required: [true, 'Form ID is required'],
    trim: true,
  },
  formRev: {
    type: String,
    required: [true, 'Form revision is required'],
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

async function createDefaultAdmin() {
  try {
    console.log('🚀 Starting default admin creation...')
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@mpi-creator.com' })
    if (existingAdmin) {
      console.log('⚠️  Admin already exists with email: admin@mpi-creator.com')
      console.log('📧 Email: admin@mpi-creator.com')
      console.log('🔑 Password: admin123456')
      return
    }

    // Create admin
    const admin = new Admin({
      email: 'admin@mpi-creator.com',
      password: 'admin123456'
    })

    await admin.save()
    console.log('✅ Admin created successfully!')
    console.log('📧 Email: admin@mpi-creator.com')
    console.log('🔑 Password: admin123456')

    // Create default docs record
    const existingDocs = await Docs.findOne({ jobNo: 'ADMIN-001' })
    if (!existingDocs) {
      const docs = new Docs({
        jobNo: 'ADMIN-001',
        oldJobNo: null, // Optional field - no old job number
        mpiNo: 'MPI-ADMIN-001',
        mpiRev: 'Rev A',
        docId: 'DOC-ADMIN-001',
        formId: 'FORM-ADMIN-001',
        formRev: 'Rev A',
        isActive: true
      })

      await docs.save()
      console.log('✅ Default docs record created successfully!')
      console.log('📄 Job No: ADMIN-001')
      console.log('📄 MPI No: MPI-ADMIN-001')
      console.log('📄 Doc ID: DOC-ADMIN-001')
      console.log('📄 Form ID: FORM-ADMIN-001')
    } else {
      console.log('⚠️  Docs record already exists for ADMIN-001')
    }
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

createDefaultAdmin()
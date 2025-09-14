const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

// Define Admin schema inline since we can't import TypeScript models
const AdminSchema = new mongoose.Schema({
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
  jobNo: {
    type: String,
    required: [true, 'Job number is required'],
    unique: true,
  },
  mpiNo: {
    type: String,
    required: [true, 'MPI number is required'],
    unique: true,
  },
  mpiRev: {
    type: String,
    required: [true, 'MPI revision is required'],
  },
  docId: {
    type: String,
    required: [true, 'Document ID is required'],
  },
  formId: {
    type: String,
    required: [true, 'Form ID is required'],
  },
  formRev: {
    type: String,
    required: [true, 'Form revision is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Hash password before saving
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema)

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@mpi-generator.com' })
    if (existingAdmin) {
      console.log('Admin already exists!')
      process.exit(0)
    }

    // Create default admin
    const admin = new Admin({
      email: 'admin@mpi-generator.com',
      password: 'admin123456', // Change this in production!
      jobNo: 'ADMIN-001',
      mpiNo: 'MPI-ADMIN-001',
      mpiRev: 'Rev A',
      docId: 'DOC-ADMIN-001',
      formId: 'FORM-ADMIN-001',
      formRev: 'Rev A'
    })

    await admin.save()
    console.log('Admin created successfully!')
    console.log('Email: admin@mpi-generator.com')
    console.log('Password: admin123456')
    console.log('⚠️  Please change the password after first login!')

  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

createAdmin()

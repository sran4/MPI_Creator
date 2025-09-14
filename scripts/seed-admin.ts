import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Admin from '../models/Admin'

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!)
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

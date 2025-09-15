const mongoose = require('mongoose')
const readline = require('readline')
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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function listAdmins() {
  try {
    const admins = await Admin.find({}, 'email createdAt')
    console.log('\n📋 Current Admins:')
    console.log('=====================================')
    
    if (admins.length === 0) {
      console.log('No admins found.')
      return
    }
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Email: ${admin.email}`)
      console.log(`   Status: Active`)
      console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ Error listing admins:', error)
  }
}

async function createAdmin() {
  try {
    console.log('\n🆕 Creating New Admin')
    console.log('=====================================')
    
    const email = await askQuestion('📧 Email: ')
    const password = await askQuestion('🔑 Password (min 8 chars): ')
    
    // Validate required fields
    if (!email || !password) {
      console.log('❌ Email and password are required')
      return
    }
    
    if (password.length < 8) {
      console.log('❌ Password must be at least 8 characters')
      return
    }
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() })
    if (existingAdmin) {
      console.log('❌ Admin with this email already exists')
      return
    }
    
    const admin = new Admin({
      email: email.toLowerCase(),
      password: password
    })
    
    await admin.save()
    console.log('\n✅ Admin created successfully!')
    console.log('=====================================')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🔑 Password: ${password}`)
    console.log('')
    console.log('🌐 Login at: http://localhost:3000/login')

    // Ask if user wants to create docs record
    const createDocs = await askQuestion('\n📄 Do you want to create a docs record for this admin? (y/n): ')
    if (createDocs.toLowerCase() === 'y' || createDocs.toLowerCase() === 'yes') {
      await createDocsRecord()
    }
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  }
}

async function createDocsRecord() {
  try {
    console.log('\n📄 Creating Docs Record')
    console.log('=====================================')
    
    const jobNo = await askQuestion('💼 Job Number: ')
    const oldJobNo = await askQuestion('📋 Old Job Number (optional, press Enter to skip): ')
    const mpiNo = await askQuestion('📄 MPI Number: ')
    const mpiRev = await askQuestion('📄 MPI Revision: ')
    const docId = await askQuestion('📄 Document ID: ')
    const formId = await askQuestion('📄 Form ID: ')
    const formRev = await askQuestion('📄 Form Revision: ')
    
    // Validate required fields
    if (!jobNo || !mpiNo || !mpiRev || !docId || !formId || !formRev) {
      console.log('❌ All fields except Old Job Number are required')
      return
    }
    
    // Check if docs record already exists
    const existingDocs = await Docs.findOne({ 
      $or: [
        { jobNo: jobNo },
        { mpiNo: mpiNo }
      ]
    })
    
    if (existingDocs) {
      console.log('❌ Docs record with this Job Number or MPI Number already exists')
      return
    }
    
    const docs = new Docs({
      jobNo: jobNo,
      oldJobNo: oldJobNo || null,
      mpiNo: mpiNo,
      mpiRev: mpiRev,
      docId: docId,
      formId: formId,
      formRev: formRev
    })
    
    await docs.save()
    console.log('\n✅ Docs record created successfully!')
    console.log('=====================================')
    console.log(`💼 Job No: ${docs.jobNo}`)
    console.log(`📋 Old Job No: ${docs.oldJobNo || 'None'}`)
    console.log(`📄 MPI No: ${docs.mpiNo}`)
    console.log(`📄 MPI Rev: ${docs.mpiRev}`)
    console.log(`📄 Doc ID: ${docs.docId}`)
    console.log(`📄 Form ID: ${docs.formId}`)
    console.log(`📄 Form Rev: ${docs.formRev}`)
    
  } catch (error) {
    console.error('❌ Error creating docs record:', error)
  }
}

async function deleteAllAdmins() {
  try {
    const confirm = await askQuestion('⚠️  Are you sure you want to delete ALL admins? This cannot be undone! (type "DELETE" to confirm): ')
    
    if (confirm !== 'DELETE') {
      console.log('❌ Operation cancelled')
      return
    }
    
    const result = await Admin.deleteMany({})
    console.log(`✅ Deleted ${result.deletedCount} admin(s)`)
    
    // Also delete all docs records
    const docsResult = await Docs.deleteMany({})
    console.log(`✅ Deleted ${docsResult.deletedCount} docs record(s)`)
    
  } catch (error) {
    console.error('❌ Error deleting admins:', error)
  }
}

async function showMenu() {
  console.log('\n🔧 Admin Management Tool')
  console.log('=====================================')
  console.log('1. List all admins')
  console.log('2. Create new admin')
  console.log('3. Create docs record')
  console.log('4. Delete all admins')
  console.log('5. Exit')
  console.log('=====================================')
  
  const choice = await askQuestion('Choose an option (1-5): ')
  
  switch (choice) {
    case '1':
      await listAdmins()
      break
    case '2':
      await createAdmin()
      break
    case '3':
      await createDocsRecord()
      break
    case '4':
      await deleteAllAdmins()
      break
    case '5':
      console.log('👋 Goodbye!')
      rl.close()
      mongoose.connection.close()
      return
    default:
      console.log('❌ Invalid option. Please choose 1-5.')
  }
  
  // Show menu again
  await showMenu()
}

async function main() {
  try {
    console.log('🚀 Starting Admin Management Tool...')
    await showMenu()
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    rl.close()
    mongoose.connection.close()
  }
}

main()
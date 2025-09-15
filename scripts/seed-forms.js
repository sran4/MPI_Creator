const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')

// Define Form schema
const formSchema = new mongoose.Schema({
  formId: {
    type: String,
    required: [true, 'Form ID is required'],
    trim: true,
    maxlength: [50, 'Form ID cannot exceed 50 characters'],
  },
  formRev: {
    type: String,
    required: [true, 'Form revision is required'],
    trim: true,
    maxlength: [20, 'Form revision cannot exceed 20 characters'],
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Clear model cache
if (mongoose.models.Form) {
  delete mongoose.models.Form
}

const Form = mongoose.model('Form', formSchema)

const sampleForms = [
  {
    formId: 'FORM-001',
    formRev: 'Rev A',
    description: 'Standard Manufacturing Process Form'
  },
  {
    formId: 'FORM-001',
    formRev: 'Rev B',
    description: 'Updated Manufacturing Process Form'
  },
  {
    formId: 'FORM-002',
    formRev: 'Rev A',
    description: 'Quality Control Checklist'
  },
  {
    formId: 'FORM-003',
    formRev: 'Rev A',
    description: 'Safety Inspection Form'
  },
  {
    formId: 'FORM-003',
    formRev: 'Rev B',
    description: 'Updated Safety Inspection Form'
  },
  {
    formId: 'FORM-004',
    formRev: 'Rev A',
    description: 'Equipment Maintenance Log'
  },
  {
    formId: 'FORM-005',
    formRev: 'Rev A',
    description: 'Material Receipt Form'
  },
  {
    formId: 'FORM-006',
    formRev: 'Rev A',
    description: 'Production Report Form'
  },
  {
    formId: 'FORM-007',
    formRev: 'Rev A',
    description: 'Non-Conformance Report'
  },
  {
    formId: 'FORM-008',
    formRev: 'Rev A',
    description: 'Training Record Form'
  }
]

async function seedForms() {
  try {
    console.log('🌱 Seeding Forms...')
    
    // Clear existing forms
    await Form.deleteMany({})
    console.log('✅ Cleared existing forms')
    
    // Create new forms
    const createdForms = []
    for (const formData of sampleForms) {
      const form = new Form(formData)
      await form.save()
      createdForms.push(form)
      console.log(`✅ Created form: ${form.formId} - ${form.formRev}`)
    }
    
    console.log('\n🎉 Forms Seeding Complete!')
    console.log('=====================================')
    console.log(`📊 Created ${createdForms.length} forms`)
    console.log('=====================================')
    
    createdForms.forEach((form, index) => {
      console.log(`${index + 1}. ${form.formId} - ${form.formRev} | ${form.description}`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding forms:', error)
  } finally {
    mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
  }
}

seedForms()

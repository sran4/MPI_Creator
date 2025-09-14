const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Define the schema inline
const StepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

const StepCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    enum: [
      'Applicable Documents',
      'General Instructions',
      'Kit Release',
      'SMT Preparation/Planning',
      'Paste Print',
      'Reflow',
      'First Article Approval',
      'SMT Additional Instructions',
      'Production Quantity Approval',
      'Wave Solder',
      'Through Hole Stuffing',
      '2nd Operations',
      'Selective Solder',
      'Wash and Dry',
      'Flying Probe Test',
      'AOI Test',
      'TH Stuffing',
      'Final QC',
      'Shipping and Delivery',
      'Packaging'
    ],
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  steps: [StepSchema],
  isGlobal: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel',
    required: true,
  },
  createdByModel: {
    type: String,
    enum: ['Engineer', 'Admin'],
    required: true,
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

const StepCategory = mongoose.model('StepCategory', StepCategorySchema)

const testStepSaving = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Test creating a new step in an existing category
    const category = await StepCategory.findOne({ categoryName: 'Kit Release' })
    if (!category) {
      console.log('Kit Release category not found')
      return
    }

    console.log('Found category:', category.categoryName)
    console.log('Current steps count:', category.steps.length)

    // Add a test step
    const newStep = {
      title: 'Test Step',
      content: 'This is a test step content',
      order: category.steps.length,
      isActive: true
    }

    category.steps.push(newStep)
    await category.save()

    console.log('Step added successfully!')
    console.log('New steps count:', category.steps.length)

  } catch (error) {
    console.error('Error testing step saving:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

testStepSaving()
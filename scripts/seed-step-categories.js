const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Define the schema inline since we can't import TypeScript models in JS
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
    maxlength: 100,
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

// Sample categories with steps
const sampleCategories = [
  {
    categoryName: 'Applicable Documents',
    steps: [
      {
        title: 'Engineering Drawings Review',
        content: 'Review all engineering drawings for the assembly. Verify part numbers, dimensions, and specifications.',
        order: 1,
        isActive: true
      },
      {
        title: 'Bill of Materials Check',
        content: 'Verify all components against the bill of materials. Check for correct part numbers and quantities.',
        order: 2,
        isActive: true
      }
    ],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'General Instructions',
    steps: [
      {
        title: 'Safety Protocol',
        content: 'Follow all safety protocols and wear appropriate personal protective equipment.',
        order: 1,
        isActive: true
      },
      {
        title: 'Work Area Setup',
        content: 'Ensure work area is clean and well-lit. Keep emergency exits clear.',
        order: 2,
        isActive: true
      }
    ],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Kit Release',
    steps: [
      {
        title: 'Component Verification',
        content: 'Verify all components against the bill of materials. Check for correct part numbers and quantities.',
        order: 1,
        isActive: true
      },
      {
        title: 'Component Inspection',
        content: 'Inspect components for damage or defects. Ensure all components are properly labeled.',
        order: 2,
        isActive: true
      }
    ],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  }
]

async function seedStepCategories() {
  try {
    console.log('Starting step categories seeding...')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')
    console.log('Connected to MongoDB')
    
    // Clear existing categories
    await StepCategory.deleteMany({})
    console.log('Cleared existing step categories')
    
    // Insert new categories
    const categories = await StepCategory.insertMany(sampleCategories)
    console.log(`Successfully seeded ${categories.length} step categories`)
    
    // List the created categories
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.categoryName} (${category.steps.length} steps)`)
    })
    
  } catch (error) {
    console.error('Error seeding step categories:', error)
  } finally {
    mongoose.connection.close()
    console.log('Database connection closed')
  }
}

seedStepCategories()
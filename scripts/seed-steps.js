const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')

// Define the schemas inline since we can't import TypeScript models in JS
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
        content: 'Review all engineering drawings for the assembly. Verify part numbers, dimensions, and specifications. Check for any revisions or updates. Ensure all required drawings are present and legible. Contact engineering if any discrepancies are found.',
        order: 1,
        isActive: true
      },
      {
        title: 'Bill of Materials Check',
        content: 'Verify all components against the bill of materials. Check for correct part numbers and quantities. Inspect components for damage or defects. Ensure all components are properly labeled and stored. Report any missing or damaged components immediately.',
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
        content: 'Follow all safety protocols and wear appropriate personal protective equipment. Ensure work area is clean and well-lit. Report any safety concerns immediately. Use proper lifting techniques for heavy components. Keep emergency exits clear at all times.',
        order: 1,
        isActive: true
      },
      {
        title: 'Work Area Setup',
        content: 'Ensure work area is clean and well-lit. Keep emergency exits clear. Organize tools and materials for easy access. Check that all safety equipment is in place and functional. Verify that all required documentation is available.',
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
        content: 'Verify all components against the bill of materials. Check for correct part numbers and quantities. Inspect components for damage or defects. Ensure all components are properly labeled and stored. Report any missing or damaged components immediately.',
        order: 1,
        isActive: true
      },
      {
        title: 'Component Inspection',
        content: 'Inspect components for damage or defects. Check for proper labeling and packaging. Verify component specifications match requirements. Document any issues found during inspection. Ensure components are stored in appropriate conditions.',
        order: 2,
        isActive: true
      }
    ],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  }
]

async function seedSteps() {
  try {
    console.log('🚀 Starting step categories seeding...')
    
    // Clear existing categories
    await StepCategory.deleteMany({})
    console.log('✅ Cleared existing step categories')
    
    // Insert new categories
    const categories = await StepCategory.insertMany(sampleCategories)
    console.log(`✅ Successfully seeded ${categories.length} step categories`)
    
    // List the created categories
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.categoryName} (${category.steps.length} steps)`)
    })
    
    console.log('🎉 Step categories seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding step categories:', error)
  } finally {
    mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

seedSteps()
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

async function testStepSaving() {
  try {
    console.log('🧪 Testing Step Saving...')
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')
    console.log('✅ Connected to MongoDB')
    
    // Test data
    const testData = {
      categoryName: 'Test Category',
      stepTitle: 'Test Step',
      stepContent: 'This is a test step content for testing the step saving functionality.',
      description: 'Test description'
    }
    
    console.log('📝 Test data:', testData)
    
    // Find or create the category
    let category = await StepCategory.findOne({ categoryName: testData.categoryName })
    
    if (!category) {
      console.log('📁 Creating new category...')
      const placeholderUserId = new mongoose.Types.ObjectId()
      
      category = new StepCategory({
        categoryName: testData.categoryName,
        steps: [],
        createdBy: placeholderUserId,
        createdByModel: 'Engineer',
        usageCount: 0,
        isActive: true
      })
      console.log('✅ New category created')
    } else {
      console.log('📁 Found existing category')
    }
    
    // Add the new step to the category
    console.log('📝 Adding step to category...')
    const newStep = {
      title: testData.stepTitle,
      content: testData.stepContent,
      order: category.steps.length,
      isActive: true
    }
    
    category.steps.push(newStep)
    await category.save()
    console.log('✅ Step added and category saved successfully')
    
    // Verify the step was saved
    const savedCategory = await StepCategory.findOne({ categoryName: testData.categoryName })
    console.log('🔍 Verification:')
    console.log(`   - Category: ${savedCategory.categoryName}`)
    console.log(`   - Steps count: ${savedCategory.steps.length}`)
    console.log(`   - Last step title: ${savedCategory.steps[savedCategory.steps.length - 1].title}`)
    console.log(`   - Last step content: ${savedCategory.steps[savedCategory.steps.length - 1].content}`)
    
    console.log('🎉 Test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

testStepSaving()
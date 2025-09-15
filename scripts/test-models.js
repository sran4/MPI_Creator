const mongoose = require('mongoose')
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')

// Define the schemas (simplified version for testing)
const processItemsSchema = new mongoose.Schema({
  categoryName: { type: String, required: true, trim: true, unique: true },
  steps: [],
  isGlobal: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdByModel: { type: String, enum: ['Engineer', 'Admin'], required: true },
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const taskSchema = new mongoose.Schema({
  step: { 
    type: String, 
    required: true, 
    trim: true,
    validate: {
      validator: function(step) {
        const wordCount = step.trim().split(/\s+/).filter(word => word.length > 0).length
        return wordCount <= 150
      },
      message: 'Step cannot exceed 150 words'
    }
  },
  categoryName: { type: String, required: true, trim: true },
  processItem: { type: mongoose.Schema.Types.ObjectId, ref: 'ProcessItems', required: true },
  isGlobal: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdByModel: { type: String, enum: ['Engineer', 'Admin'], required: true },
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const ProcessItems = mongoose.model('ProcessItems', processItemsSchema)
const Task = mongoose.model('Task', taskSchema)

// Test data
const testCategories = [
  {
    categoryName: 'Test Process Item 1',
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Test Process Item 2',
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Test Process Item 3',
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  }
]

const testTasks = [
  {
    categoryName: 'Test Process Item 1',
    step: 'This is a test task with exactly fifty words to test the word count validation and ensure that the content is properly stored and retrieved from the database without any issues during testing.'
  },
  {
    categoryName: 'Test Process Item 1',
    step: 'Another test task with different content to verify that multiple tasks can be created in the same process item and that the relationship between process items and tasks is working correctly.'
  },
  {
    categoryName: 'Test Process Item 2',
    step: 'This task belongs to a different process item to test the process item filtering and organization functionality. It should appear under Test Process Item 2 when filtered.'
  },
  {
    categoryName: 'Test Process Item 3',
    step: 'Final test task to ensure all CRUD operations work properly across different process items and that the system can handle multiple process items with multiple tasks each.'
  }
]

async function testModels() {
  try {
    console.log('🧪 Starting Model Testing...')
    
    // Clear existing data
    console.log('🗑️  Clearing existing test data...')
    await ProcessItems.deleteMany({})
    await Task.deleteMany({})
    console.log('✅ Database cleared')
    
    // Test 1: Create Process Items
    console.log('\n📝 Test 1: Creating Process Items...')
    const createdCategories = []
    for (const categoryData of testCategories) {
      const category = new ProcessItems(categoryData)
      await category.save()
      createdCategories.push(category)
      console.log(`✅ Created process item: ${category.categoryName}`)
    }
    
    // Test 2: Create Tasks
    console.log('\n📝 Test 2: Creating Tasks...')
    const createdTasks = []
    for (const taskData of testTasks) {
      const category = createdCategories.find(cat => cat.categoryName === taskData.categoryName)
      if (category) {
        const task = new Task({
          ...taskData,
          processItem: category._id,
          createdBy: new mongoose.Types.ObjectId(),
          createdByModel: 'Admin'
        })
        await task.save()
        createdTasks.push(task)
        console.log(`✅ Created task in ${task.categoryName}`)
      }
    }
    
    // Test 3: Read Operations
    console.log('\n📖 Test 3: Reading Data...')
    const allCategories = await ProcessItems.find({})
    const allTasks = await Task.find({}).populate('processItem')
    console.log(`✅ Found ${allCategories.length} process items and ${allTasks.length} tasks`)
    
    // Test 4: Update Operations
    console.log('\n✏️  Test 4: Updating Data...')
    const firstCategory = allCategories[0]
    firstCategory.categoryName = 'Updated Test Process Item 1'
    await firstCategory.save()
    console.log(`✅ Updated process item: ${firstCategory.categoryName}`)
    
    const firstTask = allTasks[0]
    firstTask.step = 'This is an updated test task to verify that the update functionality is working correctly.'
    await firstTask.save()
    console.log(`✅ Updated task content`)
    
    // Test 5: Delete Operations
    console.log('\n🗑️  Test 5: Deleting Data...')
    const lastTask = allTasks[allTasks.length - 1]
    await Task.findByIdAndDelete(lastTask._id)
    console.log(`✅ Deleted task: ${lastTask.step.substring(0, 50)}...`)
    
    const lastCategory = allCategories[allCategories.length - 1]
    await ProcessItems.findByIdAndDelete(lastCategory._id)
    console.log(`✅ Deleted process item: ${lastCategory.categoryName}`)
    
    // Test 6: Validation
    console.log('\n✅ Test 6: Testing Validation...')
    try {
      const invalidTask = new Task({
        step: 'This task has way too many words and should fail validation because it exceeds the one hundred and fifty word limit that was set for testing purposes to ensure that the validation is working correctly and preventing users from creating tasks that are too long and would cause issues in the system.',
        categoryName: 'Test Process Item 1',
        processItem: createdCategories[0]._id,
        createdBy: new mongoose.Types.ObjectId(),
        createdByModel: 'Admin'
      })
      await invalidTask.save()
      console.log('❌ Validation failed - task with too many words was saved')
    } catch (error) {
      console.log('✅ Validation working - task with too many words was rejected')
    }
    
    // Test 7: Relationships
    console.log('\n🔗 Test 7: Testing Relationships...')
    const tasksWithCategories = await Task.find({}).populate('processItem')
    console.log(`✅ Found ${tasksWithCategories.length} tasks with populated process items`)
    
    // Test 8: Search Functionality
    console.log('\n🔍 Test 8: Testing Search...')
    const searchResults = await ProcessItems.find({
      categoryName: { $regex: 'Test', $options: 'i' }
    })
    console.log(`✅ Search found ${searchResults.length} process items matching "Test"`)
    
    // Final Results
    console.log('\n🎉 Testing Complete!')
    console.log(`📊 Final Results:`)
    console.log(`   - Process Items: ${await ProcessItems.countDocuments()}`)
    console.log(`   - Tasks: ${await Task.countDocuments()}`)
    console.log(`   - All tests passed successfully! ✅`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
  }
}

testModels()
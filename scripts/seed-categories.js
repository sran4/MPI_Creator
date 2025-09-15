const mongoose = require('mongoose')
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')

// Define the schema (simplified version for seeding)
const processItemsSchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 100,
  },
  steps: [{
    title: String,
    content: String,
    order: Number,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  isGlobal: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdByModel: { type: String, enum: ['Engineer', 'Admin'], required: true },
  usageCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
})

const ProcessItems = mongoose.model('ProcessItems', processItemsSchema)

// Default categories
const defaultCategories = [
  {
    categoryName: 'Applicable Documents',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'General Instructions',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Kit Release',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'SMT Preparation/Planning',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Paste Print',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Reflow',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'First Article Approval',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'SMT Additional Instructions',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Wave Solder',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Through Hole Stuffing',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: '2nd Operations',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Selective Solder',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Wash and Dry',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Flying Probe Test',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Solder Paste Inspection',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Automatic Optical Inspection (AOI)',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Final QC',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Ship and Delivery',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Packaging',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  },
  {
    categoryName: 'Test',
    steps: [],
    createdBy: new mongoose.Types.ObjectId(),
    createdByModel: 'Admin'
  }
]

async function seedCategories() {
  try {
    console.log('Starting process items seeding...')
    
    // Clear existing categories
    await ProcessItems.deleteMany({})
    console.log('Cleared existing process items')
    
    // Insert new categories
    const categories = await ProcessItems.insertMany(defaultCategories)
    console.log(`Successfully seeded ${categories.length} process items`)
    
    // List the created categories
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.categoryName}`)
    })
    
  } catch (error) {
    console.error('Error seeding process items:', error)
  } finally {
    mongoose.connection.close()
    console.log('Database connection closed')
  }
}

seedCategories()
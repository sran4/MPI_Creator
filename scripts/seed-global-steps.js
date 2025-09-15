const mongoose = require('mongoose')
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator')

// Define the schemas (simplified version for seeding)
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

// Sample tasks
const sampleTasks = [
  {
    categoryName: 'Applicable Documents',
    step: 'Review all engineering drawings for the assembly. Verify part numbers, dimensions, and specifications. Check for any revisions or updates. Ensure all required drawings are present and legible. Contact engineering if any discrepancies are found.'
  },
  {
    categoryName: 'General Instructions',
    step: 'Follow all safety protocols and wear appropriate personal protective equipment. Ensure work area is clean and well-lit. Report any safety concerns immediately. Use proper lifting techniques for heavy components. Keep emergency exits clear at all times.'
  },
  {
    categoryName: 'Kit Release',
    step: 'Verify all components against the bill of materials. Check for correct part numbers, quantities, and specifications. Inspect components for damage or defects. Ensure all components are properly labeled and stored. Report any missing or damaged components immediately.'
  },
  {
    categoryName: 'SMT Preparation/Planning',
    step: 'Clean and inspect the stencil for any damage or contamination. Verify stencil thickness matches the component requirements. Align stencil properly with the PCB fiducial marks. Check stencil aperture sizes for each component. Ensure proper stencil tension and flatness.'
  },
  {
    categoryName: 'Paste Print',
    step: 'Apply solder paste using the programmed stencil. Ensure consistent paste volume across all pads. Check for proper paste height and coverage. Verify no bridging between adjacent pads. Clean any excess paste from stencil after printing.'
  },
  {
    categoryName: 'Reflow',
    step: 'Set up the reflow oven with the correct temperature profile. Monitor temperature zones to ensure proper heating and cooling rates. Verify peak temperature and time above liquidus. Check for proper solder joint formation. Document temperature readings for quality records.'
  },
  {
    categoryName: 'First Article Approval',
    step: 'Perform comprehensive inspection of the first assembled unit. Check all solder joints for proper formation and appearance. Verify component placement accuracy and orientation. Test electrical functionality if applicable. Document any issues and obtain approval before proceeding with production.'
  },
  {
    categoryName: 'Wave Solder',
    step: 'Set up wave solder machine with appropriate parameters. Ensure proper preheating of the PCB. Monitor solder wave height and contact time. Check for proper solder joint formation on through-hole components. Verify no solder bridges or cold joints are present.'
  },
  {
    categoryName: 'Through Hole Stuffing',
    step: 'Insert through-hole components according to the assembly drawing. Ensure proper component orientation and polarity. Use appropriate insertion force to avoid damage. Verify all components are fully seated. Check for proper lead length and trimming requirements.'
  },
  {
    categoryName: '2nd Operations',
    step: 'Perform secondary assembly operations as specified. Install connectors, cables, and mechanical components. Apply labels and markings as required. Perform any required mechanical assembly steps. Verify all secondary operations are completed correctly.'
  },
  {
    categoryName: 'Wash and Dry',
    step: 'Clean assembled PCBs to remove flux residues and contaminants. Use appropriate cleaning solution and process parameters. Ensure thorough rinsing to remove all cleaning agents. Dry components properly to prevent moisture issues. Verify cleanliness meets specified standards.'
  },
  {
    categoryName: 'Flying Probe Test',
    step: 'Perform flying probe electrical testing on assembled PCBs. Verify all electrical connections and continuity. Check for shorts, opens, and incorrect values. Test all functional circuits and components. Document test results and flag any failures for rework.'
  },
  {
    categoryName: 'Final QC',
    step: 'Perform final quality control inspection of completed assemblies. Check for proper component placement and solder joint quality. Verify all assembly requirements are met. Test final functionality and performance. Approve units that meet all quality standards.'
  },
  {
    categoryName: 'Packaging',
    step: 'Package completed assemblies according to customer requirements. Use appropriate protective materials and containers. Apply proper labeling and documentation. Ensure packaging meets shipping and handling requirements. Verify all packaging specifications are followed.'
  }
]

async function seedTasks() {
  try {
    console.log('Starting tasks seeding...')
    
    // Get all categories
    const categories = await ProcessItems.find({ isActive: true })
    console.log(`Found ${categories.length} process items`)
    
    if (categories.length === 0) {
      console.log('No process items found. Please run seed-categories.js first.')
      return
    }
    
    // Clear existing tasks
    await Task.deleteMany({})
    console.log('Cleared existing tasks')
    
    // Create sample tasks
    const createdTasks = []
    const placeholderUserId = new mongoose.Types.ObjectId()
    
    for (const taskData of sampleTasks) {
      const category = categories.find(cat => cat.categoryName === taskData.categoryName)
      if (category) {
        const task = new Task({
          step: taskData.step,
          categoryName: taskData.categoryName,
          processItem: category._id,
          isGlobal: true,
          createdBy: placeholderUserId,
          createdByModel: 'Admin',
          usageCount: 0,
          isActive: true
        })
        
        await task.save()
        createdTasks.push(task)
        console.log(`Created task in ${taskData.categoryName}`)
      } else {
        console.log(`Process item not found: ${taskData.categoryName}`)
      }
    }
    
    console.log(`Successfully seeded ${createdTasks.length} tasks`)
    
  } catch (error) {
    console.error('Error seeding tasks:', error)
  } finally {
    mongoose.connection.close()
    console.log('Database connection closed')
  }
}

seedTasks()
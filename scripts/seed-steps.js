const mongoose = require('mongoose')
require('dotenv').config()

// Define the GlobalSteps schema inline to avoid module issues
const GlobalStepsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Kitting',
      'SMT Single Side',
      'SMT Double Side',
      '2nd Operations',
      'Through Hole',
      'Wash',
      'Test',
      'AOI',
      'Final QC',
      'Packaging',
      'General',
      'Other'
    ],
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    maxlength: [100, 'Section name cannot exceed 100 characters'],
  },
  isGlobal: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel',
    required: [true, 'Created by is required'],
  },
  createdByModel: {
    type: String,
    enum: ['Engineer', 'Admin'],
    required: [true, 'Created by model is required'],
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

const GlobalSteps = mongoose.models.GlobalSteps || mongoose.model('GlobalSteps', GlobalStepsSchema)

// Default steps to seed
const defaultSteps = [
  {
    title: 'Verify BOM against components received',
    content: '1. Compare Bill of Materials (BOM) with components received\n2. Check component part numbers and quantities\n3. Verify component specifications and tolerances\n4. Document any discrepancies or missing components\n5. Update inventory records',
    category: 'Kitting',
    section: 'Kit Release',
    isGlobal: true,
    usageCount: 0,
    isActive: true,
  },
  {
    title: 'SMT Component Placement Verification',
    content: '1. Verify component placement according to assembly drawing\n2. Check component orientation and polarity\n3. Ensure proper component spacing and alignment\n4. Verify component values and specifications\n5. Document any placement issues',
    category: 'SMT Single Side',
    section: 'SMT Preparation',
    isGlobal: true,
    usageCount: 0,
    isActive: true,
  },
  {
    title: 'Reflow Profile Setup',
    content: '1. Set up reflow oven according to component specifications\n2. Configure temperature profile for lead-free solder\n3. Set conveyor speed and zone temperatures\n4. Verify profile meets component requirements\n5. Document profile settings and test results',
    category: 'SMT Single Side',
    section: 'SMT Reflow',
    isGlobal: true,
    usageCount: 0,
    isActive: true,
  },
  {
    title: 'First Article Inspection',
    content: '1. Perform visual inspection of first assembled unit\n2. Check solder joint quality and component placement\n3. Verify electrical connectivity and functionality\n4. Document inspection results and any issues\n5. Obtain approval before proceeding with production',
    category: 'SMT Single Side',
    section: 'SMT First Article',
    isGlobal: true,
    usageCount: 0,
    isActive: true,
  },
  {
    title: 'Through-Hole Component Installation',
    content: '1. Install through-hole components according to assembly drawing\n2. Verify component orientation and placement\n3. Ensure proper lead trimming and forming\n4. Check component height and clearance requirements\n5. Document installation process and any issues',
    category: '2nd Operations',
    section: '2nd Operations',
    isGlobal: true,
    usageCount: 0,
    isActive: true,
  },
  {
    title: 'Board Cleaning Process',
    content: '1. Remove flux residue using appropriate cleaning solution\n2. Follow cleaning procedure for lead-free solder\n3. Verify cleaning effectiveness and board cleanliness\n4. Check for any remaining contaminants\n5. Document cleaning process and results',
    category: 'Wash',
    section: 'Wash',
    isGlobal: true,
    usageCount: 0,
    isActive: true,
  },
  {
    title: 'Functional Testing',
    content: '1. Perform electrical testing according to test procedures\n2. Verify all functions operate as specified\n3. Check voltage levels and current consumption\n4. Test communication interfaces and protocols\n5. Document test results and any failures',
    category: 'Test',
    section: 'Test Section',
    isGlobal: true,
    usageCount: 0,
    isActive: true,
    isActive: true,
  },
  {
    title: 'Automated Optical Inspection',
    content: '1. Set up AOI system for board inspection\n2. Configure inspection parameters and tolerances\n3. Run automated inspection on all boards\n4. Review and analyze inspection results\n5. Document any defects or issues found',
    category: 'AOI',
    section: 'AOI',
    isGlobal: true,
    usageCount: 0,
    isActive: true,
  },
  {
    title: 'Final Quality Control',
    content: '1. Perform final visual inspection of completed assembly\n2. Verify all components are properly installed\n3. Check for any physical damage or defects\n4. Verify labeling and marking requirements\n5. Document final inspection results',
    category: 'Final QC',
    section: 'Final QC',
    isGlobal: true,
    usageCount: 0,
    isActive: true,
  },
  {
    title: 'Packaging and Shipping',
    content: '1. Package assemblies according to customer requirements\n2. Use appropriate ESD protection and materials\n3. Apply shipping labels and documentation\n4. Verify package contents and quantities\n5. Prepare shipping documentation and tracking',
    category: 'Packaging',
    section: 'Ship and Delivery',
    isGlobal: true,
    usageCount: 0,
    isActive: true,
  }
]

async function seedSteps() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing steps (optional - remove this if you want to keep existing steps)
    await GlobalSteps.deleteMany({})
    console.log('Cleared existing steps')

    // Find an existing admin user to use as the creator
    const AdminSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      jobNo: { type: String },
      mpiNo: { type: String },
      mpiRev: { type: String },
      docId: { type: String },
      formId: { type: String },
      formRev: { type: String }
    }, { timestamps: true })

    const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema)
    
    let adminUser = await Admin.findOne({ email: 'admin@mpi.com' })
    if (!adminUser) {
      console.log('No admin user found. Please run npm run seed-admin first.')
      return
    }

    // Add createdBy and createdByModel to each step
    const stepsWithCreator = defaultSteps.map(step => ({
      ...step,
      createdBy: adminUser._id,
      createdByModel: 'Admin'
    }))

    // Insert default steps
    const steps = await GlobalSteps.insertMany(stepsWithCreator)
    console.log(`Successfully seeded ${steps.length} default steps`)

    // List the created steps
    steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step.title} (${step.category})`)
    })

  } catch (error) {
    console.error('Error seeding steps:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the seed function
seedSteps()

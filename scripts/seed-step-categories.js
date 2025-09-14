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

const seedStepCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing step categories
    await StepCategory.deleteMany({})
    console.log('Cleared existing step categories')

    // Create default categories with sample steps
    const defaultCategories = [
      {
        categoryName: 'Applicable Documents',
        description: 'Documentation and reference materials',
        steps: [
          {
            title: 'Review assembly drawings',
            content: '1. Check latest revision of assembly drawings\n2. Verify drawing numbers and dates\n3. Confirm all dimensions and specifications\n4. Document any drawing discrepancies',
            order: 0,
            isActive: true
          },
          {
            title: 'Verify BOM and specifications',
            content: '1. Review Bill of Materials for accuracy\n2. Check component specifications and tolerances\n3. Verify part numbers and revisions\n4. Document any BOM issues',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'General Instructions',
        description: 'General manufacturing instructions and guidelines',
        steps: [
          {
            title: 'Safety and ESD precautions',
            content: '1. Wear ESD wrist strap and heel strap\n2. Work on ESD mat at all times\n3. Handle components with ESD-safe tools\n4. Follow all safety protocols',
            order: 0,
            isActive: true
          },
          {
            title: 'Quality standards and inspection',
            content: '1. Follow IPC-A-610 standards\n2. Inspect all work at each step\n3. Document any quality issues\n4. Maintain quality records',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'Kit Release',
        description: 'Component kitting and preparation steps',
        steps: [
          {
            title: 'Verify BOM against components received',
            content: '1. Check Bill of Materials against components received\n2. Verify component quantities match BOM\n3. Check component part numbers and revisions\n4. Document any discrepancies',
            order: 0,
            isActive: true
          },
          {
            title: 'Check component specifications and tolerances',
            content: '1. Verify component specifications match requirements\n2. Check tolerance ranges are within acceptable limits\n3. Validate component ratings and specifications\n4. Document any out-of-spec components',
            order: 1,
            isActive: true
          },
          {
            title: 'Organize components by assembly sequence',
            content: '1. Sort components by assembly order\n2. Group related components together\n3. Label component groups clearly\n4. Ensure easy access during assembly',
            order: 2,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'SMT Preparation/Planning',
        description: 'SMT setup and preparation steps',
        steps: [
          {
            title: 'SMT equipment setup',
            content: '1. Calibrate pick and place machine\n2. Set up stencil printer\n3. Verify reflow oven temperature profile\n4. Check all equipment functionality',
            order: 0,
            isActive: true
          },
          {
            title: 'Program verification',
            content: '1. Load placement program\n2. Verify component placement positions\n3. Check component orientation and polarity\n4. Run dry cycle to verify program',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'Paste Print',
        description: 'Solder paste printing process',
        steps: [
          {
            title: 'Stencil setup and alignment',
            content: '1. Install and align stencil\n2. Verify stencil aperture sizes\n3. Check stencil tension and flatness\n4. Perform alignment verification',
            order: 0,
            isActive: true
          },
          {
            title: 'Paste printing process',
            content: '1. Apply solder paste using stencil\n2. Verify paste thickness and coverage\n3. Check for paste bridging or insufficient coverage\n4. Clean stencil after use',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'Reflow',
        description: 'Reflow soldering process',
        steps: [
          {
            title: 'Reflow oven setup',
            content: '1. Set reflow temperature profile\n2. Verify oven temperature calibration\n3. Check conveyor speed settings\n4. Monitor temperature zones',
            order: 0,
            isActive: true
          },
          {
            title: 'Reflow process monitoring',
            content: '1. Load boards into reflow oven\n2. Monitor temperature profile\n3. Verify proper solder joint formation\n4. Cool boards to room temperature',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'First Article Approval',
        description: 'First article inspection and approval',
        steps: [
          {
            title: 'First article inspection',
            content: '1. Inspect first assembled board\n2. Check component placement accuracy\n3. Verify solder joint quality\n4. Document inspection results',
            order: 0,
            isActive: true
          },
          {
            title: 'Approval process',
            content: '1. Submit first article for approval\n2. Address any issues found\n3. Obtain customer approval\n4. Document approval status',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'Production Quantity Approval',
        description: 'Production quantity approval process',
        steps: [
          {
            title: 'Production run approval',
            content: '1. Verify production quantity requirements\n2. Check material availability\n3. Confirm production schedule\n4. Obtain production approval',
            order: 0,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'Wave Solder',
        description: 'Wave soldering process',
        steps: [
          {
            title: 'Wave solder setup',
            content: '1. Set wave solder temperature\n2. Adjust wave height and speed\n3. Check flux application\n4. Verify conveyor settings',
            order: 0,
            isActive: true
          },
          {
            title: 'Wave soldering process',
            content: '1. Load boards for wave soldering\n2. Monitor solder wave quality\n3. Check solder joint formation\n4. Inspect for solder defects',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'Through Hole Stuffing',
        description: 'Through-hole component installation',
        steps: [
          {
            title: 'Through-hole component installation',
            content: '1. Install through-hole components\n2. Verify component orientation\n3. Trim component leads\n4. Check for proper seating',
            order: 0,
            isActive: true
          },
          {
            title: 'Hand soldering',
            content: '1. Solder through-hole connections\n2. Verify solder joint quality\n3. Check for cold solder joints\n4. Clean flux residue',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: '2nd Operations',
        description: 'Secondary operations and assembly',
        steps: [
          {
            title: 'Secondary assembly operations',
            content: '1. Install connectors and cables\n2. Add mechanical components\n3. Perform final assembly steps\n4. Verify assembly completeness',
            order: 0,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'Selective Solder',
        description: 'Selective soldering process',
        steps: [
          {
            title: 'Selective solder setup',
            content: '1. Program selective solder machine\n2. Set solder temperature and flow\n3. Verify nozzle positioning\n4. Check solder quality',
            order: 0,
            isActive: true
          },
          {
            title: 'Selective soldering process',
            content: '1. Load boards for selective soldering\n2. Monitor solder application\n3. Verify joint quality\n4. Inspect for defects',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'Wash and Dry',
        description: 'Cleaning and drying process',
        steps: [
          {
            title: 'Cleaning process',
            content: '1. Remove flux residue\n2. Clean boards with appropriate solvent\n3. Verify cleanliness standards\n4. Document cleaning process',
            order: 0,
            isActive: true
          },
          {
            title: 'Drying process',
            content: '1. Dry boards thoroughly\n2. Verify no moisture remains\n3. Check for cleanliness\n4. Prepare for next process',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'Flying Probe Test',
        description: 'Flying probe testing process',
        steps: [
          {
            title: 'Flying probe test setup',
            content: '1. Program flying probe test\n2. Set test parameters\n3. Verify probe positioning\n4. Check test coverage',
            order: 0,
            isActive: true
          },
          {
            title: 'Flying probe testing',
            content: '1. Load boards for testing\n2. Run flying probe tests\n3. Verify test results\n4. Document test outcomes',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'AOI Test',
        description: 'Automated Optical Inspection',
        steps: [
          {
            title: 'AOI setup and programming',
            content: '1. Program AOI inspection\n2. Set inspection parameters\n3. Verify camera positioning\n4. Check inspection coverage',
            order: 0,
            isActive: true
          },
          {
            title: 'AOI inspection process',
            content: '1. Load boards for AOI inspection\n2. Run automated inspection\n3. Review inspection results\n4. Document any defects found',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'TH Stuffing',
        description: 'Through-hole component stuffing',
        steps: [
          {
            title: 'TH component stuffing',
            content: '1. Install through-hole components\n2. Verify component placement\n3. Check component orientation\n4. Ensure proper seating',
            order: 0,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'Final QC',
        description: 'Final quality control and inspection',
        steps: [
          {
            title: 'Final quality inspection',
            content: '1. Perform final visual inspection\n2. Check all assembly requirements\n3. Verify functionality\n4. Document inspection results',
            order: 0,
            isActive: true
          },
          {
            title: 'Quality approval',
            content: '1. Review all quality records\n2. Verify compliance with standards\n3. Approve for shipment\n4. Document approval status',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'Shipping and Delivery',
        description: 'Shipping and delivery process',
        steps: [
          {
            title: 'Shipping preparation',
            content: '1. Package products securely\n2. Label packages correctly\n3. Prepare shipping documentation\n4. Verify shipping requirements',
            order: 0,
            isActive: true
          },
          {
            title: 'Delivery process',
            content: '1. Coordinate delivery schedule\n2. Track shipment status\n3. Confirm delivery receipt\n4. Document delivery completion',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      },
      {
        categoryName: 'Packaging',
        description: 'Product packaging process',
        steps: [
          {
            title: 'Packaging process',
            content: '1. Select appropriate packaging materials\n2. Package products according to specifications\n3. Apply protective materials\n4. Verify packaging integrity',
            order: 0,
            isActive: true
          },
          {
            title: 'Packaging verification',
            content: '1. Check packaging quality\n2. Verify labeling accuracy\n3. Confirm packaging requirements\n4. Document packaging process',
            order: 1,
            isActive: true
          }
        ],
        isGlobal: true,
        createdBy: new mongoose.Types.ObjectId(), // Placeholder
        createdByModel: 'Admin',
        usageCount: 0,
        isActive: true
      }
    ]

    // Insert default categories
    const createdCategories = await StepCategory.insertMany(defaultCategories)
    console.log(`Created ${createdCategories.length} step categories with default steps`)

    console.log('Step categories seeded successfully!')
  } catch (error) {
    console.error('Error seeding step categories:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedStepCategories()

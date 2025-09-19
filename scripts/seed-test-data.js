const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator'
);

// Define schemas inline (similar to existing scripts)
const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    title: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Admin = mongoose.model('Admin', adminSchema);

const engineerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [50, 'Title cannot exceed 50 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
engineerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Engineer = mongoose.model('Engineer', engineerSchema);

const customerCompanySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters'],
    },
    contactPerson: {
      type: String,
      required: false,
      trim: true,
      maxlength: [100, 'Contact person name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    address: {
      type: String,
      required: false,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const CustomerCompany = mongoose.model(
  'CustomerCompany',
  customerCompanySchema
);

const formSchema = new mongoose.Schema(
  {
    formId: {
      type: String,
      required: [true, 'Form ID is required'],
      unique: true,
      trim: true,
    },
    formRev: {
      type: String,
      required: [true, 'Form revision is required'],
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Form = mongoose.model('Form', formSchema);

const processItemsSchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ProcessItems = mongoose.model('ProcessItems', processItemsSchema);

const taskSchema = new mongoose.Schema(
  {
    step: {
      type: String,
      required: [true, 'Step is required'],
      trim: true,
    },
    processItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcessItems',
      required: [true, 'Process item ID is required'],
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);

const mpiSchema = new mongoose.Schema(
  {
    jobNumber: {
      type: String,
      required: [true, 'Job number is required'],
      unique: true,
      trim: true,
    },
    oldJobNumber: {
      type: String,
      required: false,
      trim: true,
    },
    mpiNumber: {
      type: String,
      required: [true, 'MPI number is required'],
      unique: true,
      trim: true,
    },
    mpiVersion: {
      type: String,
      required: false,
      trim: true,
    },
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Engineer',
      required: [true, 'Engineer ID is required'],
    },
    customerCompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerCompany',
      required: [true, 'Customer company ID is required'],
    },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: false,
    },
    customerAssemblyName: {
      type: String,
      required: [true, 'Customer assembly name is required'],
      trim: true,
    },
    assemblyRev: {
      type: String,
      required: [true, 'Assembly revision is required'],
      trim: true,
    },
    drawingName: {
      type: String,
      required: [true, 'Drawing name is required'],
      trim: true,
    },
    drawingRev: {
      type: String,
      required: [true, 'Drawing revision is required'],
      trim: true,
    },
    assemblyQuantity: {
      type: Number,
      required: [true, 'Assembly quantity is required'],
      min: [1, 'Assembly quantity must be at least 1'],
    },
    kitReceivedDate: {
      type: Date,
      required: [true, 'Kit received date is required'],
    },
    dateReleased: {
      type: String,
      required: [true, 'Date released is required'],
      trim: true,
    },
    pages: {
      type: String,
      required: [true, 'Pages is required'],
      trim: true,
    },
    sections: [
      {
        id: String,
        title: String,
        content: String,
        order: Number,
        isCollapsed: Boolean,
        images: [String],
        documentId: String,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'in-review', 'approved', 'archived'],
      default: 'draft',
    },
    versionHistory: [
      {
        version: String,
        date: Date,
        description: String,
        engineerName: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MPI = mongoose.model('MPI', mpiSchema);

async function seedTestData() {
  try {
    console.log('🚀 Starting comprehensive test data seeding...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing test data...');
    await Admin.deleteMany({ email: { $regex: /@test\.com$/ } });
    await Engineer.deleteMany({ email: { $regex: /@test\.com$/ } });
    await CustomerCompany.deleteMany({ companyName: { $regex: /^Test/ } });
    await MPI.deleteMany({ mpiNumber: { $regex: /^TEST/ } });
    await Form.deleteMany({ formId: { $regex: /^TEST/ } });
    await ProcessItems.deleteMany({ categoryName: { $regex: /^Test/ } });
    await Task.deleteMany({ step: { $regex: /^Test/ } });

    // 1. Create Test Admins
    console.log('👑 Creating test admins...');
    const testAdmins = [
      {
        email: 'admin1@test.com',
        password: 'admin123456',
        fullName: 'John Admin',
        title: 'System Administrator',
      },
      {
        email: 'admin2@test.com',
        password: 'admin123456',
        fullName: 'Sarah Admin',
        title: 'Operations Manager',
      },
    ];

    for (const adminData of testAdmins) {
      const existingAdmin = await Admin.findOne({ email: adminData.email });
      if (!existingAdmin) {
        const admin = new Admin(adminData);
        await admin.save();
        console.log(`✅ Created admin: ${adminData.email}`);
      } else {
        console.log(`⚠️  Admin already exists: ${adminData.email}`);
      }
    }

    // 2. Create Test Engineers
    console.log('👨‍💻 Creating test engineers...');
    const testEngineers = [
      {
        email: 'engineer1@test.com',
        password: 'engineer123456',
        fullName: 'Mike Engineer',
        title: 'Senior Process Engineer',
      },
      {
        email: 'engineer2@test.com',
        password: 'engineer123456',
        fullName: 'Lisa Engineer',
        title: 'Quality Engineer',
      },
      {
        email: 'engineer3@test.com',
        password: 'engineer123456',
        fullName: 'David Engineer',
        title: 'Manufacturing Engineer',
      },
    ];

    const createdEngineers = [];
    for (const engineerData of testEngineers) {
      const existingEngineer = await Engineer.findOne({
        email: engineerData.email,
      });
      if (!existingEngineer) {
        const engineer = new Engineer(engineerData);
        await engineer.save();
        createdEngineers.push(engineer);
        console.log(`✅ Created engineer: ${engineerData.email}`);
      } else {
        console.log(`⚠️  Engineer already exists: ${engineerData.email}`);
        createdEngineers.push(existingEngineer);
      }
    }

    // 3. Create Test Customer Companies
    console.log('🏢 Creating test customer companies...');
    const testCompanies = [
      {
        companyName: 'Test Electronics Corp',
        city: 'San Jose',
        state: 'California',
        contactPerson: 'John Smith',
        email: 'john.smith@testelectronics.com',
        phone: '(555) 123-4567',
        address: '123 Tech Street, San Jose, CA 95110',
        isActive: true,
      },
      {
        companyName: 'Test Manufacturing Inc',
        city: 'Austin',
        state: 'Texas',
        contactPerson: 'Jane Doe',
        email: 'jane.doe@testmanufacturing.com',
        phone: '(555) 987-6543',
        address: '456 Industrial Blvd, Austin, TX 78701',
        isActive: true,
      },
      {
        companyName: 'Test Aerospace Ltd',
        city: 'Seattle',
        state: 'Washington',
        contactPerson: 'Bob Johnson',
        email: 'bob.johnson@testaerospace.com',
        phone: '(555) 456-7890',
        address: '789 Aviation Way, Seattle, WA 98101',
        isActive: true,
      },
    ];

    const createdCompanies = [];
    for (const companyData of testCompanies) {
      const existingCompany = await CustomerCompany.findOne({
        companyName: companyData.companyName,
      });
      if (!existingCompany) {
        const company = new CustomerCompany(companyData);
        await company.save();
        createdCompanies.push(company);
        console.log(`✅ Created company: ${companyData.companyName}`);
      } else {
        console.log(`⚠️  Company already exists: ${companyData.companyName}`);
        createdCompanies.push(existingCompany);
      }
    }

    // 4. Create Test Forms
    console.log('📋 Creating test forms...');
    const testForms = [
      {
        formId: 'TEST-FORM-001',
        formRev: 'Rev A',
        description: 'Test Manufacturing Process Form',
        isActive: true,
      },
      {
        formId: 'TEST-FORM-002',
        formRev: 'Rev B',
        description: 'Test Quality Control Form',
        isActive: true,
      },
    ];

    const createdForms = [];
    for (const formData of testForms) {
      const existingForm = await Form.findOne({ formId: formData.formId });
      if (!existingForm) {
        const form = new Form(formData);
        await form.save();
        createdForms.push(form);
        console.log(`✅ Created form: ${formData.formId}`);
      } else {
        console.log(`⚠️  Form already exists: ${formData.formId}`);
        createdForms.push(existingForm);
      }
    }

    // 5. Create Test Process Items
    console.log('🔧 Creating test process items...');
    const testProcessItems = [
      {
        categoryName: 'Test SMT Preparation',
        description: 'Surface Mount Technology preparation processes',
      },
      {
        categoryName: 'Test Paste Print',
        description: 'Solder paste printing operations',
      },
      {
        categoryName: 'Test Reflow',
        description: 'Reflow soldering processes',
      },
      {
        categoryName: 'Test Wave Solder',
        description: 'Wave soldering operations',
      },
      {
        categoryName: 'Test Final QC',
        description: 'Final quality control checks',
      },
    ];

    const createdProcessItems = [];
    for (const itemData of testProcessItems) {
      const existingItem = await ProcessItems.findOne({
        categoryName: itemData.categoryName,
      });
      if (!existingItem) {
        const item = new ProcessItems(itemData);
        await item.save();
        createdProcessItems.push(item);
        console.log(`✅ Created process item: ${itemData.categoryName}`);
      } else {
        console.log(
          `⚠️  Process item already exists: ${itemData.categoryName}`
        );
        createdProcessItems.push(existingItem);
      }
    }

    // 6. Create Test Tasks
    console.log('📝 Creating test tasks...');
    const testTasks = [
      {
        step: 'Test Verify component placement accuracy',
        processItemId: createdProcessItems[0]._id,
        usageCount: 0,
      },
      {
        step: 'Test Check solder paste volume',
        processItemId: createdProcessItems[1]._id,
        usageCount: 0,
      },
      {
        step: 'Test Monitor reflow temperature profile',
        processItemId: createdProcessItems[2]._id,
        usageCount: 0,
      },
      {
        step: 'Test Inspect wave solder quality',
        processItemId: createdProcessItems[3]._id,
        usageCount: 0,
      },
      {
        step: 'Test Perform final visual inspection',
        processItemId: createdProcessItems[4]._id,
        usageCount: 0,
      },
    ];

    for (const taskData of testTasks) {
      const existingTask = await Task.findOne({ step: taskData.step });
      if (!existingTask) {
        const task = new Task(taskData);
        await task.save();
        console.log(`✅ Created task: ${taskData.step}`);
      } else {
        console.log(`⚠️  Task already exists: ${taskData.step}`);
      }
    }

    // 7. Create Test MPIs
    console.log('📄 Creating test MPIs...');
    const testMPIs = [
      {
        jobNumber: 'TEST-JOB-001',
        oldJobNumber: 'OLD-TEST-001',
        mpiNumber: 'TEST-MPI-001',
        mpiVersion: 'Rev A',
        engineerId: createdEngineers[0]._id,
        customerCompanyId: createdCompanies[0]._id,
        formId: createdForms[0]._id,
        customerAssemblyName: 'Test PCB Assembly A',
        assemblyRev: 'Rev 1.0',
        drawingName: 'DWG-TEST-001',
        drawingRev: 'Rev A',
        assemblyQuantity: 100,
        kitReceivedDate: new Date('2024-01-15'),
        dateReleased: '2024-01-20',
        pages: '5',
        sections: [
          {
            id: 'test-applicable-docs',
            title: 'Test Applicable Documents',
            content: '<p>Test applicable documents content</p>',
            order: 1,
            isCollapsed: false,
            images: [],
          },
          {
            id: 'test-general-instructions',
            title: 'Test General Instructions',
            content: '<p>Test general instructions content</p>',
            order: 2,
            isCollapsed: false,
            images: [],
          },
        ],
        status: 'draft',
        versionHistory: [
          {
            version: 'Rev A',
            date: new Date(),
            description: 'Initial test creation',
            engineerName: createdEngineers[0].fullName,
          },
        ],
        isActive: true,
      },
      {
        jobNumber: 'TEST-JOB-002',
        oldJobNumber: 'OLD-TEST-002',
        mpiNumber: 'TEST-MPI-002',
        mpiVersion: 'Rev B',
        engineerId: createdEngineers[1]._id,
        customerCompanyId: createdCompanies[1]._id,
        formId: createdForms[1]._id,
        customerAssemblyName: 'Test PCB Assembly B',
        assemblyRev: 'Rev 2.0',
        drawingName: 'DWG-TEST-002',
        drawingRev: 'Rev B',
        assemblyQuantity: 250,
        kitReceivedDate: new Date('2024-02-01'),
        dateReleased: '2024-02-05',
        pages: '8',
        sections: [
          {
            id: 'test-applicable-docs',
            title: 'Test Applicable Documents',
            content: '<p>Test applicable documents content for MPI 002</p>',
            order: 1,
            isCollapsed: false,
            images: [],
          },
          {
            id: 'test-smt-prep',
            title: 'Test SMT Preparation',
            content: '<p>Test SMT preparation content</p>',
            order: 2,
            isCollapsed: false,
            images: [],
          },
        ],
        status: 'in-review',
        versionHistory: [
          {
            version: 'Rev B',
            date: new Date(),
            description: 'Initial test creation for MPI 002',
            engineerName: createdEngineers[1].fullName,
          },
        ],
        isActive: true,
      },
    ];

    for (const mpiData of testMPIs) {
      const existingMPI = await MPI.findOne({ mpiNumber: mpiData.mpiNumber });
      if (!existingMPI) {
        const mpi = new MPI(mpiData);
        await mpi.save();
        console.log(`✅ Created MPI: ${mpiData.mpiNumber}`);
      } else {
        console.log(`⚠️  MPI already exists: ${mpiData.mpiNumber}`);
      }
    }

    console.log('\n🎉 Test data seeding completed successfully!');
    console.log('\n📋 Test Account Credentials:');
    console.log('=====================================');
    console.log('👑 ADMIN ACCOUNTS:');
    console.log('   Email: admin1@test.com | Password: admin123456');
    console.log('   Email: admin2@test.com | Password: admin123456');
    console.log('\n👨‍💻 ENGINEER ACCOUNTS:');
    console.log('   Email: engineer1@test.com | Password: engineer123456');
    console.log('   Email: engineer2@test.com | Password: engineer123456');
    console.log('   Email: engineer3@test.com | Password: engineer123456');
    console.log('\n🏢 TEST COMPANIES:');
    console.log('   • Test Electronics Corp (San Jose, CA)');
    console.log('   • Test Manufacturing Inc (Austin, TX)');
    console.log('   • Test Aerospace Ltd (Seattle, WA)');
    console.log('\n📄 TEST MPIs:');
    console.log('   • TEST-MPI-001 (Draft status)');
    console.log('   • TEST-MPI-002 (In Review status)');
    console.log('\n🔧 TEST PROCESS ITEMS:');
    console.log('   • Test SMT Preparation');
    console.log('   • Test Paste Print');
    console.log('   • Test Reflow');
    console.log('   • Test Wave Solder');
    console.log('   • Test Final QC');
    console.log(
      '\n✨ You can now test both Admin and Engineer roles with this data!'
    );
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seeding function
seedTestData();

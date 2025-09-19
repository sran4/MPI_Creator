const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/mpi-creator'
);

// Define schemas (simplified for verification)
const adminSchema = new mongoose.Schema({}, { strict: false });
const engineerSchema = new mongoose.Schema({}, { strict: false });
const customerCompanySchema = new mongoose.Schema({}, { strict: false });
const formSchema = new mongoose.Schema({}, { strict: false });
const processItemsSchema = new mongoose.Schema({}, { strict: false });
const taskSchema = new mongoose.Schema({}, { strict: false });
const mpiSchema = new mongoose.Schema({}, { strict: false });

const Admin = mongoose.model('Admin', adminSchema);
const Engineer = mongoose.model('Engineer', engineerSchema);
const CustomerCompany = mongoose.model(
  'CustomerCompany',
  customerCompanySchema
);
const Form = mongoose.model('Form', formSchema);
const ProcessItems = mongoose.model('ProcessItems', processItemsSchema);
const Task = mongoose.model('Task', taskSchema);
const MPI = mongoose.model('MPI', mpiSchema);

async function verifyTestData() {
  try {
    console.log('🔍 Verifying test data...\n');

    // Count test data
    const adminCount = await Admin.countDocuments({
      email: { $regex: /@test\.com$/ },
    });
    const engineerCount = await Engineer.countDocuments({
      email: { $regex: /@test\.com$/ },
    });
    const companyCount = await CustomerCompany.countDocuments({
      companyName: { $regex: /^Test/ },
    });
    const formCount = await Form.countDocuments({
      formId: { $regex: /^TEST/ },
    });
    const processItemCount = await ProcessItems.countDocuments({
      categoryName: { $regex: /^Test/ },
    });
    const taskCount = await Task.countDocuments({ step: { $regex: /^Test/ } });
    const mpiCount = await MPI.countDocuments({
      mpiNumber: { $regex: /^TEST/ },
    });

    console.log('📊 Test Data Summary:');
    console.log('====================');
    console.log(`👑 Test Admins: ${adminCount}`);
    console.log(`👨‍💻 Test Engineers: ${engineerCount}`);
    console.log(`🏢 Test Companies: ${companyCount}`);
    console.log(`📋 Test Forms: ${formCount}`);
    console.log(`🔧 Test Process Items: ${processItemCount}`);
    console.log(`📝 Test Tasks: ${taskCount}`);
    console.log(`📄 Test MPIs: ${mpiCount}`);

    // Show specific test data
    console.log('\n📋 Test Account Details:');
    console.log('========================');

    const testAdmins = await Admin.find({
      email: { $regex: /@test\.com$/ },
    }).select('email fullName title');
    console.log('\n👑 Test Admins:');
    testAdmins.forEach(admin => {
      console.log(`   • ${admin.email} - ${admin.fullName} (${admin.title})`);
    });

    const testEngineers = await Engineer.find({
      email: { $regex: /@test\.com$/ },
    }).select('email fullName title');
    console.log('\n👨‍💻 Test Engineers:');
    testEngineers.forEach(engineer => {
      console.log(
        `   • ${engineer.email} - ${engineer.fullName} (${engineer.title})`
      );
    });

    const testCompanies = await CustomerCompany.find({
      companyName: { $regex: /^Test/ },
    }).select('companyName city state');
    console.log('\n🏢 Test Companies:');
    testCompanies.forEach(company => {
      console.log(
        `   • ${company.companyName} - ${company.city}, ${company.state}`
      );
    });

    const testMPIs = await MPI.find({ mpiNumber: { $regex: /^TEST/ } })
      .populate('engineerId', 'fullName email')
      .populate('customerCompanyId', 'companyName')
      .select('mpiNumber jobNumber status engineerId customerCompanyId');

    console.log('\n📄 Test MPIs:');
    testMPIs.forEach(mpi => {
      console.log(`   • ${mpi.mpiNumber} (${mpi.jobNumber}) - ${mpi.status}`);
      console.log(
        `     Engineer: ${mpi.engineerId?.fullName} (${mpi.engineerId?.email})`
      );
      console.log(`     Company: ${mpi.customerCompanyId?.companyName}`);
    });

    console.log('\n✅ Verification completed successfully!');
    console.log('\n🚀 Ready for testing! You can now:');
    console.log('   1. Login with admin credentials at /login');
    console.log('   2. Login with engineer credentials at /login');
    console.log('   3. Test admin dashboard at /admin/dashboard');
    console.log('   4. Test engineer dashboard at /engineer/dashboard');
    console.log('   5. Create, edit, and manage MPIs');
    console.log('   6. Test print preview functionality');
  } catch (error) {
    console.error('❌ Error verifying test data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the verification function
verifyTestData();

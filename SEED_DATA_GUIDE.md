# Test Data Seeding Guide

This guide will help you set up comprehensive test data for both Admin and Engineer roles in the MPI Creator application.

## Prerequisites

1. **MongoDB Connection**: Ensure your MongoDB database is running and accessible
2. **Environment Configuration**: Set up your `.env.local` file with database connection details
3. **Node.js Dependencies**: Make sure all npm packages are installed

## Quick Setup

### Step 1: Create Environment File (if needed)

```bash
node scripts/setup-env.js
```

This will create a `.env.local` file with default configuration. Update the `MONGODB_URI` and `JWT_SECRET` values as needed.

### Step 2: Seed Test Data

```bash
node scripts/seed-test-data.js
```

This will create comprehensive test data including:

- 2 Admin accounts
- 3 Engineer accounts
- 3 Customer companies
- 2 Forms
- 5 Process items
- 5 Tasks
- 2 MPIs with different statuses

## Test Account Credentials

### Admin Accounts

- **Email**: `admin1@test.com` | **Password**: `admin123456`
- **Email**: `admin2@test.com` | **Password**: `admin123456`

### Engineer Accounts

- **Email**: `engineer1@test.com` | **Password**: `engineer123456`
- **Email**: `engineer2@test.com` | **Password**: `engineer123456`
- **Email**: `engineer3@test.com` | **Password**: `engineer123456`

## Test Data Overview

### Customer Companies

1. **Test Electronics Corp** (San Jose, CA)
2. **Test Manufacturing Inc** (Austin, TX)
3. **Test Aerospace Ltd** (Seattle, WA)

### MPIs Created

1. **TEST-MPI-001** (Draft status) - Created by engineer1@test.com
2. **TEST-MPI-002** (In Review status) - Created by engineer2@test.com

### Process Items

1. Test SMT Preparation
2. Test Paste Print
3. Test Reflow
4. Test Wave Solder
5. Test Final QC

### Forms

1. TEST-FORM-001 (Test Manufacturing Process Form)
2. TEST-FORM-002 (Test Quality Control Form)

## Testing Scenarios

### Admin Role Testing

1. **Login** with admin credentials
2. **Access Admin Dashboard** at `/admin/dashboard`
3. **Manage Engineers** - View, create, edit engineers
4. **Manage Customer Companies** - View, create, edit companies
5. **Manage Forms** - View, create, edit forms
6. **Manage Process Items** - View, create, edit process items
7. **View All MPIs** - Access MPIs created by engineers
8. **Print Preview** - Test print functionality for MPIs

### Engineer Role Testing

1. **Login** with engineer credentials
2. **Access Engineer Dashboard** at `/engineer/dashboard`
3. **Create New MPI** - Use the test customer companies and forms
4. **Edit Existing MPIs** - Modify TEST-MPI-001 or TEST-MPI-002
5. **Add Sections** - Test section management
6. **Add Images** - Test image upload functionality
7. **Add Tasks** - Use the test process items and tasks
8. **Print Preview** - Test print functionality
9. **Customer Management** - View and manage customer companies

## Data Cleanup

To remove all test data and start fresh:

```bash
# The seeding script automatically clears existing test data before creating new data
node scripts/seed-test-data.js
```

Or manually clear specific collections:

```javascript
// In MongoDB shell or script
db.admins.deleteMany({ email: { $regex: /@test\.com$/ } });
db.engineers.deleteMany({ email: { $regex: /@test\.com$/ } });
db.customercompanies.deleteMany({ companyName: { $regex: /^Test/ } });
db.mpis.deleteMany({ mpiNumber: { $regex: /^TEST/ } });
db.forms.deleteMany({ formId: { $regex: /^TEST/ } });
db.processitems.deleteMany({ categoryName: { $regex: /^Test/ } });
db.tasks.deleteMany({ step: { $regex: /^Test/ } });
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify the MONGODB_URI in `.env.local`
   - Ensure network connectivity

2. **Duplicate Key Errors**
   - The script handles existing data gracefully
   - Check console output for warnings about existing records

3. **Model Import Errors**
   - Ensure all model files are in the `models/` directory
   - Check that model exports are correct

4. **Password Hashing Issues**
   - Ensure bcryptjs is installed: `npm install bcryptjs`
   - Check that password hashing middleware is working

### Environment Variables

Required environment variables in `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/mpi-creator
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## Advanced Testing

### Custom Test Data

You can modify the `scripts/seed-test-data.js` file to create custom test data:

1. **Add More Engineers**: Extend the `testEngineers` array
2. **Add More Companies**: Extend the `testCompanies` array
3. **Add More MPIs**: Extend the `testMPIs` array
4. **Add More Tasks**: Extend the `testTasks` array

### Performance Testing

For performance testing with larger datasets:

1. Increase the number of test records in the seeding script
2. Add bulk operations for faster data creation
3. Use MongoDB indexes for better query performance

## Security Notes

⚠️ **Important**: The test passwords are simple and should NEVER be used in production. Always use strong, unique passwords in production environments.

## Support

If you encounter issues with the seeding process:

1. Check the console output for specific error messages
2. Verify your MongoDB connection and permissions
3. Ensure all required dependencies are installed
4. Check that your environment variables are correctly set

Happy testing! 🚀

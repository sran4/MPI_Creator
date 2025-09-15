# Model Testing Guide

This guide explains how to test the StepCategory and GlobalSteps models using the admin testing interface.

## 🚀 Quick Start

### 1. Access the Testing Interface
- Go to: `http://localhost:3000/admin/test-models`
- Or navigate from Admin Dashboard → Testing & Development → Test Models

### 2. Run Test Data Script (Optional)
```bash
node scripts/test-models.js
```
This will create sample test data for both models.

## 🧪 Testing Features

### **Unified CRUD Interface**
- **Tabbed Interface**: Switch between Categories and Steps
- **Real-time Search**: Filter by name, description, or content
- **Live Word Count**: See word count for steps (max 150 words)
- **Bulk Operations**: View all data at once

### **Category Testing**
- ✅ **Create**: Add new categories with name and description
- ✅ **Read**: View all categories with step counts
- ✅ **Update**: Edit category name and description
- ✅ **Delete**: Remove categories (with confirmation)

### **Step Testing**
- ✅ **Create**: Add steps with title, content, and category selection
- ✅ **Read**: View all steps with category information
- ✅ **Update**: Edit step title, content, and category
- ✅ **Delete**: Remove steps (with confirmation)
- ✅ **Word Validation**: 150-word limit with real-time feedback

### **Database Reset**
- 🗑️ **Complete Reset**: Delete all categories and steps
- ⚠️ **Confirmation Required**: Prevents accidental deletion
- 🔄 **Fresh Start**: Clean database for testing

## 🔧 API Endpoints

### Categories
- `GET /api/admin/categories` - List all categories
- `POST /api/admin/categories` - Create new category
- `PUT /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category

### Steps
- `GET /api/admin/steps` - List all steps
- `POST /api/admin/steps` - Create new step
- `PUT /api/admin/steps/[id]` - Update step
- `DELETE /api/admin/steps/[id]` - Delete step

### Reset
- `DELETE /api/admin/reset/categories` - Delete all categories
- `DELETE /api/admin/reset/steps` - Delete all steps

## 🧪 Test Scenarios

### **Basic CRUD Testing**
1. Create a new category
2. Add multiple steps to that category
3. Edit the category name
4. Edit a step's content
5. Delete a step
6. Delete the category

### **Validation Testing**
1. Try to create a step with >150 words
2. Try to create a category with duplicate name
3. Try to create a step without selecting a category
4. Test word count display accuracy

### **Relationship Testing**
1. Create categories first
2. Create steps and assign to categories
3. Verify steps appear under correct categories
4. Test category filtering in step view

### **Search Testing**
1. Create multiple categories and steps
2. Search by category name
3. Search by step title
4. Search by step content
5. Verify search results are accurate

## 🐛 Troubleshooting

### **Common Issues**
- **"Category not found"**: Create categories before creating steps
- **"Word limit exceeded"**: Keep step content under 150 words
- **"Access denied"**: Ensure you're logged in as admin
- **"Database connection error"**: Check MongoDB connection

### **Reset Database**
If you encounter issues:
1. Go to Testing Interface
2. Click "Reset DB" button
3. Confirm deletion
4. Start fresh with test data

## 📊 Expected Results

After running the test script, you should see:
- **3 test categories** created
- **4 test steps** created across categories
- **Word counts** displayed correctly
- **Search functionality** working
- **CRUD operations** functioning properly

## 🔗 Related Files

- **Testing Interface**: `app/admin/test-models/page.tsx`
- **API Routes**: `app/api/admin/categories/` and `app/api/admin/steps/`
- **Reset APIs**: `app/api/admin/reset/`
- **Test Script**: `scripts/test-models.js`
- **Models**: `models/StepCategory.ts` and `models/GlobalSteps.ts`

## 🎯 Next Steps

After testing:
1. Verify all CRUD operations work correctly
2. Test the MPI integration (steps appear in step library)
3. Test the word limit validation
4. Verify category relationships
5. Test search and filter functionality

Happy Testing! 🚀

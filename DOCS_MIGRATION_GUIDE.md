# Docs Model Migration Guide

## Overview

This document outlines the migration of document-related fields from the `Admin` model to a new `Docs` model. This separation provides better organization and allows for independent management of document records.

## Changes Made

### 1. New Docs Model (`models/Docs.ts`)

**Fields moved from Admin to Docs:**
- `jobNo` (string, required, unique)
- `oldJobNo` (string, optional)
- `mpiNo` (string, required, unique)
- `mpiRev` (string, required)
- `docId` (string, required)
- `formId` (string, required)
- `formRev` (string, required)
- `isActive` (boolean, default: true)

**Features:**
- Full CRUD operations
- Unique constraints on `jobNo` and `mpiNo`
- Timestamps (createdAt, updatedAt)
- Indexes for performance

### 2. Updated Admin Model (`models/Admin.ts`)

**Remaining fields:**
- `email` (string, required, unique)
- `password` (string, required)
- `createdAt` (Date)
- `updatedAt` (Date)

**Features:**
- Password hashing
- Authentication methods
- Simplified structure

### 3. New API Routes

#### Admin Docs API (`app/api/admin/docs/`)
- `GET /api/admin/docs` - List all docs records
- `POST /api/admin/docs` - Create new docs record
- `GET /api/admin/docs/[id]` - Get specific docs record
- `PUT /api/admin/docs/[id]` - Update docs record
- `DELETE /api/admin/docs/[id]` - Soft delete docs record

### 4. New Admin Interface

#### Docs Management Page (`app/admin/docs/page.tsx`)
- Full CRUD interface for docs records
- Search and filter functionality
- Form validation
- Responsive design

#### Updated Admin Dashboard (`app/admin/dashboard/page.tsx`)
- Added "Manage Docs" quick action button
- Removed references to moved fields
- Updated interface to reflect new structure

### 5. Updated Scripts

#### Admin Creation Scripts
- `scripts/create-admin-simple.js` - Creates admin and default docs record
- `scripts/create-admin.js` - Creates admin and default docs record
- `scripts/manage-admins.js` - Interactive admin and docs management
- `scripts/delete-admin.js` - Deletes both admin and docs records

#### Migration Script
- `scripts/migrate-admin-to-docs.js` - Migrates existing data from old Admin model to new structure

## Migration Process

### Option 1: Fresh Start (Recommended for Development)

1. **Clear existing data:**
   ```bash
   node scripts/delete-admin.js
   ```

2. **Create new admin with docs:**
   ```bash
   node scripts/create-admin-simple.js
   ```

### Option 2: Data Migration (For Production)

1. **Run migration script:**
   ```bash
   node scripts/migrate-admin-to-docs.js
   ```

2. **Verify migration:**
   - Check admin records in database
   - Check docs records in database
   - Test login functionality

## Database Schema Changes

### Before Migration
```javascript
// Admin collection
{
  email: "admin@example.com",
  password: "hashed_password",
  jobNo: "ADMIN-001",
  oldJobNo: null,
  mpiNo: "MPI-ADMIN-001",
  mpiRev: "Rev A",
  docId: "DOC-ADMIN-001",
  formId: "FORM-ADMIN-001",
  formRev: "Rev A",
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

### After Migration
```javascript
// Admin collection
{
  email: "admin@example.com",
  password: "hashed_password",
  createdAt: Date,
  updatedAt: Date
}

// Docs collection
{
  jobNo: "ADMIN-001",
  oldJobNo: null,
  mpiNo: "MPI-ADMIN-001",
  mpiRev: "Rev A",
  docId: "DOC-ADMIN-001",
  formId: "FORM-ADMIN-001",
  formRev: "Rev A",
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

## API Usage Examples

### Create Docs Record
```javascript
const response = await fetch('/api/admin/docs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    jobNo: 'JOB-001',
    oldJobNo: 'OLD-001',
    mpiNo: 'MPI-001',
    mpiRev: 'Rev A',
    docId: 'DOC-001',
    formId: 'FORM-001',
    formRev: 'Rev A'
  })
})
```

### Get All Docs Records
```javascript
const response = await fetch('/api/admin/docs', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const { docs } = await response.json()
```

### Update Docs Record
```javascript
const response = await fetch(`/api/admin/docs/${docsId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    jobNo: 'JOB-001-UPDATED',
    mpiRev: 'Rev B'
  })
})
```

## Benefits of This Migration

1. **Separation of Concerns**: Admin authentication is separate from document management
2. **Scalability**: Docs records can be managed independently
3. **Flexibility**: Multiple docs records can be associated with different contexts
4. **Maintainability**: Cleaner code structure and easier to maintain
5. **Performance**: Optimized queries for specific use cases

## Testing the Migration

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Login as admin:**
   - Email: `admin@mpi-creator.com`
   - Password: `admin123456`

3. **Test docs management:**
   - Navigate to Admin Dashboard
   - Click "Manage Docs"
   - Create, edit, and delete docs records
   - Test search functionality

4. **Verify data integrity:**
   - Check that admin login still works
   - Verify docs records are properly created
   - Test all CRUD operations

## Troubleshooting

### Common Issues

1. **Migration fails with duplicate key error:**
   - Check for existing docs records
   - Clear existing data and retry

2. **Admin login fails after migration:**
   - Verify admin record exists in database
   - Check password hashing

3. **Docs API returns 401/403 errors:**
   - Verify JWT token is valid
   - Check admin permissions

### Recovery Steps

1. **Restore from backup** (if available)
2. **Re-run migration script**
3. **Manually create admin and docs records**

## Future Enhancements

1. **Docs Categories**: Group docs records by type
2. **Version Control**: Track changes to docs records
3. **Bulk Operations**: Import/export docs records
4. **Audit Trail**: Track who modified docs records
5. **Integration**: Link docs records to MPIs and other entities

## Support

For issues or questions regarding this migration:
1. Check the console logs for error messages
2. Verify database connectivity
3. Ensure all required environment variables are set
4. Review the API documentation for proper usage

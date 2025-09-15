# Docs Model CRUD Operations Guide

## Overview

The Docs model provides complete CRUD (Create, Read, Update, Delete) functionality for managing document records in the MPI system. This guide covers all available operations, API endpoints, and usage examples.

## Model Structure

### Docs Schema
```typescript
interface IDocs {
  jobNo: string          // Required, unique
  oldJobNo?: string      // Optional
  mpiNo: string          // Required, unique
  mpiRev: string         // Required
  docId: string          // Required
  formId: string         // Required
  formRev: string        // Required
  isActive: boolean      // Default: true
  createdAt: Date        // Auto-generated
  updatedAt: Date        // Auto-generated
}
```

### Database Indexes
- `jobNo` (unique)
- `oldJobNo`
- `mpiNo` (unique)
- `docId`
- `formId`
- `isActive`

## API Endpoints

### 1. Get All Docs Records
**Endpoint:** `GET /api/admin/docs`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "docs": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "jobNo": "JOB-001",
      "oldJobNo": "OLD-001",
      "mpiNo": "MPI-001",
      "mpiRev": "Rev A",
      "docId": "DOC-001",
      "formId": "FORM-001",
      "formRev": "Rev A",
      "isActive": true,
      "createdAt": "2023-09-01T10:00:00.000Z",
      "updatedAt": "2023-09-01T10:00:00.000Z"
    }
  ]
}
```

### 2. Create New Docs Record
**Endpoint:** `POST /api/admin/docs`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobNo": "JOB-002",
  "oldJobNo": "OLD-002",  // Optional
  "mpiNo": "MPI-002",
  "mpiRev": "Rev B",
  "docId": "DOC-002",
  "formId": "FORM-002",
  "formRev": "Rev B"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Docs record created successfully",
  "docs": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "jobNo": "JOB-002",
    "oldJobNo": "OLD-002",
    "mpiNo": "MPI-002",
    "mpiRev": "Rev B",
    "docId": "DOC-002",
    "formId": "FORM-002",
    "formRev": "Rev B",
    "isActive": true,
    "createdAt": "2023-09-01T10:05:00.000Z",
    "updatedAt": "2023-09-01T10:05:00.000Z"
  }
}
```

### 3. Get Single Docs Record
**Endpoint:** `GET /api/admin/docs/[id]`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "docs": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "jobNo": "JOB-001",
    "oldJobNo": "OLD-001",
    "mpiNo": "MPI-001",
    "mpiRev": "Rev A",
    "docId": "DOC-001",
    "formId": "FORM-001",
    "formRev": "Rev A",
    "isActive": true,
    "createdAt": "2023-09-01T10:00:00.000Z",
    "updatedAt": "2023-09-01T10:00:00.000Z"
  }
}
```

### 4. Update Docs Record
**Endpoint:** `PUT /api/admin/docs/[id]`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobNo": "JOB-001-UPDATED",
  "oldJobNo": "OLD-001-UPDATED",
  "mpiNo": "MPI-001-UPDATED",
  "mpiRev": "Rev A-Updated",
  "docId": "DOC-001-UPDATED",
  "formId": "FORM-001-UPDATED",
  "formRev": "Rev A-Updated"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Docs record updated successfully",
  "docs": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "jobNo": "JOB-001-UPDATED",
    "oldJobNo": "OLD-001-UPDATED",
    "mpiNo": "MPI-001-UPDATED",
    "mpiRev": "Rev A-Updated",
    "docId": "DOC-001-UPDATED",
    "formId": "FORM-001-UPDATED",
    "formRev": "Rev A-Updated",
    "isActive": true,
    "createdAt": "2023-09-01T10:00:00.000Z",
    "updatedAt": "2023-09-01T10:10:00.000Z"
  }
}
```

### 5. Delete Docs Record (Soft Delete)
**Endpoint:** `DELETE /api/admin/docs/[id]`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Docs record deleted successfully"
}
```

### 6. Reset All Docs Records
**Endpoint:** `DELETE /api/admin/reset/docs`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 5 docs records",
  "deletedCount": 5
}
```

## Frontend Interface

### Admin Docs Management Page
**URL:** `/admin/docs`

**Features:**
- ✅ View all docs records in a responsive grid
- ✅ Search and filter docs records
- ✅ Create new docs records with form validation
- ✅ Edit existing docs records
- ✅ Delete docs records with confirmation
- ✅ Real-time updates and error handling
- ✅ Responsive design with modern UI

### Form Fields
- **Job Number** (required, unique)
- **Old Job Number** (optional)
- **MPI Number** (required, unique)
- **MPI Revision** (required)
- **Document ID** (required)
- **Form ID** (required)
- **Form Revision** (required)

## Validation Rules

### Required Fields
- `jobNo` - Must be unique
- `mpiNo` - Must be unique
- `mpiRev` - Cannot be empty
- `docId` - Cannot be empty
- `formId` - Cannot be empty
- `formRev` - Cannot be empty

### Unique Constraints
- `jobNo` must be unique across all docs records
- `mpiNo` must be unique across all docs records

### Optional Fields
- `oldJobNo` - Can be null or empty

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

#### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

#### 400 Bad Request
```json
{
  "error": "Job number, MPI number, MPI revision, document ID, form ID, and form revision are required"
}
```

#### 409 Conflict
```json
{
  "error": "Job number or MPI number already exists"
}
```

#### 404 Not Found
```json
{
  "error": "Docs record not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Usage Examples

### JavaScript/TypeScript

#### Fetch All Docs Records
```javascript
const fetchDocs = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/admin/docs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('Docs records:', result.docs)
    } else {
      console.error('Failed to fetch docs')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

#### Create New Docs Record
```javascript
const createDocs = async (docsData) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/admin/docs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(docsData)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('Created docs record:', result.docs)
    } else {
      const error = await response.json()
      console.error('Error:', error.error)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

// Usage
createDocs({
  jobNo: 'JOB-003',
  oldJobNo: 'OLD-003',
  mpiNo: 'MPI-003',
  mpiRev: 'Rev C',
  docId: 'DOC-003',
  formId: 'FORM-003',
  formRev: 'Rev C'
})
```

#### Update Docs Record
```javascript
const updateDocs = async (id, docsData) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/docs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(docsData)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('Updated docs record:', result.docs)
    } else {
      const error = await response.json()
      console.error('Error:', error.error)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

#### Delete Docs Record
```javascript
const deleteDocs = async (id) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/docs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('Deleted docs record:', result.message)
    } else {
      const error = await response.json()
      console.error('Error:', error.error)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## Testing Scripts

### Seed Docs Records
```bash
node scripts/seed-docs.js
```

### Test Docs Model
```bash
node scripts/test-docs.js
```

### Reset Docs Records
```bash
# Via API call or use the admin interface
```

## Security

### Authentication
- All endpoints require admin authentication
- JWT token must be provided in Authorization header
- Token must be valid and not expired

### Authorization
- Only admin users can perform CRUD operations
- User type is verified on each request

### Data Validation
- Server-side validation for all required fields
- Unique constraint validation
- Input sanitization and trimming

## Performance

### Database Indexes
- Optimized indexes on frequently queried fields
- Unique indexes on `jobNo` and `mpiNo`
- Index on `isActive` for filtering

### Query Optimization
- Efficient queries with proper indexing
- Soft delete pattern for data retention
- Pagination support (can be added if needed)

## Monitoring and Logging

### Error Logging
- All errors are logged to console
- Detailed error messages for debugging
- Proper HTTP status codes

### Success Logging
- Operation success messages
- Timestamp tracking for audit trails
- User action logging (can be enhanced)

## Future Enhancements

### Potential Improvements
1. **Pagination** - Add pagination for large datasets
2. **Bulk Operations** - Support bulk create/update/delete
3. **Export/Import** - CSV/Excel export and import functionality
4. **Audit Trail** - Track who made changes and when
5. **File Attachments** - Support for document file uploads
6. **Versioning** - Track document revisions
7. **Search Enhancement** - Full-text search capabilities
8. **API Rate Limiting** - Prevent abuse of API endpoints

## Troubleshooting

### Common Issues

#### 1. Duplicate Key Error
**Problem:** Job number or MPI number already exists
**Solution:** Use unique values or update existing record

#### 2. Authentication Error
**Problem:** Token expired or invalid
**Solution:** Re-login to get new token

#### 3. Validation Error
**Problem:** Required fields missing
**Solution:** Ensure all required fields are provided

#### 4. Database Connection Error
**Problem:** MongoDB connection failed
**Solution:** Check database connection and environment variables

## Support

For issues or questions regarding the Docs CRUD functionality:
1. Check the console logs for error messages
2. Verify database connectivity
3. Ensure all required environment variables are set
4. Review the API documentation for proper usage
5. Test with the provided scripts

## Conclusion

The Docs model provides a complete CRUD system for managing document records in the MPI system. With proper authentication, validation, and error handling, it offers a robust solution for document management needs.

**Status: ✅ Complete and Ready for Use**

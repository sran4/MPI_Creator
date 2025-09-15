# Admin Setup Guide

This guide will help you delete existing admin records and create new ones with proper credentials.

## 🗑️ **Step 1: Delete Existing Admins (Optional)**

If you want to start fresh and delete all existing admin records:

```bash
node scripts/delete-admin.js
```

## 🔐 **Step 2: Create New Admin**

### **Option A: Quick Admin Creation (Recommended)**
```bash
node scripts/create-admin.js
```

This will create a default admin with these credentials:
- **Email**: `admin@mpi-creator.com`
- **Password**: `admin123456`

### **Option B: Interactive Admin Management**
```bash
node scripts/manage-admins.js
```

This provides an interactive menu where you can:
1. List all existing admins
2. Create new admins with custom credentials
3. Delete all admins
4. Exit

## 📋 **Default Admin Credentials**

After running the create-admin script, you can login with:

```
📧 Email:    admin@mpi-creator.com
🔑 Password: admin123456
```

## 🌐 **Access the Application**

1. Start your Next.js application:
   ```bash
   npm run dev
   ```

2. Go to the login page:
   ```
   http://localhost:3000/login
   ```

3. Use the credentials above to login

## ⚠️ **Important Security Notes**

1. **Change the password** after first login
2. **Use strong passwords** in production
3. **Keep credentials secure**
4. **Don't commit credentials** to version control

## 🛠️ **Available Scripts**

| Script | Purpose |
|--------|---------|
| `scripts/create-admin.js` | Create default admin quickly |
| `scripts/manage-admins.js` | Interactive admin management |
| `scripts/delete-admin.js` | Delete all admin records |

## 🔧 **Custom Admin Creation**

If you want to create an admin with different credentials, you can:

1. **Edit the script**: Modify `scripts/create-admin.js` and change the email/password
2. **Use interactive mode**: Run `scripts/manage-admins.js` and choose option 2
3. **Create multiple admins**: Use the interactive script to create as many as needed

## 📝 **Admin Fields**

Each admin record includes:
- **email** (required, unique)
- **password** (required, min 8 chars)
- **jobNo** (required, unique)
- **oldJobNo** (optional)
- **mpiNo** (required, unique)
- **mpiRev** (required)
- **docId** (required)
- **formId** (required)
- **formRev** (required)
- **isActive** (default: true)

## 🚨 **Troubleshooting**

### **"Admin already exists" error**
- The email, job number, or MPI number is already in use
- Use a different email or delete existing admin first

### **"Database connection failed"**
- Make sure MongoDB is running
- Check your `.env` file for correct `MONGODB_URI`

### **"Password too short" error**
- Password must be at least 8 characters long

## 🎯 **Next Steps**

1. Run the admin creation script
2. Start your application (`npm run dev`)
3. Login with the provided credentials
4. Change the password in the application
5. Start using the MPI Creator system!

---

**Need help?** Check the application logs or contact support.

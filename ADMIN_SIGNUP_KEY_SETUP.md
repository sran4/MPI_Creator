# 🔐 Admin Signup Key Setup Guide

## 🎯 Your Secure Admin Signup Keys (Pick One)

Choose one of these cryptographically secure keys for your admin signup:

### ✅ **Option 1 (Recommended - Hex format, 64 chars):**

```
59419360c84d78e5588919b8a74690e32a02915dc2a386985a4f275d35f08e86
```

### ✅ **Option 2 (Base64 format, 44 chars):**

```
tFufG+vPGkXNdhCBgWDx5SgyD+47+Wa0mTXii8P4SHU=
```

### ✅ **Option 3 (Alternative hex, 64 chars):**

```
4e3eda4fc6dc6c59fe8b071213c814ccf045fabe084f6b1b49e94aebba076704
```

> **All three are equally secure.** Choose any one you prefer!

---

## 🚀 Quick Setup

### 1. Add to `.env.local`

```env
# .env.local
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret-here
ADMIN_SIGNUP_KEY=your-admin-signup-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Add to Vercel Environment Variables

When deploying:

1. Go to Vercel Project → Settings → Environment Variables
2. Add new variable:
   - **Name:** `ADMIN_SIGNUP_KEY`
   - **Value:** (paste your chosen key)
   - **Environment:** Production, Preview, Development
3. Click "Save"
4. Redeploy your application

---

## 📝 How Admin Signup Works

### Current Implementation

```typescript
// app/api/auth/admin-signup/route.ts
const validAdminKey = process.env.ADMIN_SIGNUP_KEY || 'ADMIN_MPI_2024';
if (adminKey !== validAdminKey) {
  return NextResponse.json({ error: 'Invalid admin key' }, { status: 403 });
}
```

### Signup Flow

```
1. Admin navigates to /admin/signup
2. Fills in: Full Name, Title, Email, Password
3. Enters ADMIN_SIGNUP_KEY (kept secret)
4. Server validates the admin key
5. If valid, admin account is created
6. Admin receives JWT token
7. Admin is logged in and redirected to dashboard
```

---

## 🔒 Security Best Practices

### DO:

- ✅ **Keep it secret** - Only share with trusted admins
- ✅ **Use environment variable** - Never hardcode
- ✅ **Use strong key** - 64+ characters, random
- ✅ **Share securely** - Use encrypted channels (Signal, 1Password, etc.)
- ✅ **Rotate periodically** - Change every 6-12 months
- ✅ **Document who has it** - Keep track of admin access

### DON'T:

- ❌ **Never commit to Git** - Use .env.local
- ❌ **Never share in plain text** - Email, Slack without encryption
- ❌ **Never use simple strings** - Like "admin123" or "ADMIN_MPI_2024"
- ❌ **Never reuse across projects** - Unique key per project
- ❌ **Never write it down publicly** - Keep in password manager

---

## 🎯 Access the Admin Signup Page

### Development (Local)

```
http://localhost:3000/admin/signup
```

### Production (Vercel)

```
https://your-app.vercel.app/admin/signup
```

### What You'll Need:

1. Full Name
2. Title (optional)
3. Email address
4. Strong password
5. **ADMIN_SIGNUP_KEY** (the secret key)

---

## 🔧 Generate Your Own Key

If you want to generate a new key:

```bash
# Generate 64-character hex string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate base64 encoded string
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🛡️ Multiple Admin Strategy

### Option 1: Single Key for All Admins (Current)

- One `ADMIN_SIGNUP_KEY` for all admins
- Simple to manage
- Can't track who created which admin

### Option 2: Time-Limited Keys (Advanced)

Update the code to support temporary keys:

```typescript
// Example: Keys that expire
const validKeys = {
  'key-2024-oct': new Date('2024-11-01'),
  'key-2024-nov': new Date('2024-12-01'),
};

const isValidKey = (key: string) => {
  const expiry = validKeys[key];
  return expiry && new Date() < expiry;
};
```

### Option 3: One-Time Use Keys (Most Secure)

Store keys in database and mark as used after first signup:

```typescript
// Example: One-time keys
const signupKey = await SignupKey.findOne({ key: adminKey, used: false });
if (!signupKey) {
  return NextResponse.json({ error: 'Invalid or used key' });
}
signupKey.used = true;
await signupKey.save();
```

---

## 🔄 Rotating Your Admin Key

If you need to change the key:

### 1. Generate New Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Update `.env.local`

```env
ADMIN_SIGNUP_KEY=your-new-key-here
```

### 3. Update Vercel Environment Variables

- Go to Vercel dashboard
- Update `ADMIN_SIGNUP_KEY`
- Redeploy application

### 4. Notify Authorized Users

- Share new key securely with team
- Old key becomes invalid immediately

---

## 📋 Admin Access Checklist

Before giving someone admin access:

- [ ] They need admin privileges (not just engineer)
- [ ] They understand the responsibility
- [ ] Share `ADMIN_SIGNUP_KEY` securely (password manager, encrypted channel)
- [ ] Verify they can access `/admin/signup`
- [ ] Confirm they created account successfully
- [ ] Test their admin dashboard access
- [ ] Document their admin creation in team records

---

## 🚨 If Admin Key Is Compromised

If you suspect the admin key was leaked:

### Immediate Actions:

1. **Generate new key immediately**

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update environment variables**
   - Update `.env.local` locally
   - Update Vercel environment variables
   - Redeploy application

3. **Audit existing admins**
   - Check MongoDB for admin accounts
   - Verify all are legitimate
   - Remove any suspicious accounts

4. **Notify team**
   - Inform legitimate admins
   - Share new key securely
   - Explain the incident

---

## 🧪 Testing Admin Signup

### Test Locally:

1. Start dev server: `npm run dev`
2. Go to: `http://localhost:3000/admin/signup`
3. Fill in form with test data:
   - Full Name: Test Admin
   - Title: System Administrator
   - Email: admin@test.com
   - Password: TestPassword123!
   - Admin Key: (your ADMIN_SIGNUP_KEY)
4. Click "Sign Up"
5. Should redirect to admin dashboard

### Verify in MongoDB:

```javascript
// MongoDB Compass or Atlas
use('mpi-creator');
db.admins.find({ email: 'admin@test.com' });
// Should show your new admin account
```

---

## 📊 Current Status

### Default Key (WEAK - Change This!)

```
ADMIN_MPI_2024  ❌ Too simple, publicly visible
```

### Recommended (STRONG)

```
64+ character cryptographically random string ✅
Example: 5a3f9b2c8d1e4f7a0b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2
```

---

## 💡 Quick Reference

### Check current key in code:

```typescript
// Line 20 in app/api/auth/admin-signup/route.ts
const validAdminKey = process.env.ADMIN_SIGNUP_KEY || 'ADMIN_MPI_2024';
```

### Check if .env.local has key:

```bash
# Windows
findstr "ADMIN_SIGNUP_KEY" .env.local

# Mac/Linux
grep "ADMIN_SIGNUP_KEY" .env.local
```

### Test key validation:

```bash
# Try signing up with wrong key (should fail)
# Try signing up with correct key (should succeed)
```

---

## 🎯 Ready Checklist

Before allowing admin signups:

- [ ] Strong `ADMIN_SIGNUP_KEY` generated (64+ chars)
- [ ] Key added to `.env.local`
- [ ] `.env.local` is in `.gitignore`
- [ ] Key added to Vercel (if deployed)
- [ ] Tested admin signup locally
- [ ] Key shared securely with authorized personnel
- [ ] Documented who has admin access
- [ ] Set calendar reminder to rotate key (6-12 months)

---

## 🔗 Related Files

- **API Route:** `app/api/auth/admin-signup/route.ts`
- **Signup Page:** `app/admin/signup/page.tsx`
- **Admin Model:** `models/Admin.ts`

---

## 📞 Troubleshooting

### "Invalid admin key" error

- ✅ Check key is exactly correct (case-sensitive)
- ✅ No extra spaces before/after
- ✅ Environment variable is loaded (`console.log` it)
- ✅ Server restarted after updating `.env.local`

### Admin signup page not accessible

- ✅ Check route exists: `/admin/signup`
- ✅ Server is running
- ✅ No console errors

### Key not working in production

- ✅ Added to Vercel environment variables
- ✅ Application redeployed after adding variable
- ✅ Variable name exactly matches: `ADMIN_SIGNUP_KEY`

---

**Security Level:** 🔐 **Critical**  
**Recommended Key Length:** 64+ characters  
**Rotation Period:** Every 6-12 months  
**Share Method:** Encrypted channels only

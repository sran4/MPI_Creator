# 🔐 JWT Secret Generator Guide

## ✅ Your Secure JWT Secrets (Generated)

Choose one of these cryptographically secure secrets for your `.env.local` file:

### Option 1 (Hex - 128 characters)

```
37dc4f98c1325c132a082160b10ca8e3a5da554d5195b5fbe47204b1c1438415fa536beafcc6098bece4209a5a5bf82a4cbf832f763dd580d180fab05a91a743
```

### Why These Are Secure:

- ✅ **128 characters long** (exceeds 64-character minimum)
- ✅ **Cryptographically random** (using Node.js crypto module)
- ✅ **Hex encoded** (numbers 0-9 and letters a-f)
- ✅ **Unique** (virtually impossible to guess or brute force)

---

## 📝 How to Use

### 1. Copy Your Secret

Choose one of the secrets above.

### 2. Add to `.env.local`

```env
# .env.local
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=37dc4f98c1325c132a082160b10ca8e3a5da554d5195b5fbe47204b1c1438415fa536beafcc6098bece4209a5a5bf82a4cbf832f763dd580d180fab05a91a743
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Add to Vercel Environment Variables

When deploying to Vercel:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add new variable:
   - **Name:** `JWT_SECRET`
   - **Value:** (paste your secret)
   - **Environment:** Production, Preview, Development
4. Click "Save"

---

## 🔧 Generate Your Own Secret (Optional)

If you want to generate additional secrets:

### Method 1: Node.js Command Line

```bash
# Generate 128-character hex string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate base64 encoded string
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### Method 2: In Your Terminal

**For Windows PowerShell:**

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**For Mac/Linux:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Method 3: Online Tools

⚠️ **Use with caution** - Only use trusted sources:

- [Generate Random Hex](https://www.random.org/strings/)
- Set length to 128 characters
- Use only hex digits (0-9, a-f)

---

## 🔒 Security Best Practices

### DO:

- ✅ **Keep it secret** - Never commit to Git
- ✅ **Use unique secrets** - Different for each environment
- ✅ **Minimum 64 characters** - We recommend 128+
- ✅ **Store in .env.local** - Gitignored by default
- ✅ **Use environment variables** - For Vercel/production

### DON'T:

- ❌ **Never hardcode** in your application code
- ❌ **Never share publicly** on GitHub, forums, etc.
- ❌ **Never use simple strings** like "mysecret123"
- ❌ **Never use the same secret** across multiple projects
- ❌ **Never commit .env.local** to version control

---

## 🔍 Verify Your Secret

Your JWT_SECRET should:

- [ ] Be at least 64 characters long (ours are 128!)
- [ ] Contain random characters
- [ ] Not be a dictionary word or phrase
- [ ] Be stored in `.env.local` (not in code)
- [ ] Be in `.gitignore` to prevent commits

---

## 🚨 What If Your Secret Is Compromised?

If you suspect your JWT_SECRET has been exposed:

1. **Generate a new secret immediately**

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Update `.env.local`**

   ```env
   JWT_SECRET=your-new-secret-here
   ```

3. **Update Vercel environment variables**
   - Go to Vercel dashboard
   - Update JWT_SECRET
   - Redeploy your application

4. **All users will need to login again**
   - Old tokens will be invalidated
   - This is expected behavior

---

## 📖 How JWT_SECRET Works

```
User Login Flow:
1. User enters credentials
2. Server validates password with bcrypt
3. Server creates JWT token using JWT_SECRET
4. Token = Header + Payload + Signature
5. Signature = HMAC-SHA256(header + payload, JWT_SECRET)
6. Token sent to client
7. Client stores token in localStorage
8. Client includes token in API requests
9. Server verifies token using same JWT_SECRET
10. If valid, request is authorized
```

**Why it needs to be secret:**

- Anyone with the JWT_SECRET can create valid tokens
- They could impersonate any user
- They could access protected routes
- Keep it secret! 🔐

---

## 🧪 Test Your JWT Secret

After setting up, test that it works:

```bash
# Start your dev server
npm run dev

# Try to login at http://localhost:3000/login
# If successful, your JWT_SECRET is working!
```

---

## 💡 Quick Reference

**Generate new secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Check if .env.local exists:**

```bash
# Windows
if exist .env.local (echo File exists) else (echo Create .env.local)

# Mac/Linux
test -f .env.local && echo "File exists" || echo "Create .env.local"
```

**Verify .env.local is in .gitignore:**

```bash
# Check if .env.local is ignored
git check-ignore .env.local
# If it shows ".env.local", it's ignored ✅
```

---

## 🎯 Ready Checklist

Before deploying, verify:

- [ ] JWT_SECRET is 64+ characters (recommend 128)
- [ ] JWT_SECRET is in `.env.local`
- [ ] `.env.local` is in `.gitignore`
- [ ] JWT_SECRET is added to Vercel environment variables
- [ ] Login/authentication works locally
- [ ] Different secrets for development and production (optional but recommended)

---

## 🔗 Related Documentation

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [JWT.io - Token Debugger](https://jwt.io/)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)

---

**Generated:** October 1, 2025  
**Method:** Node.js crypto.randomBytes(64)  
**Security Level:** ✅ Production-ready

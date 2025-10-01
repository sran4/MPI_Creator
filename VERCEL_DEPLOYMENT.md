# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Ready

Prepare these values before deploying:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mpi-creator
JWT_SECRET=your-128-character-jwt-secret-here
ADMIN_SIGNUP_KEY=your-64-character-admin-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**🔐 Generate Keys:**

```bash
# JWT Secret (128 chars)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Admin Signup Key (64 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. MongoDB Atlas Configuration

- [ ] Database created
- [ ] Database user created with read/write access
- [ ] Network access: Add `0.0.0.0/0` (allow all IPs for Vercel)
- [ ] Connection string copied

### 3. Cloudinary Setup

- [ ] Account created at cloudinary.com
- [ ] Cloud name noted
- [ ] API key and secret generated
- [ ] Test upload works

---

## 🔥 Deploy to Vercel

### Method 1: GitHub (Recommended)

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/mpi-creator.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Node.js Version: **18.x**

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all 5 variables from above
   - Select: Production, Preview, Development
   - Click "Add"

4. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# Set up and deploy? Y
# Which scope? Your account
# Link to existing project? N
# Project name? mpi-creator
# Directory? ./
# Override settings? N

# Add environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add ADMIN_SIGNUP_KEY
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET

# Deploy to production
vercel --prod
```

---

## ⚙️ Post-Deployment

### 1. Verify Deployment

Visit your deployment URL and check:

- [ ] Home page loads
- [ ] Can access `/login`
- [ ] Can access `/signup`
- [ ] No console errors (F12)

### 2. Test Authentication

- [ ] Sign up new user
- [ ] Login works
- [ ] Dashboard loads
- [ ] Logout works

### 3. Test Database Connection

- [ ] Can create MPI
- [ ] Can edit MPI
- [ ] Can delete MPI
- [ ] Data persists after refresh

### 4. Test Image Upload (if applicable)

- [ ] Can upload images to Cloudinary
- [ ] Images display correctly

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Cannot find module 'xyz'"**

```bash
# Solution: Install missing dependency
npm install xyz
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

**Error: "Build timeout"**

```bash
# Solution: Check for infinite loops or heavy computations during build
# Review any files that run at build time
```

### Runtime Errors

**Error: "Cannot connect to MongoDB"**

1. Check `MONGODB_URI` in Vercel environment variables
2. Verify IP whitelist in MongoDB Atlas (use 0.0.0.0/0)
3. Check database user has correct permissions
4. Test connection string locally first

**Error: "Invalid or expired token"**

1. Check `JWT_SECRET` is set in Vercel
2. Should be minimum 32 characters
3. Clear browser localStorage and try again

**Error: "Images not loading"**

1. Check Cloudinary credentials
2. Verify `next.config.js` has cloudinary in domains
3. Check image URLs in database

---

## 📊 Monitoring

### Vercel Dashboard

- **Deployments**: View all deployments and their status
- **Function Logs**: Real-time API route logs
- **Analytics**: Page views, performance metrics
- **Usage**: Bandwidth, build time, function invocations

### Key Metrics to Watch

1. **Build Time**: Should be <2 minutes
2. **Function Duration**: API routes should be <1 second
3. **Error Rate**: Keep below 1%
4. **Bandwidth**: Monitor for unusual spikes

---

## 🔄 Continuous Deployment

Once connected to GitHub, Vercel will automatically:

- ✅ Deploy on every push to `main` branch
- ✅ Create preview deployments for PRs
- ✅ Run builds and tests automatically
- ✅ Provide unique URLs for each deployment

### Workflow

```
1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to GitHub
4. Vercel automatically builds and deploys
5. Check deployment in Vercel dashboard
6. Visit your URL to verify
```

---

## 🎯 Custom Domain (Optional)

### Add Custom Domain

1. Go to Project Settings → Domains
2. Add your domain (e.g., mpi-creator.com)
3. Update DNS records as instructed:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. Wait for DNS propagation (up to 48 hours)
5. SSL certificate auto-generated by Vercel

---

## 🔒 Security Checklist

- [x] `.env.local` in `.gitignore`
- [x] Strong JWT_SECRET (64+ characters)
- [x] MongoDB credentials not in code
- [x] Cloudinary credentials secured
- [x] HTTPS enabled (automatic on Vercel)
- [x] CORS properly configured
- [x] Password hashing with bcrypt
- [x] JWT tokens expire after 30 days

---

## 📱 Testing in Production

### Create Test Admin

Use MongoDB Atlas or Compass to insert:

```javascript
use('mpi-creator');

db.admins.insertOne({
  email: 'admin@test.com',
  password: '$2a$10$...', // bcrypt hash of "TestPassword123!"
  fullName: 'Test Admin',
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

Generate bcrypt hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('TestPassword123!', 10))"
```

### Test Workflow

1. **Login as Admin**: `/login`
2. **Create Engineer**: `/admin/engineers/new`
3. **Login as Engineer**: Logout, login with engineer
4. **Create MPI**: `/mpi/new`
5. **Edit MPI**: Click edit button
6. **View MPI**: Click view button
7. **Print Preview**: Test print functionality

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ App loads at your Vercel URL
- ✅ Can sign up and login
- ✅ Can create/edit/delete MPIs
- ✅ Database operations work
- ✅ Images upload successfully
- ✅ No console errors
- ✅ Page load time < 2 seconds
- ✅ Mobile responsive

---

## 📞 Support

**Vercel Support:**

- Documentation: [vercel.com/docs](https://vercel.com/docs)
- Discord: [vercel.com/discord](https://vercel.com/discord)

**MongoDB Support:**

- Documentation: [mongodb.com/docs](https://mongodb.com/docs)
- Community: [mongodb.com/community](https://mongodb.com/community)

---

**Last Updated:** October 1, 2025  
**Next.js Version:** 14.0.0  
**Node.js Version:** 18+

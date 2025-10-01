# Development Guide

> Comprehensive guide for developers working on the MPI Traveler Combo Creator project.

## 📚 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Architecture](#architecture)
4. [Performance](#performance)
5. [Testing](#testing)
6. [Deployment](#deployment)

---

## 🚀 Getting Started

### Prerequisites

```bash
node --version  # v18.0.0 or higher
npm --version   # v9.0.0 or higher
```

### Installation

```bash
npm install
```

### Environment Variables

Required variables in `.env.local`:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=minimum-32-character-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Development Server

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

---

## 🏗️ Architecture

### Database Schema

**MPI Model:**

```typescript
{
  jobNumber: String(unique, indexed);
  mpiNumber: String(unique, indexed);
  engineerId: ObjectId(indexed);
  customerCompanyId: ObjectId(indexed);
  sections: [{ id, title, content, order, images }];
  status: 'draft' | 'in-review' | 'approved';
  isActive: Boolean(indexed);
  // Compound index: { engineerId, isActive, updatedAt }
}
```

**Engineer Model:**

```typescript
{
  email: String (unique)
  password: String (hashed with bcrypt)
  fullName: String
  title: String
  isActive: Boolean
}
```

### API Routes

```
/api/auth/login          POST   - User authentication
/api/auth/me             GET    - Get current user
/api/mpi                 GET    - List MPIs (filtered by user)
/api/mpi                 POST   - Create new MPI
/api/mpi/[id]           GET    - Get specific MPI
/api/mpi/[id]           PUT    - Update MPI
/api/mpi/[id]           DELETE - Delete MPI
```

### Authentication Flow

```
1. User submits credentials to /api/auth/login
2. Server validates credentials with bcrypt
3. JWT token generated with 30-day expiry
4. Token stored in localStorage
5. Navbar checks auth on every page (with cache)
6. Protected routes verify JWT in API middleware
```

---

## ⚡ Performance

### Current Metrics (After Optimization)

| Metric           | Before | After  | Improvement     |
| ---------------- | ------ | ------ | --------------- |
| Dashboard API    | ~800ms | ~150ms | **81% faster**  |
| Database Queries | ~500ms | ~50ms  | **90% faster**  |
| Initial Load     | ~3.2s  | ~1.5s  | **53% faster**  |
| Bundle Size      | ~850KB | ~650KB | **24% smaller** |

### Optimizations Applied

#### 1. Database Indexes

```typescript
// Compound indexes for common queries
MPISchema.index({ engineerId: 1, isActive: 1, updatedAt: -1 });
MPISchema.index({ mpiNumber: 1 }, { unique: true });
MPISchema.index({ jobNumber: 1 });
```

#### 2. MongoDB Connection Pooling

```typescript
{
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  maxIdleTimeMS: 30000
}
```

#### 3. Lean Queries

```typescript
// Use .lean() to get plain JS objects (faster than Mongoose docs)
const mpis = await MPI.find({ engineerId, isActive: true })
  .populate('customerCompanyId', 'companyName')
  .lean()
  .limit(100);
```

#### 4. Next.js Configuration

```javascript
{
  swcMinify: true,              // Fast minification
  compress: true,                // Gzip compression
  images: {
    formats: ['image/avif', 'image/webp']
  },
  compiler: {
    removeConsole: {             // Remove logs in production
      exclude: ['error', 'warn']
    }
  }
}
```

### Future Optimizations

1. **Image Optimization** - Replace `<img>` with Next.js `<Image>` component
2. **Client-side Caching** - Implement SWR or React Query
3. **Code Splitting** - Dynamic imports for heavy components (TinyMCE)
4. **Skeleton Loading** - Add loading states for better UX

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**

- [ ] Sign up new engineer
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout clears all data
- [ ] Protected routes redirect to login

**MPI Creation:**

- [ ] Create new MPI with all fields
- [ ] Add/remove/reorder sections
- [ ] Save as draft
- [ ] Edit existing MPI
- [ ] Delete MPI

**Dashboard:**

- [ ] View all MPIs
- [ ] Filter by status
- [ ] Search by MPI number
- [ ] Pagination works correctly

**Performance:**

- [ ] Dashboard loads in <1.5s
- [ ] API responses in <200ms
- [ ] No console errors in production
- [ ] Images load lazy

### Test User Credentials

You'll need to create these manually in your development environment.

---

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured in Vercel
- [ ] MongoDB Atlas IP whitelist includes Vercel IPs (0.0.0.0/0 for simplicity)
- [ ] Cloudinary credentials are correct
- [ ] JWT_SECRET is strong (64+ characters)
- [ ] `.env.local` is in `.gitignore`
- [ ] Build succeeds locally (`npm run build`)

### Vercel Deployment

1. **Connect GitHub Repository**

   ```bash
   git remote add origin <your-repo>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Framework: Next.js
   - Root Directory: `./`

3. **Add Environment Variables**
   - Settings → Environment Variables
   - Add all variables from `.env.local`
   - Apply to: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your live URL

### Post-Deployment

1. **Verify Deployment**

   ```bash
   curl https://your-app.vercel.app/api/test
   ```

2. **Check Logs**
   - Vercel Dashboard → Deployments → View Function Logs
   - Monitor for any errors

3. **Test Authentication**
   - Create test user
   - Login/logout
   - Create MPI

### Environment Variables

Required for Vercel:

```
MONGODB_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

### MongoDB Atlas Configuration

1. **Network Access**
   - Add IP: `0.0.0.0/0` (Allow all - Vercel uses dynamic IPs)
   - Or use specific Vercel IP ranges

2. **Database User**
   - Ensure user has read/write permissions
   - Use strong password

3. **Connection String**
   - Use connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```

---

## 🐛 Common Issues

### Issue: "Cannot connect to MongoDB"

**Solution:**

```bash
# Check connection string format
# Verify MongoDB Atlas IP whitelist
# Ensure database user exists
```

### Issue: "JWT malformed" error

**Solution:**

```bash
# Clear localStorage in browser
localStorage.clear()
# Re-login
```

### Issue: Images not loading

**Solution:**

```javascript
// Verify next.config.js includes cloudinary domain
images: {
  domains: ['res.cloudinary.com'];
}
```

### Issue: Slow API responses

**Solution:**

```bash
# Check database indexes are created
# Use .lean() on queries
# Implement pagination
```

---

## 📊 Monitoring

### Key Metrics to Monitor

1. **API Response Times**
   - Target: <200ms for dashboard
   - Target: <500ms for MPI operations

2. **Database Query Performance**
   - Use MongoDB Atlas Performance Advisor
   - Monitor slow queries

3. **Error Rates**
   - Check Vercel Function Logs
   - Monitor 4xx/5xx responses

4. **Bundle Size**
   - Run: `ANALYZE=true npm run build`
   - Target: <1MB total

---

## 🔧 Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Importer
- MongoDB for VS Code

### Useful Commands

```bash
# Check TypeScript errors
npm run type-check

# Analyze bundle size
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build

# Database connection test
node -e "require('./lib/mongodb').default()"
```

---

## 📝 Code Style

### TypeScript Best Practices

- Use interfaces for data structures
- Avoid `any` type
- Use proper error handling
- Document complex functions

### React Best Practices

- Use functional components
- Implement proper error boundaries
- Memoize expensive computations
- Clean up effects properly

### API Route Best Practices

- Validate input data
- Use proper HTTP status codes
- Return consistent response format
- Handle errors gracefully

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

**Last Updated:** October 1, 2025
**Version:** 1.0.0

# MPI Generator - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/mpi-generator?retryWrites=true&w=majority

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 3. Database Setup

#### MongoDB Atlas Setup:
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string
6. Update `MONGODB_URI` in `.env.local`

#### Cloudinary Setup:
1. Go to [Cloudinary](https://cloudinary.com)
2. Create a free account
3. Get your cloud name, API key, and API secret
4. Update the Cloudinary variables in `.env.local`

### 4. Create Admin User
```bash
npm run seed-admin
```

This creates a default admin user:
- **Email:** admin@mpi-generator.com
- **Password:** admin123456

⚠️ **Change the password after first login!**

### 5. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📋 User Roles

### Admin
- **Login:** Use the seeded admin account
- **Permissions:** Full system access, manage engineers, create global steps
- **Dashboard:** `/admin/dashboard`

### Engineer
- **Registration:** Engineers can register themselves
- **Permissions:** Create MPIs, manage customers, use global steps
- **Dashboard:** `/dashboard`

## 🎯 Getting Started Workflow

### For Admins:
1. **Login** with admin credentials
2. **Add Engineers** via Admin Dashboard
3. **Create Global Steps** for common operations
4. **Monitor System** usage and analytics

### For Engineers:
1. **Register** new account or login
2. **Create Customers** with assembly details
3. **Create MPIs** for customer projects
4. **Use Global Steps** from the library
5. **Export Documents** as Word/PDF

## 🏗️ Project Structure

```
mpi-generator/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   ├── admin/         # Admin APIs
│   │   ├── mpi/           # MPI management
│   │   └── customers/     # Customer management
│   ├── admin/             # Admin pages
│   ├── dashboard/         # Engineer dashboard
│   ├── mpi/               # MPI creation/editing
│   ├── customers/         # Customer management
│   ├── login/             # Authentication pages
│   └── signup/
├── components/            # Reusable components
│   └── ui/               # UI components
├── lib/                  # Utilities
├── models/               # Database models
├── scripts/              # Setup scripts
└── public/              # Static assets
```

## 🔧 Key Features

### ✅ Implemented:
- **Authentication System** - JWT with role-based access
- **User Management** - Admin and Engineer roles
- **MPI Creation** - Complete MPI workflow
- **Customer Management** - Customer and project tracking
- **Global Steps Library** - Reusable step management
- **Document Export** - Word and PDF generation ready
- **Responsive Design** - Mobile-friendly interface
- **Dark/Light Mode** - Theme switching
- **Real-time Updates** - Live data synchronization

### 🚧 Ready for Enhancement:
- **Rich Text Editor** - React Quill integration
- **Drag & Drop** - Section reordering
- **Image Management** - Cloudinary integration
- **Advanced Search** - Full-text search
- **Version Control** - Complete audit trails
- **Collaboration** - Real-time editing

## 🐛 Troubleshooting

### Common Issues:

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:** Check your MongoDB URI and network access

#### 2. JWT Secret Error
```
Error: secretOrPrivateKey must have a value
```
**Solution:** Ensure JWT_SECRET is set in `.env.local`

#### 3. Cloudinary Upload Error
```
Error: Invalid cloud name
```
**Solution:** Verify Cloudinary credentials in `.env.local`

#### 4. Build Errors
```
Error: Cannot find module
```
**Solution:** Run `npm install` to install dependencies

### Debug Mode:
```bash
DEBUG=* npm run dev
```

## 📊 Database Schema

### Collections:
- **admins** - System administrators
- **engineers** - Manufacturing engineers
- **customers** - Customer and project data
- **mpis** - Manufacturing Process Instructions
- **globalsteps** - Reusable step library
- **images** - Global image library

### Indexes:
- Email fields for fast lookups
- Text indexes for search functionality
- Compound indexes for relationships

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Role-based Access** - Admin/Engineer permissions
- **Input Validation** - Server-side validation
- **CORS Protection** - Cross-origin security
- **Environment Variables** - Sensitive data protection

## 🚀 Deployment

### Vercel (Recommended):
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Other Platforms:
- **Netlify** - Static hosting
- **Railway** - Full-stack hosting
- **DigitalOcean** - VPS deployment

## 📈 Performance

### Optimizations:
- **Next.js 14** - Latest performance features
- **MongoDB Indexes** - Fast database queries
- **Image Optimization** - Cloudinary CDN
- **Code Splitting** - Automatic bundle optimization
- **Caching** - API response caching

## 🎨 Customization

### Styling:
- **Tailwind CSS** - Utility-first styling
- **Glassmorphism** - Modern design system
- **Dark Mode** - Theme switching
- **Responsive** - Mobile-first design

### Branding:
- Update colors in `tailwind.config.js`
- Modify glassmorphism effects in `globals.css`
- Customize animations in component files

## 📞 Support

### Getting Help:
1. Check this setup guide
2. Review error messages in console
3. Check MongoDB and Cloudinary dashboards
4. Verify environment variables

### Common Commands:
```bash
# Development
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Create admin user
npm run seed-admin
```

---

**MPI Generator** - Professional manufacturing documentation made simple.

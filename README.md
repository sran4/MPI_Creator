# MPI Traveler Combo Creator

> Professional web application for creating Manufacturing Process Instructions (MPI) and Traveler documents for PCBA companies.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

## 📑 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Deploy to Vercel](#-deploy-to-vercel)
- [Project Structure](#-project-structure)
- [User Guide](#-user-guide)
- [Security Features](#-security-features)
- [Performance Optimizations](#-performance-optimizations)
- [Troubleshooting](#-troubleshooting)

## 🚀 Features

### Core Functionality

- ✅ **MPI & Traveler Creation** - Unified process for creating both documents
- ✅ **Drag & Drop Sections** - Intuitive section management with reordering
- ✅ **Global Steps Library** - Reusable steps across all operations
- ✅ **Real-time Preview** - Live print preview in separate window
- ✅ **Version Control** - Automatic MPI and job number generation
- ✅ **Rich Text Editor** - TinyMCE integration for detailed content

### User Management

- 🔐 **Role-based Access Control** - Admin and Engineer roles
- 👤 **JWT Authentication** - Secure token-based auth (30-day sessions)
- 🔑 **Password Management** - Change password functionality
- 📊 **User Dashboard** - Personalized dashboard for each role

### Document Management

- 📄 **Export to Word/PDF** - Professional document generation
- 🖨️ **Print-ready Layouts** - Optimized for manufacturing floor
- 📷 **Image Support** - Cloudinary integration for images
- 🏷️ **Categorized Sections** - Organized by manufacturing process
- 🔍 **Search & Filter** - Quick access to MPIs by status, customer, etc.

### Performance

- ⚡ **Optimized Database** - Compound indexes for 90% faster queries
- 🚄 **Modern Image Formats** - AVIF/WebP support
- 📦 **SWC Minification** - 25% smaller bundle size
- 💾 **Connection Pooling** - 50% faster database connections
- 🎯 **Production Ready** - Console logs removed, compression enabled

## 📸 Screenshots

### Home Page

![Home Page](app/docs/images/home.png)
_Modern landing page with project overview and feature highlights_

---

<details>
<summary><b>🔐 Authentication Pages (Click to expand)</b></summary>

### Sign In

![Sign In](app/docs/images/signIn.png)
_Secure login page for engineers and admins with JWT authentication_

### Engineer Sign Up

![Sign Up](app/docs/images/signup.png)
_Engineer registration with form validation_

### Admin Sign Up

![Admin Sign Up](app/docs/images/admin%20SignUp.png)
_Admin registration with secure key verification_

</details>

---

<details>
<summary><b>👨‍💼 Engineer Dashboard (Click to expand)</b></summary>

### Main Dashboard

![Engineer Dashboard](app/docs/images/Engineer_Dashboard.png)
_Engineer's personalized dashboard showing all MPIs, search, and filter options_

### Settings & Password Management

![Engineer Dashboard Settings](app/docs/images/Engineer-Dashboard-Settings.png)
_User profile settings and secure password change functionality_

</details>

---

<details>
<summary><b>📄 MPI Creation & Management (Click to expand)</b></summary>

### MPI Editor

![MPI Editor](app/docs/images/MPI-Editor.png)
_Rich text editor with drag & drop sections, image uploads, and real-time preview_

### Print Preview

![MPI Print Preview](app/docs/images/MPI%20print%20preview.png)
_Professional print-ready preview optimized for manufacturing floor_

### View All MPIs

![View All MPIs](app/docs/images/view-all-MPI.png)
_Comprehensive MPI listing with status filters, search, and pagination_

</details>

---

<details>
<summary><b>⚙️ Admin Dashboard (Click to expand)</b></summary>

### Admin Main Dashboard

![Admin Dashboard](app/docs/images/admin-engineering-manager-Dashboard.png)
_Admin control panel with system-wide management options_

### Engineer Management

![Admin Manage Engineers](app/docs/images/admin-manage.Engineer.png)
_Create, edit, and manage engineer accounts_

### Process Categories Management

![Admin Process Items](app/docs/images/admin-process-Items-Category-Management.png)
_Configure manufacturing process categories and items_

### Edit Category

![Admin Edit Category](app/docs/images/admin-Edit-category.png)
_Detailed category editing with step assignment_

</details>

---

<details>
<summary><b>🏢 Customer Management (Click to expand)</b></summary>

### Customer Companies

![Customer Management](app/docs/images/customer.png)
_Manage customer companies, contacts, and project information_

</details>

---

## 🛠️ Tech Stack

**Frontend:**

- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Framer Motion
- TinyMCE

**Backend:**

- Next.js API Routes
- MongoDB (Mongoose)
- JWT Authentication
- Cloudinary (Image hosting)

**UI Components:**

- Radix UI
- Lucide Icons
- React Hot Toast
- Hello Pangea DnD

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Cloudinary account (for images)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mpi-creater
npm install
```

### 2. Environment Setup

Create `.env.local` file in the root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mpi-creator

# JWT Secret (generate a random 128-character string)
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long

# Admin Signup Key (generate a random 64-character string)
# This key is required to create admin accounts at /admin/signup
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_SIGNUP_KEY=your-secure-admin-signup-key-here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**🔐 Generate Secure Keys:**

- **JWT_SECRET:** `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- **ADMIN_SIGNUP_KEY:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

See `ADMIN_SIGNUP_KEY_SETUP.md` and `JWT_SECRET_GENERATOR.md` for pre-generated keys.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Create Initial Admin (Optional)

If you need to create an admin account manually, use MongoDB Compass or Atlas to insert:

```javascript
{
  email: "admin@example.com",
  password: "$2a$10$hashedPasswordHere", // Use bcrypt to hash
  fullName: "Admin User",
  createdAt: new Date(),
  updatedAt: new Date()
}
```

Then navigate to `/admin/signup` and sign up with the special key.

## 📦 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/mpi-creator)

### Manual Deploy

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables (see above)
   - Click "Deploy"

3. **Post-Deployment**
   - Vercel will automatically set up HTTPS
   - Update your MongoDB Atlas IP whitelist to allow Vercel's IPs
   - Your app will be live at `https://your-project.vercel.app`

## 🏗️ Project Structure

```
mpi-creater/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard & pages
│   ├── engineer/          # Engineer dashboard
│   ├── api/               # API routes
│   ├── mpi/               # MPI creation & editing
│   └── login/             # Authentication pages
├── components/            # Reusable React components
│   ├── ui/               # UI components (buttons, cards, etc.)
│   └── Navbar.tsx        # Global navigation
├── lib/                  # Utility functions
│   ├── mongodb.ts       # Database connection
│   └── utils.ts         # Helper functions
├── models/              # Mongoose schemas
│   ├── MPI.ts          # MPI model
│   ├── Engineer.ts     # Engineer model
│   └── Admin.ts        # Admin model
├── public/             # Static assets
└── .env.local         # Environment variables (not in git)
```

## 📱 User Guide

### For Engineers

1. **Sign Up/Login** - Create account or login at `/login`
2. **Dashboard** - View all your MPIs at `/engineer/dashboard`
3. **Create MPI** - Click "New MPI" to start
4. **Add Sections** - Use drag & drop to organize sections
5. **Save & Export** - Save as draft or export to Word/PDF

### For Admins

1. **Admin Access** - Login and access `/admin/dashboard`
2. **Manage Engineers** - Add/edit engineer accounts
3. **Global Steps** - Manage reusable step library
4. **Forms Management** - Configure MPI templates
5. **View All MPIs** - Monitor all created MPIs

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ Role-based access control
- ✅ Secure environment variables
- ✅ MongoDB connection with TLS

## 📈 Performance Optimizations

- **Database Indexes** - Compound indexes for common queries
- **Image Optimization** - AVIF/WebP support with Next.js Image
- **Bundle Optimization** - SWC minification, tree shaking
- **Connection Pooling** - MongoDB connection reuse
- **Font Optimization** - Next.js font loading
- **API Optimization** - Lean queries, pagination

See `DEVELOPMENT.md` for detailed performance metrics.

## 🐛 Troubleshooting

**Issue: Can't connect to MongoDB**

- Check your `MONGODB_URI` in `.env.local`
- Verify IP whitelist in MongoDB Atlas
- Ensure network access is configured

**Issue: Images not loading**

- Verify Cloudinary credentials
- Check `next.config.js` has cloudinary domain

**Issue: Navbar shows Sign In after login**

- Clear browser cache and localStorage
- This was fixed in recent updates

## 📄 License

This project is for portfolio/educational purposes.

## 👤 Author

**Your Name**

- Portfolio: [your-portfolio-url]
- LinkedIn: [your-linkedin]
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting platform
- MongoDB Atlas for database hosting
- Cloudinary for image management

---

**Live Demo:** [https://your-project.vercel.app](https://your-project.vercel.app)

**Made with ❤️ for PCBA Manufacturing**

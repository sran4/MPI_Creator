# 🚀 MPI Creator - Comprehensive Setup Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Installation](#detailed-installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Testing Setup](#testing-setup)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **MongoDB**: Version 5.0 or higher
- **Git**: For version control
- **Operating System**: Windows 10+, macOS 10.15+, or Linux

### Development Tools (Recommended)

- **VS Code**: Primary development environment
- **MongoDB Compass**: Database management GUI
- **Postman**: API testing tool
- **Git**: Version control system

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "mongodb.mongodb-vscode",
    "ms-vscode.vscode-json"
  ]
}
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mpi-creator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
# Update MONGODB_URI and JWT_SECRET
```

### 4. Seed Test Data

```bash
node scripts/seed-test-data.js
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Access Application

- **Application**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Engineer Dashboard**: http://localhost:3000/engineer/dashboard

## Detailed Installation

### Step 1: System Setup

#### Install Node.js

1. Visit [nodejs.org](https://nodejs.org/)
2. Download LTS version (18.x or higher)
3. Run installer and follow instructions
4. Verify installation:

```bash
node --version
npm --version
```

#### Install MongoDB

**Option A: MongoDB Community Server (Local)**

1. Visit [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Download appropriate version for your OS
3. Install following platform-specific instructions
4. Start MongoDB service:

```bash
# Windows
net start MongoDB

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**

1. Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster
4. Get connection string

#### Install Git

1. Visit [git-scm.com](https://git-scm.com/)
2. Download and install
3. Configure Git:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 2: Project Setup

#### Clone Repository

```bash
git clone <repository-url>
cd mpi-creator
```

#### Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

#### Verify Project Structure

```
mpi-creator/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin-specific pages
│   ├── api/               # API routes
│   ├── engineer/          # Engineer-specific pages
│   ├── mpi/               # MPI management pages
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility libraries
├── models/                # MongoDB models
├── scripts/               # Utility scripts
├── public/                # Static assets
├── .env.local            # Environment variables
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## Environment Configuration

### Create Environment File

```bash
# Copy template
cp .env.example .env.local

# Or create new file
touch .env.local
```

### Environment Variables

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mpi-creator
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/mpi-creator

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Application Settings
NODE_ENV=development
PORT=3000

# File Upload (Optional)
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./public/uploads

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Security Considerations

- **JWT_SECRET**: Use a strong, random string (32+ characters)
- **Database Credentials**: Use strong passwords
- **Environment Files**: Never commit `.env.local` to version control
- **Production**: Use different secrets for production environment

## Database Setup

### Local MongoDB Setup

#### Start MongoDB Service

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Create Database

```bash
# Connect to MongoDB
mongosh

# Create database
use mpi-creator

# Create collections (optional - will be created automatically)
db.createCollection("admins")
db.createCollection("engineers")
db.createCollection("customercompanies")
db.createCollection("mpis")
db.createCollection("forms")
db.createCollection("processitems")
db.createCollection("tasks")

# Exit
exit
```

### MongoDB Atlas Setup

#### Create Cluster

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create new project
3. Build cluster (free tier available)
4. Configure network access (add your IP)
5. Create database user
6. Get connection string

#### Update Environment

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mpi-creator?retryWrites=true&w=majority
```

### Seed Test Data

```bash
# Run seeding script
node scripts/seed-test-data.js

# Verify data creation
node scripts/verify-test-data.js
```

## Testing Setup

### Run Test Suite

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Manual Testing

1. **Start application**: `npm run dev`
2. **Access application**: http://localhost:3000
3. **Test admin login**: `admin1@test.com` / `admin123456`
4. **Test engineer login**: `engineer1@test.com` / `engineer123456`
5. **Verify features**: Create MPI, add sections, upload images, print preview

### API Testing with Postman

1. Import API collection (if available)
2. Set base URL: `http://localhost:3000/api`
3. Test authentication endpoints
4. Test MPI CRUD operations
5. Test admin endpoints

## Development Workflow

### Daily Development

```bash
# Start development server
npm run dev

# In another terminal, run tests
npm run test:watch

# Check code quality
npm run lint
npm run format
```

### Code Quality Tools

```bash
# ESLint - Code quality
npm run lint

# Prettier - Code formatting
npm run format

# TypeScript - Type checking
npm run type-check

# Build check
npm run build
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
# Merge after review
```

### Database Development

```bash
# Connect to database
mongosh

# View collections
show collections

# Query data
db.mpis.find().limit(5)

# Update data
db.mpis.updateOne({_id: ObjectId("...")}, {$set: {status: "approved"}})

# Exit
exit
```

## Production Deployment

### Build for Production

```bash
# Install production dependencies
npm ci

# Build application
npm run build

# Start production server
npm start
```

### Environment Variables (Production)

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mpi-creator
JWT_SECRET=super-secure-production-secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=production-nextauth-secret
```

### Docker Deployment

```bash
# Build Docker image
docker build -t mpi-creator .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  mpi-creator
```

### Deployment Platforms

#### Vercel (Recommended for Next.js)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

#### Netlify

1. Connect repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Set environment variables

#### AWS/Google Cloud/Azure

1. Set up cloud infrastructure
2. Configure environment variables
3. Deploy using platform-specific tools

## Troubleshooting

### Common Issues

#### MongoDB Connection Issues

```bash
# Check MongoDB status
# Windows
net start MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod

# Test connection
mongosh "mongodb://localhost:27017/mpi-creator"
```

#### Node.js Version Issues

```bash
# Check Node.js version
node --version

# Update Node.js if needed
# Download from nodejs.org or use nvm
nvm install 18
nvm use 18
```

#### Port Already in Use

```bash
# Find process using port 3000
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Kill process
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

#### Environment Variables Not Loading

```bash
# Check file exists
ls -la .env.local

# Check file permissions
chmod 600 .env.local

# Restart development server
npm run dev
```

#### Database Connection Errors

```bash
# Check MongoDB URI format
echo $MONGODB_URI

# Test connection string
mongosh "$MONGODB_URI"

# Check network connectivity
ping mongodb.net
```

### Performance Issues

#### Slow Database Queries

```bash
# Check database indexes
mongosh
use mpi-creator
db.mpis.getIndexes()

# Add indexes if needed
db.mpis.createIndex({engineerId: 1})
db.mpis.createIndex({mpiNumber: 1})
```

#### Large Bundle Size

```bash
# Analyze bundle
npm run analyze

# Check for unused dependencies
npm ls --depth=0

# Remove unused dependencies
npm uninstall <package-name>
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Enable specific debug
DEBUG=mongoose npm run dev
```

## Getting Help

### Documentation

- **README.md**: Project overview and quick start
- **API Documentation**: Available at `/api/docs` (if implemented)
- **Component Documentation**: In component files

### Support Channels

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check existing guides and FAQs
- **Community**: Join developer community discussions

### Useful Commands

```bash
# Check application health
curl http://localhost:3000/api/health

# View logs
npm run dev 2>&1 | tee logs/app.log

# Database backup
mongodump --uri="mongodb://localhost:27017/mpi-creator" --out=backup/

# Database restore
mongorestore --uri="mongodb://localhost:27017/mpi-creator" backup/mpi-creator/
```

---

**This comprehensive setup guide should help you get MPI Creator running smoothly in any environment. For additional support, please refer to the troubleshooting section or create an issue in the repository.**

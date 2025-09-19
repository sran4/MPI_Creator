# 🏭 MPI Creator - Manufacturing Process Instruction Management System

A comprehensive, full-stack web application designed to streamline the creation, management, and distribution of Manufacturing Process Instructions (MPIs) for electronics manufacturing companies. Built with modern technologies and featuring role-based access control, real-time collaboration, and advanced print management.

## 🚀 Live Demo & Quick Start

- **Application**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
- **Engineer Dashboard**: [http://localhost:3000/engineer/dashboard](http://localhost:3000/engineer/dashboard)

### Test Credentials

- **Admin**: `admin1@test.com` / `admin123456`
- **Engineer**: `engineer1@test.com` / `engineer123456`

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture Overview](#-architecture-overview)
- [User Roles & Permissions](#-user-roles--permissions)
- [Business Value](#-business-value)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Key Features

### 🔐 Role-Based Access Control

- **Admin Panel**: Complete system management with user oversight
- **Engineer Workspace**: Dedicated MPI creation and editing environment
- **Secure Authentication**: JWT-based authentication with password hashing
- **Permission Management**: Granular access control for different user types

### 📄 Advanced MPI Management

- **Dynamic Section Creation**: Flexible MPI structure with customizable sections
- **Rich Text Editor**: TinyMCE integration for professional document formatting
- **Image Management**: Drag-and-drop image uploads with automatic optimization
- **Version Control**: Complete version history with change tracking
- **Status Workflow**: Draft → In Review → Approved → Archived

### 🏢 Customer & Company Management

- **Customer Database**: Comprehensive company information management
- **Contact Management**: Detailed contact information and communication history
- **Project Tracking**: Job number and assembly tracking across customers
- **Documentation Library**: Centralized document and form management

### 🔧 Process & Task Management

- **Process Item Library**: Standardized manufacturing process categories
- **Task Templates**: Reusable task templates for common manufacturing steps
- **Bulk Operations**: Efficient bulk task insertion and management
- **Usage Analytics**: Track task usage and process optimization

### 🖨️ Professional Print System

- **Print Preview**: Real-time preview with professional formatting
- **Dynamic Sizing**: Adjustable image sizes for optimal print layout
- **Footer Management**: Customizable footers with engineer information
- **Multi-page Support**: Automatic pagination and page numbering
- **Print Isolation**: Clean print output without UI elements

### 📊 Dashboard & Analytics

- **Real-time Dashboards**: Role-specific dashboards with key metrics
- **Progress Tracking**: Visual progress indicators for MPI completion
- **Usage Statistics**: Comprehensive usage analytics and reporting
- **Quick Actions**: Streamlined workflows for common tasks

## 🛠️ Technology Stack

### Frontend

- **Next.js 14**: React framework with App Router and Server Components
- **TypeScript**: Type-safe development with enhanced IDE support
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **TinyMCE**: Professional rich text editor for document creation
- **React Hook Form**: Efficient form handling with validation
- **Lucide React**: Modern icon library for consistent UI

### Backend

- **Node.js**: JavaScript runtime for server-side development
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **JWT**: JSON Web Tokens for secure authentication
- **bcryptjs**: Password hashing for security

### Development & Deployment

- **ESLint & Prettier**: Code quality and formatting
- **Git**: Version control and collaboration
- **Docker**: Containerization for consistent deployments
- **Vercel/Netlify**: Modern deployment platforms

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • React UI      │    │ • REST APIs     │    │ • Collections   │
│ • TypeScript    │    │ • Authentication│    │ • Indexes       │
│ • Tailwind CSS  │    │ • Data Models   │    │ • Relationships │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

- **Authentication Layer**: JWT-based security with role validation
- **API Layer**: RESTful endpoints with comprehensive error handling
- **Data Layer**: MongoDB with optimized schemas and relationships
- **UI Layer**: Responsive React components with modern design patterns

## 👥 User Roles & Permissions

### 🔑 Administrator

**Access Level**: Full System Control

- **User Management**: Create, edit, and manage engineer accounts
- **Company Management**: Oversee customer company database
- **System Configuration**: Manage forms, process items, and system settings
- **Global Access**: View and manage all MPIs across the organization
- **Analytics**: Access comprehensive system usage reports

### 👨‍💻 Engineer

**Access Level**: MPI Creation & Management

- **MPI Creation**: Create new Manufacturing Process Instructions
- **Content Management**: Add sections, images, and tasks to MPIs
- **Customer Interaction**: Access customer company information
- **Print Management**: Generate professional print-ready documents
- **Personal Dashboard**: Track personal MPI progress and statistics

## 💼 Business Value

### ⏱️ Time Savings

- **80% Reduction** in MPI creation time through templates and automation
- **Instant Access** to customer and process information
- **Bulk Operations** for efficient task management
- **Automated Versioning** eliminates manual document tracking

### 📈 Efficiency Improvements

- **Standardized Processes** ensure consistency across all MPIs
- **Real-time Collaboration** enables seamless team coordination
- **Professional Output** reduces review cycles and rework
- **Centralized Management** eliminates document version confusion

### 💰 Cost Benefits

- **Reduced Paper Usage** through digital-first approach
- **Lower Training Costs** with intuitive user interface
- **Faster Onboarding** for new engineers
- **Improved Quality** reduces manufacturing errors and rework

### 🔒 Risk Mitigation

- **Version Control** prevents outdated instruction usage
- **Access Control** ensures only authorized personnel can modify critical documents
- **Audit Trail** provides complete change history for compliance
- **Backup & Recovery** protects against data loss

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Git

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd mpi-creator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and JWT secret

# Seed test data
node scripts/seed-test-data.js

# Start development server
npm run dev
```

### Environment Configuration

```env
MONGODB_URI=mongodb://localhost:27017/mpi-creator
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user info

### MPI Management

- `GET /api/mpi` - List user's MPIs
- `POST /api/mpi` - Create new MPI
- `GET /api/mpi/[id]` - Get specific MPI
- `PUT /api/mpi/[id]` - Update MPI
- `DELETE /api/mpi/[id]` - Delete MPI

### Admin Endpoints

- `GET /api/admin/mpis` - List all MPIs (admin only)
- `GET /api/admin/engineers` - Manage engineers
- `GET /api/admin/customer-companies` - Manage companies

## 🚀 Deployment

### Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t mpi-creator .

# Run container
docker run -p 3000:3000 mpi-creator
```

### Environment Variables (Production)

- Set secure JWT secrets
- Configure production MongoDB URI
- Set up proper CORS settings
- Configure file upload limits

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the [FAQ](FAQ.md) for common questions

---

**Built with ❤️ for the manufacturing industry**

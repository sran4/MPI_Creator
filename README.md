# MPI Creator - Manufacturing Process Instructions Generator

A comprehensive web application for creating, managing, and sharing Manufacturing Process Instructions (MPIs) with a modern glassmorphism UI and real-time collaboration features.

## 🚀 Features

### Core Functionality
- **MPI Creation & Management**: Create, edit, and manage manufacturing process instructions
- **Real-time Collaboration**: Multiple engineers can work on MPIs simultaneously
- **Step Library**: Global library of reusable manufacturing steps
- **Drag & Drop**: Reorderable sections with intuitive drag-and-drop interface
- **Version Control**: Automatic versioning with manual override options
- **Audit Trail**: Track who created/modified MPIs and when

### User Management
- **Role-based Access**: Super Admin and Engineer roles with different permissions
- **JWT Authentication**: Secure 30-day session management
- **User Profiles**: Full name and email-based authentication

### Document Features
- **Print Preview**: Real-time print preview in separate tab
- **Export Options**: Word document export with professional formatting
- **Excel-like Grid**: Visible grid lines and borders for better structure
- **Rich Text Editing**: Comprehensive text editing capabilities

### Manufacturing Categories
- Applicable Documents
- General Instructions
- Kit Release
- SMT Preparation/Planning
- Paste Print
- Reflow
- First Article Approval
- SMT Additional Instructions
- Production Quantity Approval
- Wave Solder
- Through Hole Stuffing
- 2nd Operations
- Selective Solder
- Wash and Dry
- Flying Probe Test
- AOI Test
- TH Stuffing
- Final QC
- Shipping and Delivery
- Packaging

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS v4 with glassmorphism design
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **UI Components**: Radix UI, Lucide React icons
- **Animations**: Framer Motion
- **File Handling**: File Saver, Docx generation
- **Drag & Drop**: React Beautiful DND

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mpi-creator.git
   cd mpi-creator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/mpi-creator?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here
   ```

4. **Seed the database**
   ```bash
   npm run seed-admin
   npm run seed-steps
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
mpi-creator/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── login/            # Authentication pages
│   ├── mpi/              # MPI management pages
│   └── admin/            # Admin panel
├── components/            # Reusable UI components
├── lib/                  # Utility functions
├── models/               # MongoDB schemas
├── scripts/              # Database seeding scripts
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed-admin` - Seed admin user
- `npm run seed-steps` - Seed default manufacturing steps

## 👥 User Roles

### Super Admin
- Full CRUD control over engineers, MPIs, and global steps
- Access to admin fields: job no, MPI no, MPI rev, Doc_ID, form_ID, form_Rev
- Can delete engineer users
- Manage global step library

### Engineer/User
- Create and manage MPIs
- Save steps to global library
- Limited to editing/deleting own MPIs
- Access to step library for reuse

## 🎨 UI/UX Features

- **Glassmorphism Design**: Modern, translucent UI with backdrop blur effects
- **Dark/Light Mode**: Toggle between themes
- **Mobile Responsive**: Works on all device sizes
- **Sticky Navigation**: Always accessible navigation
- **Real-time Updates**: Live preview and auto-save functionality
- **Excel-like Grid**: Visible borders and grid lines for better structure

## 📊 Database Schema

### MPI Model
- MPI number, version, status
- Customer information
- Sections with content and images
- Audit trail (created/updated by, timestamps)

### Step Category Model
- Category name and description
- Array of steps with titles and content
- Usage tracking and metadata

### User Models
- Engineer and Admin models
- JWT-based authentication
- Role-based permissions

## 🔒 Security Features

- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Secure API endpoints
- Environment variable protection

## 📈 Performance Optimizations

- Database indexing on frequently queried fields
- Pagination (20 MPIs per page)
- Full-text search capabilities
- Optimized API responses
- Client-side caching

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure Node.js 18+ support
- Set environment variables
- Build and start commands: `npm run build && npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email your-email@example.com or create an issue in the GitHub repository.

## 🎯 Roadmap

- [ ] Rich text editor integration (React Quill)
- [ ] Advanced image management (Cloudinary)
- [ ] PDF export functionality
- [ ] Real-time collaboration (WebSocket)
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] API documentation
- [ ] Unit and integration tests

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the flexible database solution
- All contributors and users of this project

---

**Made with ❤️ for the manufacturing industry**
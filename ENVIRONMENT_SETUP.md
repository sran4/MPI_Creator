# Environment Setup

To run the MPI Generator application, you need to create a `.env.local` file in the root directory with the following environment variables:

## Required Environment Variables

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/mpi-generator?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

## Setup Instructions

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Get your connection string
   - Replace `your-username`, `your-password`, and `your-cluster` in the MONGODB_URI

2. **Create Cloudinary Account (Optional for image uploads):**
   - Go to [Cloudinary](https://cloudinary.com)
   - Create a free account
   - Get your cloud name, API key, and API secret

3. **Generate JWT Secret:**
   - Use a long, random string for JWT_SECRET
   - You can generate one using: `openssl rand -base64 32`

4. **Create the .env.local file:**
   - Copy the template above
   - Replace all placeholder values with your actual credentials
   - Save the file in the root directory

## Running the Application

After setting up the environment variables:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Seed the admin user:
   ```bash
   npm run seed-admin
   ```

3. Seed default steps:
   ```bash
   npm run seed-steps
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Default Admin Credentials

After running `npm run seed-admin`, you can login with:
- **Email:** admin@mpi.com
- **Password:** admin123

## Features Available

- ✅ User Authentication (Admin & Engineer)
- ✅ MPI Creation and Editing
- ✅ Customer Management
- ✅ Step Library (Save & Reuse Steps)
- ✅ Global Steps Database
- ✅ Step Usage Tracking
- ✅ Search and Filter Steps
- ✅ Responsive Design
- ✅ Dark/Light Mode

## Next Steps

1. Set up your environment variables
2. Run the seed scripts
3. Start the application
4. Login as admin and create engineer accounts
5. Start creating MPIs with reusable steps!

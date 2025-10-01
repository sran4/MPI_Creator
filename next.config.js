/** @type {import('next').NextConfig} */
const nextConfig = {
  // PERFORMANCE OPTIMIZATION: Enable modern image optimization
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'], // Serve modern formats
  },

  // PERFORMANCE OPTIMIZATION: Enable SWC minification (faster than Terser)
  swcMinify: true,

  // PERFORMANCE OPTIMIZATION: Enable compression
  compress: true,

  // PERFORMANCE OPTIMIZATION: Remove console logs in production
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },
};

module.exports = nextConfig;

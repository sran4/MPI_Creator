import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // PERFORMANCE OPTIMIZATION: Enhanced connection pooling
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maximum 10 connections in pool
      minPoolSize: 2, // Minimum 2 connections always ready
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if no server available
      maxIdleTimeMS: 30000, // Close idle connections after 30s
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(mongoose => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

declare global {
  var mongoose: any;
}

import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rem_todos';

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500,
    }).then((mongoose) => {
      console.log('[MongoDB] Connected successfully');
      return mongoose;
    }).catch((err) => {
      console.warn('[MongoDB] Connection warning (running in local fallback mode):', err.message);
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch {
    cached.conn = null;
  }

  return cached.conn;
}

export function isDbReady() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

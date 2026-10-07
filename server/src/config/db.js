import mongoose from 'mongoose';
import dns from 'node:dns';

let cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing');
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      try {
        return await mongoose.connect(uri, { bufferCommands: false });
      } catch (err) {
        if (err.message && err.message.includes('querySrv')) {
          dns.setServers(['8.8.8.8', '1.1.1.1']);
          return await mongoose.connect(uri, { bufferCommands: false });
        }
        throw err;
      }
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

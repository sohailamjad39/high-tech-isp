// lib/db.js
import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'isp-platform',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Could not connect to database');
  }
}
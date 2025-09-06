// lib/db.js
import mongoose from 'mongoose';

let isConnected = false;
let connecting = false;

export async function connectToDatabase() {
  // If already connected, return
  if (isConnected) {
    return;
  }
  
  // If already attempting to connect, return
  if (connecting) {
    return;
  }
  
  connecting = true;
  
  try {
    // Validate environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    // Set mongoose options
    const mongooseOptions = {
      dbName: process.env.DB_NAME || 'isp-platform',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    
    isConnected = true;
    connecting = false;
    
    console.log('✅ Connected to MongoDB');
    
    // Add connection event listeners
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
      isConnected = false;
    });
    
  } catch (error) {
    connecting = false;
    console.error('❌ Database connection error:', error);
    throw new Error(`Could not connect to database: ${error.message}`);
  }
}

// Export connection status for debugging
export function getConnectionStatus() {
  return {
    isConnected,
    connecting,
    mongoStatus: mongoose.connection.readyState
  };
}
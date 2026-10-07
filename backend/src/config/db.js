const mongoose = require('mongoose');

/**
 * Connect to MongoDB database asynchronously.
 * Skips or logs warnings gracefully if MONGO_URI is not provided or connection fails,
 * ensuring the server remains operational.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI || mongoURI.trim() === '') {
    console.warn('⚠️  MONGO_URI is not defined in environment variables. MongoDB connection skipped.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️  MongoDB Connection Error: ${error.message}`);
    console.warn('Backend server remains active, but database operations will fail until MongoDB is accessible.');
  }
};

module.exports = connectDB;

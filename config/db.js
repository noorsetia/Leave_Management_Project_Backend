const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leave-management', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️  Server will continue running without database connection');
    console.warn('⚠️  Please start MongoDB or configure a remote database in .env');
  }
};

module.exports = connectDB;

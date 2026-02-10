const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env first
dotenv.config();

// Import the app (Express instance)
const app = require('./app');

// Connect to DB then start server
connectDB().catch(err => {
  console.error('Database connection failed but server will continue');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit - just log the error
});

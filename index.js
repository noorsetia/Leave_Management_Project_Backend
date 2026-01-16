const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

// Load environment variables FIRST before requiring passport
dotenv.config();

const passport = require('./config/passport');
const connectDB = require('./config/db');

// Connect to database (non-blocking)
connectDB().catch(err => {
  console.error('Database connection failed but server will continue');
});

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/leave', require('./routes/leaveRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Advanced Leave Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      leave: '/api/leave',
      assessment: '/api/assessment',
      attendance: '/api/attendance',
      dashboard: '/api/dashboard',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error caught in middleware:');
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Error type:', typeof err);
  
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});

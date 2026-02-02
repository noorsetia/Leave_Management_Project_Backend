const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      provider: 'local',
    });

    // Create attendance record for students
    if (role === 'student') {
      await Attendance.create({
        student: user._id,
        totalClasses: 100,
        attendedClasses: 80, // Demo: 80% attendance
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Server error during signup' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if role matches
    if (role && user.role !== role) {
      return res.status(401).json({ message: `Invalid credentials for ${role}` });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    OAuth Success Callback
// @route   GET /api/auth/oauth/success
// @access  Private
exports.oauthSuccess = async (req, res) => {
  try {
    if (!req.user) {
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=authentication_failed`;
      console.log('❌ OAuth failed - No user. Redirecting to:', redirectUrl);
      return res.redirect(redirectUrl);
    }

    const token = generateToken(req.user._id);
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth/callback?token=${token}`;
    
    console.log('✅ OAuth success! Redirecting to:', redirectUrl);
    console.log('   User:', req.user.email, '| Role:', req.user.role);
    console.log('   FRONTEND_URL from env:', process.env.FRONTEND_URL);
    
    // Redirect to frontend with token
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth success error:', error);
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=server_error`;
    console.log('❌ OAuth error. Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  }
};

// @desc    OAuth Failure Callback
// @route   GET /api/auth/oauth/failure
// @access  Public
exports.oauthFailure = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
};

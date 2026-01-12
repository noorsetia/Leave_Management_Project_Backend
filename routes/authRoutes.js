const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signup, login, getCurrentUser, oauthSuccess, oauthFailure } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Async handler wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Traditional auth routes
router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.get('/me', protect, asyncHandler(getCurrentUser));

// Helper function to check if OAuth is configured
const isOAuthConfigured = (provider) => {
  if (provider === 'google') {
    return process.env.GOOGLE_CLIENT_ID && 
           process.env.GOOGLE_CLIENT_SECRET && 
           process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id';
  }
  if (provider === 'github') {
    return process.env.GITHUB_CLIENT_ID && 
           process.env.GITHUB_CLIENT_SECRET && 
           process.env.GITHUB_CLIENT_ID !== 'your-github-client-id';
  }
  return false;
};

// Google OAuth routes
router.get('/google', (req, res, next) => {
  if (!isOAuthConfigured('google')) {
    return res.status(503).json({ 
      message: 'Google OAuth is not configured. Please set up OAuth credentials in backend/.env',
      documentation: 'See OAUTH_SETUP.md for instructions'
    });
  }
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!isOAuthConfigured('google')) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/oauth/failure',
    session: false,
    failureMessage: true
  })(req, res, next);
}, oauthSuccess);

// GitHub OAuth routes
router.get('/github', (req, res, next) => {
  if (!isOAuthConfigured('github')) {
    return res.status(503).json({ 
      message: 'GitHub OAuth is not configured. Please set up OAuth credentials in backend/.env',
      documentation: 'See OAUTH_SETUP.md for instructions'
    });
  }
  passport.authenticate('github', { 
    scope: ['user:email'],
    session: false 
  })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
  if (!isOAuthConfigured('github')) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  passport.authenticate('github', { 
    failureRedirect: '/api/auth/oauth/failure',
    session: false,
    failureMessage: true
  })(req, res, next);
}, oauthSuccess);

// OAuth callback routes
router.get('/oauth/failure', oauthFailure);

module.exports = router;

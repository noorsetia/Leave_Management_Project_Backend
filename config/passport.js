const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Note: We're using JWT tokens, not sessions, so serialize/deserialize are minimal
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Only initialize Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
  
  console.log('✓ Initializing Google OAuth');
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ providerId: profile.id, provider: 'google' });

          if (user) {
            return done(null, user);
          }

          // Check if email already exists with different provider
          const existingEmail = await User.findOne({ email: profile.emails[0].value });
          if (existingEmail) {
            return done(null, false, { 
              message: `This email is already registered with ${existingEmail.provider} authentication. Please use ${existingEmail.provider} to login.` 
            });
          }

          // Create new user
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            provider: 'google',
            providerId: profile.id,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            role: 'student', // Default role
          });

          // Create attendance record for students
          if (user.role === 'student') {
            await Attendance.create({
              student: user._id,
              totalClasses: 100,
              attendedClasses: 80,
              attendancePercentage: 80,
            });
          }

          done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠ Google OAuth not configured - skipping');
}

// Only initialize GitHub OAuth if credentials are provided
if (process.env.GITHUB_CLIENT_ID && 
    process.env.GITHUB_CLIENT_SECRET && 
    process.env.GITHUB_CLIENT_ID !== 'your-github-client-id') {
  
  console.log('✓ Initializing GitHub OAuth');
  
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
        scope: ['user:email'],
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this GitHub ID
          let user = await User.findOne({ providerId: profile.id, provider: 'github' });

          if (user) {
            return done(null, user);
          }

          // Get email from profile (GitHub might not always provide it)
          let email = null;
          if (profile.emails && profile.emails.length > 0) {
            email = profile.emails[0].value;
          } else {
            // Use GitHub username as fallback
            email = `${profile.username}@github.local`;
          }

          // Check if email already exists with different provider
          const existingEmail = await User.findOne({ email });
          if (existingEmail && existingEmail.provider !== 'github') {
            return done(null, false, { 
              message: `This email is already registered with ${existingEmail.provider} authentication. Please use ${existingEmail.provider} to login.` 
            });
          }

          // Create new user
          user = await User.create({
            name: profile.displayName || profile.username,
            email,
            provider: 'github',
            providerId: profile.id,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : profile.avatar_url,
            role: 'student', // Default role
          });

          // Create attendance record for students
          if (user.role === 'student') {
            await Attendance.create({
              student: user._id,
              totalClasses: 100,
              attendedClasses: 80,
              attendancePercentage: 80,
            });
          }

          done(null, user);
        } catch (error) {
          console.error('GitHub OAuth error:', error);
          done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠ GitHub OAuth not configured - skipping');
}

module.exports = passport;

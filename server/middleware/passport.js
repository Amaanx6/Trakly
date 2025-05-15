import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

console.log('Passport module loaded');

// Check if required Google OAuth environment variables are set
const hasRequiredGoogleConfig = 
  process.env.VITE_GOOGLE_CLIENT_ID && 
  process.env.VITE_GOOGLE_CLIENT_SECRET && 
  process.env.VITE_GOOGLE_CALLBACK_URL;

console.log('Google Config:', {
  clientID: process.env.VITE_GOOGLE_CLIENT_ID ? '[set]' : 'missing',
  clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET ? '[set]' : 'missing',
  callbackURL: process.env.VITE_GOOGLE_CALLBACK_URL || 'missing',
});

if (hasRequiredGoogleConfig) {
  // Register the real Google strategy if config is available
  const googleConfig = {
    clientID: process.env.VITE_GOOGLE_CLIENT_ID,
    clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.VITE_GOOGLE_CALLBACK_URL,
  };
  
  passport.use(
    'google',
    new GoogleStrategy(
      googleConfig,
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google Strategy executed:', { profileId: profile.id, email: profile.emails[0].value });
          
          let user = await User.findOne({ googleId: profile.id });
          
          if (!user) {
            user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
              // Existing user: link Google account
              user.googleId = profile.id;
              await user.save();
            } else {
              // New user: create account (signup)
              user = new User({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
              });
              await user.save();
            }
          }
          
          const token = jwt.sign({ id: user._id }, process.env.VITE_JWT_SECRET, {
            expiresIn: '1d',
          });
          
          done(null, { user: { id: user._id, email: user.email, name: user.name }, token });
        } catch (err) {
          console.error('Google Strategy error:', err);
          done(err, null);
        }
      }
    )
  );
  console.log('Google Strategy setup complete');
} else {
  // Register a dummy strategy to avoid "Unknown strategy" errors
  passport.use('google', new passport.Strategy({}, (req, options, done) => {
    return done(new Error('Google OAuth is not configured. Please set the required environment variables.'));
  }));
  console.warn('Google OAuth configuration incomplete. Google login will not work until environment variables are set.');
}

// These are still needed for Passport initialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

console.log('Google Strategy setup complete');
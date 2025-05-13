import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

console.log('Passport module loaded');

const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
};

console.log('Google Config:', {
  clientID: googleConfig.clientID ? '[set]' : 'missing',
  clientSecret: googleConfig.clientSecret ? '[set]' : 'missing',
  callbackURL: googleConfig.callbackURL || 'missing',
});

if (!googleConfig.clientID || !googleConfig.clientSecret || !googleConfig.callbackURL) {
  console.warn('Google OAuth configuration incomplete. Google login will not work until .env variables are set.');
} else {
  passport.use(
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
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

console.log('Google Strategy setup complete');
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
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
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
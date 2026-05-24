import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      //   
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

export const googleCallback = async function (req, res) {
  const profile = req.user;
  let userProfile = {
    name: profile.displayName,
    password: profile.id,
    email: profile.emails[0].value,
    avatar: {
      public_id: "This is a sample id",
      url: "profilepicUrl",
    },
  };
  const user = await User.findOne({ email: userProfile.email });
  if (!user) {
    await User.create(userProfile);
  }
  res.redirect("/");
};

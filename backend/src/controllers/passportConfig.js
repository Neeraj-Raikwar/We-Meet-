import crypto from "crypto";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// Finds an existing account by email, or creates one on the fly for a
// first-time social login. Issues the same crypto token our normal
// username/password login uses, so the rest of the app doesn't need to know
// the difference.
const findOrCreateOAuthUser = async ({ name, email }) => {
    if (!email) {
        throw new Error("The provider did not share an email address, so we can't create an account.");
    }

    let user = await User.findOne({ username: email.toLowerCase() });

    if (!user) {
        // Social-login accounts never log in with a password, so this is just a
        // placeholder value to satisfy the schema's required field.
        const placeholderPassword = crypto.randomBytes(24).toString("hex");
        user = new User({
            name: name || email.split("@")[0],
            username: email.toLowerCase(),
            password: placeholderPassword
        });
    }

    user.token = crypto.randomBytes(20).toString("hex");
    await user.save();
    return user;
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${BACKEND_URL}/api/v1/users/auth/google/callback`
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const user = await findOrCreateOAuthUser({ name: profile.displayName, email });
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: `${BACKEND_URL}/api/v1/users/auth/facebook/callback`,
            profileFields: ["id", "displayName", "emails"]
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const user = await findOrCreateOAuthUser({ name: profile.displayName, email });
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));
}

export default passport;

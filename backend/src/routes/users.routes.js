import { Router } from "express";
import passport from "../controllers/passportConfig.js";
import {
  addToHistory,
  getUserHistory,
  login,
  oauthCallbackRedirect,
  register,
  resetPasswordRequest,
  updateMeetingDuration,
  verifyOTPAndReset
} from "../controllers/user.controller.js";

const router = Router();

// Authentication Routes
router.route("/login").post(login);
router.route("/register").post(register);

// Social Login (Google / Facebook) — routes only become functional once
// GOOGLE_CLIENT_ID/SECRET or FACEBOOK_APP_ID/SECRET are set in .env
router.get("/auth/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth?oauth_error=google_not_configured`);
  }
  passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
});
router.get("/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth?oauth_error=1` }),
  oauthCallbackRedirect
);

router.get("/auth/facebook", (req, res, next) => {
  if (!process.env.FACEBOOK_APP_ID) {
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth?oauth_error=facebook_not_configured`);
  }
  passport.authenticate("facebook", { scope: ["email"], session: false })(req, res, next);
});
router.get("/auth/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth?oauth_error=1` }),
  oauthCallbackRedirect
);

// Microsoft isn't wired up yet — it needs an Azure AD app registration, which
// is a bigger separate setup step. This keeps the button from silently 404-ing.
router.get("/auth/microsoft", (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth?oauth_error=microsoft_not_configured`);
});

// Activity & History Routes
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/update_activity_duration").patch(updateMeetingDuration);

// Password Recovery Routes
router.route("/forgot-password").post(resetPasswordRequest);
router.route("/reset-password").post(verifyOTPAndReset);

export default router;

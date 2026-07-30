import bcrypt from "bcrypt";        // password hashing aur verification ke liye
import crypto from "crypto";        // random authentication tokens generate karne ke liye
import httpStatus from "http-status";   // standard HTTP status codes use karne ke liye
import nodemailer from "nodemailer";    // email pe OTP send karne ke liye
import { Meeting } from "../models/meeting.model.js";       // meeting history schema import
import { User } from "../models/user.model.js";     // user schema import

// 1. LOGIN CONTROLLER
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {   // check karein dono fields hain ya nahi
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please provide all details" });
    }

    try {
        const user = await User.findOne({ username });  // database me email/username se user dhoond rahe hain
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Identity Mismatch" });   // user not found status
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);    // plane password ko stored hash password se compare kar rahe hain
        if (isPasswordCorrect) {
            const token = crypto.randomBytes(20).toString("hex");   // 20-byte ka random unique hex session token create kiya
            user.token = token;     // session token assign kiya user ko
            await user.save();      // updated session token database me save kiya
            return res.status(httpStatus.OK).json({ token: token });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
        }
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `System error framework crash logged: ${e.message}` });
    }
};

// 2. REGISTER CONTROLLER
const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "All fields (name, username/email, password) are mandatory!" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Registration Failure: A valid Email Address is mandatory!" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ message: "Profile entry already exists inside repositories" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            username,
            password: hashedPassword
        });

        await newUser.save();
        return res.status(httpStatus.CREATED).json({ message: "User account provisioned successfully!" });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Registration lifecycle error trace anomaly reported: ${e.message}` });
    }
};

// 3. GET USER HISTORY CONTROLLER
const getUserHistory = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Authentication token missing in query parameters" });
    }

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid or expired session token" });
        }

        const meetings = await Meeting.find({ user_id: user.username });
        return res.status(httpStatus.OK).json(meetings);
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `History fetch error reported: ${e.message}` });
    }
};

// 4. ADD TO HISTORY CONTROLLER
const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    if (!token || !meeting_code) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Token and meeting code are required" });
    }

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "User session not found for provided token" });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        });

        await newMeeting.save();
        return res.status(httpStatus.CREATED).json({ message: "Added code to history" });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Added history exceptions logic trace logged: ${e.message}` });
    }
};

// 5. REQUEST PASSWORD RESET (SEND OTP) CONTROLLER
const resetPasswordRequest = async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please provide target email account" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Email account handles do not exist inside profiles database records" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOTP = otp;
        user.resetOTPExpires = Date.now() + 5 * 60 * 1000; // 5 mins validity
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.username,
            subject: 'WeMeet Access Verification Key Code Reset Request Security Portal',
            text: `A password modification protocol has been initiated for your WeMeet account profile. Your verification token security entry is: ${otp}. This code will dissolve within 5 minutes framework windows.`
        };

        await transporter.sendMail(mailOptions);
        return res.status(httpStatus.OK).json({ message: "Verification token securely dispatched to the target email destination address location!" });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Mailing distribution channels failure or SMTP integration trace error caught: ${error.message}` });
    }
};

// 6. VERIFY OTP AND RESET PASSWORD CONTROLLER
const verifyOTPAndReset = async (req, res) => {
    const { username, otp, newPassword } = req.body;

    if (!username || !otp || !newPassword) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Username, OTP, and new password are all required" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Target profile account details are missing from system registry" });
        }
        if (!user.resetOTP || user.resetOTP !== otp) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "The verification sequence input token is incorrect or invalid key data" });
        }
        if (Date.now() > user.resetOTPExpires) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Verification code temporal lifecycle validity parameter threshold has lapsed, code expired" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        await user.save();

        return res.status(httpStatus.OK).json({ message: "Your access password parameter matrix has been dynamically modified successfully within system repositories" });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Cryptographic data transformation pipelines or transaction engines operation exception crash reported: ${error.message}` });
    }
};

// 7. OAUTH CALLBACK REDIRECT (Google / Facebook)
// After passport authenticates the user, this hands the same style of token
// our normal login uses back to the frontend so it can log the user in.
const oauthCallbackRedirect = (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const token = req.user?.token;

    if (!token) {
        return res.redirect(`${frontendUrl}/auth?oauth_error=1`);
    }

    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
};

// 8. UPDATE MEETING DURATION CONTROLLER (called when a call ends)
const updateMeetingDuration = async (req, res) => {
    const { token, meeting_code, duration } = req.body;

    if (!token || !meeting_code || duration === undefined) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Token, meeting code and duration are required" });
    }

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "User session not found for provided token" });
        }

        // Update the most recent matching history record for this user/meeting
        const meeting = await Meeting.findOne({ user_id: user.username, meetingCode: meeting_code }).sort({ createdAt: -1 });
        if (!meeting) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "No matching history record found to update" });
        }

        meeting.duration = Math.max(0, Number(duration) || 0);
        await meeting.save();

        return res.status(httpStatus.OK).json({ message: "Meeting duration updated" });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Duration update error reported: ${e.message}` });
    }
};

export {
    addToHistory,
    getUserHistory,
    login,
    oauthCallbackRedirect,
    register,
    resetPasswordRequest,
    updateMeetingDuration,
    verifyOTPAndReset
};


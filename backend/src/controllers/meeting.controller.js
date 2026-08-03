import httpStatus from "http-status";
import nodemailer from "nodemailer";

// Sends whatever the user typed on the "You've left the meeting" feedback
// screen straight to the configured inbox, reusing the same Gmail transporter
// setup already used for OTP emails in user.controller.js.
const submitMeetingFeedback = async (req, res) => {
    const { meetingCode, username, rating, feedback } = req.body;

    if (!rating && (!feedback || !feedback.trim())) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please provide a rating or a written comment." });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.FEEDBACK_EMAIL || "raikwarneeraj95@gmail.com",
        subject: `WeMeet Feedback — ${meetingCode || "Unknown meeting"}`,
        text:
            `Meeting Code: ${meetingCode || "N/A"}\n` +
            `From: ${username || "Anonymous"}\n` +
            `Rating: ${rating ? `${rating}/5` : "Not rated"}\n\n` +
            `Feedback:\n${feedback?.trim() || "(no written feedback)"}`
    };

    // Respond to the user right away — don't make them wait on an SMTP round trip
    // (Gmail/network hiccups shouldn't ever leave the "Send feedback" button stuck).
    res.status(httpStatus.OK).json({ message: "Feedback received — thank you!" });

    // Send the actual email in the background. If it fails or times out, it's
    // logged server-side only; it no longer affects the user's request.
    transporter.sendMail(mailOptions).catch((error) => {
        console.error("Feedback email failed to send:", error.message);
    });
};

export { submitMeetingFeedback };

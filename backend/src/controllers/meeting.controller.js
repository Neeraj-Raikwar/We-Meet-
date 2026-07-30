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

    try {
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

        await transporter.sendMail(mailOptions);
        return res.status(httpStatus.OK).json({ message: "Feedback sent successfully!" });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Could not send feedback email: ${error.message}` });
    }
};

export { submitMeetingFeedback };

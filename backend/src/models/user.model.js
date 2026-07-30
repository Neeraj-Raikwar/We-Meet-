import mongoose, { Schema } from "mongoose";

// Main User Schema definition
const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true   // Removes whitespace from both ends of the string
        },

        username: {     // User ka unique handler
            type: String,
            required: true,
            unique: true,
            lowercase: true,  // case issue na ho search me
            trim: true,
            index: true     // search query fast karne ke liye
        },

        password: {     // Hashed password ke liye
            type: String,
            required: true
        },
        token: {        // Auth session/JWT token
            type: String
        },
        resetOTP: {     // Password reset ka OTP store karne ke liye
            type: String
        },
        resetOTPExpires: {      // OTP validity limit
            type: Date
        }
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt
    }
);

const User = mongoose.model("User", userSchema);

export { User };


import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
    {
        user_id: {      // Host ya user ki unique identity
            type: String,
            required: true,
            trim: true
        },
        meetingCode: {      // Room code ya join link identifier
            type: String,
            required: true,
            trim: true
        },
        date: {     // Meeting start timestamp
            type: Date,
            default: Date.now,
            required: true
        },
        // Seconds spent in the call, filled in when the call ends (0 until then).
        duration: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true // Automatically adds createdAt & updatedAt fields
    }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };


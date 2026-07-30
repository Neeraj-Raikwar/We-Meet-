import { Router } from "express";
import { submitMeetingFeedback } from "../controllers/meeting.controller.js";

const router = Router();

router.route("/feedback").post(submitMeetingFeedback);

export default router;

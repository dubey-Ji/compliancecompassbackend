import express from "express";
import * as onboardingController from "../controllers/onboardingController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/start", onboardingController.startOnboarding);
router.post("/complete", onboardingController.completeOnboarding);

export default router;

import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import * as integrationController from "../controllers/integrationController.js";

const router = express.Router();

router.get(
  "/github/connect",
  authenticate,
  integrationController.connectGitHub
);

router.get("/github/callback", integrationController.githubCallback);

export default router;


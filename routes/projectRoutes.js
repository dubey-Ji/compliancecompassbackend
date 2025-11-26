import express from "express";
import * as projectController from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", projectController.getProjects);

router.get("/:projectId/controls", projectController.getProjectControls);

router.get(
  "/:projectId/controls/stats",
  projectController.getProjectControlsStats
);

export default router;

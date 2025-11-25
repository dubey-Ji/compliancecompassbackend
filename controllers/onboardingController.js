import { asyncHandler } from "../middleware/errorHandler.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import * as onboardingService from "../services/onboardingService.js";
import logger from "../utils/logger.js";

export const completeOnboarding = asyncHandler(async (req, res) => {
  const { projectName, systems, answers } = req.body;

  // Extract user and organization from request
  // Assuming these are set by auth middleware (req.user, req.organization)
  // If not available, you may need to add auth middleware
  const user_id = req.user?.id || req.body.user_id;
  const organization_id = req.user?.organization_id || req.body.organization_id;

  if (!user_id) {
    return errorResponse(res, "User ID is required", 400);
  }

  try {
    const result = await onboardingService.completeOnboarding({
      organization_id,
      user_id,
      projectName,
      systems,
      answers,
    });

    return successResponse(
      res,
      result,
      "Onboarding completed successfully",
      200
    );
  } catch (error) {
    logger.error("Onboarding completion error:", error);
    if (error.message.includes("Invalid system_key")) {
      return errorResponse(res, error.message, 400);
    }
    if (error.message.includes("systems array is required")) {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(
      res,
      error.message || "Failed to complete onboarding",
      500
    );
  }
});

export const startOnboarding = asyncHandler(async (req, res) => {
  const user_id = req.user?.id;
  const organization_id = req.user?.organization_id || null;
  const minimal = req.query.minimal === "true";

  if (!user_id) {
    return errorResponse(res, "User ID is required", 400);
  }

  try {
    const result = await onboardingService.startOnboarding({
      user_id,
      organization_id,
      minimal,
    });

    return successResponse(
      res,
      result,
      "Onboarding data loaded successfully",
      200
    );
  } catch (error) {
    logger.error("Onboarding start error:", error);
    return errorResponse(
      res,
      error.message || "Failed to load onboarding data",
      500
    );
  }
});

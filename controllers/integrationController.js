import { asyncHandler } from "../middleware/errorHandler.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import logger from "../utils/logger.js";
import config from "../config/config.js";
import * as integrationService from "../services/integrationService.js";

export const connectGitHub = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const organizationId = req.user?.organization_id;

  try {
    const result = await integrationService.generateGitHubAuthUrl(
      userId,
      organizationId
    );

    return successResponse(res, result, "GitHub OAuth URL generated", 200);
  } catch (error) {
    logger.error("GitHub connect error:", error);

    if (error.message.includes("Redis required")) {
      return errorResponse(res, error.message, 503);
    }
    if (error.message.includes("not found")) {
      return errorResponse(res, error.message, 404);
    }
    if (error.message.includes("not configured")) {
      return errorResponse(res, error.message, 500);
    }

    return errorResponse(
      res,
      error.message || "Failed to generate GitHub OAuth URL",
      500
    );
  }
});

export const githubCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;

  try {
    await integrationService.handleGitHubCallback(code, state);

    const frontendUrl = config.cors.origin || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/app/dashboard?integration=github_connected`;

    return res.redirect(redirectUrl);
  } catch (error) {
    logger.error("GitHub callback error:", error);

    const frontendUrl = config.cors.origin || "http://localhost:5173";
    return res.redirect(
      `${frontendUrl}/app/dashboard?integration=github_error`
    );
  }
});

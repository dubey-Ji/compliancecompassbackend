import { asyncHandler } from "../middleware/errorHandler.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import * as projectService from "../services/projectService.js";
import logger from "../utils/logger.js";

export const getProjectControls = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const organization_id = req.user?.organization_id;
  logger.info(`User Id: ${req.user?.id}`);

  if (!organization_id) {
    return errorResponse(res, "Organization ID is required", 400);
  }

  // Parse query params
  const filters = {
    status: req.query.status,
    category: req.query.category,
    severity: req.query.severity,
    automatable: req.query.automatable,
    search: req.query.search,
    page: req.query.page,
    pageSize: req.query.pageSize,
  };

  try {
    const result = await projectService.getProjectControls({
      projectId,
      organization_id,
      filters,
    });

    return successResponse(
      res,
      result,
      "Project controls retrieved successfully",
      200
    );
  } catch (error) {
    logger.error("Get project controls error:", error);
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return errorResponse(
      res,
      error.message || "Failed to retrieve project controls",
      500
    );
  }
});

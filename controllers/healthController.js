import { successResponse } from '../utils/responseHandler.js';

export const healthCheck = (req, res) => {
  return successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, 'Server is running', 200);
};


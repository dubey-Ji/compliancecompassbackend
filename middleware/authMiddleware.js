import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/config.js";
import { errorResponse } from "../utils/responseHandler.js";
import logger from "../utils/logger.js";

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    let token = null;
    
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
    }
    
    // If no token in header, check cookie
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return errorResponse(res, "No token provided", 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return errorResponse(res, "Token expired", 401);
      }
      if (error.name === "JsonWebTokenError") {
        return errorResponse(res, "Invalid token", 401);
      }
      throw error;
    }

    // Get user from database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return errorResponse(res, "User not found", 401);
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization_id: user.organization_id,
    };

    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    return errorResponse(res, "Authentication failed", 500);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Authentication required", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, "Insufficient permissions", 403);
    }

    next();
  };
};


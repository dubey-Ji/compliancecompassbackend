import { asyncHandler } from "../middleware/errorHandler.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import * as authService from "../services/authService.js";
import logger from "../utils/logger.js";

export const register = asyncHandler(async (req, res) => {
  const { email, password, name, organization_id = null } = req.body;

  // Validation
  if (!email || !password) {
    return errorResponse(res, "Email and password are required", 400);
  }

  if (password.length < 6) {
    return errorResponse(
      res,
      "Password must be at least 6 characters long",
      400
    );
  }

  try {
    const result = await authService.register({
      email,
      password,
      name,
      organization_id,
    });

    // Set HTTP-only cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, result, "User registered successfully", 201);
  } catch (error) {
    logger.error("Registration error:", error);
    if (error.message === "User with this email already exists") {
      return errorResponse(res, error.message, 409);
    }
    return errorResponse(res, error.message || "Registration failed", 500);
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return errorResponse(res, "Email and password are required", 400);
  }

  try {
    const result = await authService.login(email, password);

    // Set HTTP-only cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, result, "Login successful", 200);
  } catch (error) {
    logger.error("Login error:", error);
    if (error.message === "Invalid email or password") {
      return errorResponse(res, error.message, 401);
    }
    return errorResponse(res, error.message || "Login failed", 500);
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validation
  if (!email) {
    return errorResponse(res, "Email is required", 400);
  }

  try {
    const result = await authService.forgotPassword(email);
    return successResponse(res, null, result.message, 200);
  } catch (error) {
    logger.error("Forgot password error:", error);
    return errorResponse(
      res,
      error.message || "Failed to process request",
      500
    );
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Validation
  if (!token || !password) {
    return errorResponse(res, "Token and password are required", 400);
  }

  if (password.length < 6) {
    return errorResponse(
      res,
      "Password must be at least 6 characters long",
      400
    );
  }

  try {
    const result = await authService.resetPassword(token, password);
    return successResponse(res, null, result.message, 200);
  } catch (error) {
    logger.error("Reset password error:", error);
    if (error.message === "Invalid or expired reset token") {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(res, error.message || "Failed to reset password", 500);
  }
});

export const logout = asyncHandler(async (req, res) => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return successResponse(res, null, "Logout successful", 200);
});

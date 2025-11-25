import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";
import User from "../models/User.js";
import config from "../config/config.js";
import logger from "../utils/logger.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const register = async (userData) => {
  const { email, password, name, organization_id = null } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await User.create({
    email,
    password_hash,
    name,
    organization_id,
    role: "user",
  });

  // Generate token
  const token = generateToken(user.id);

  // Remove password from response
  const userResponse = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organization_id: user.organization_id,
    created_at: user.created_at,
  };

  return { user: userResponse, token };
};

export const login = async (email, password) => {
  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Generate token
  const token = generateToken(user.id);

  // Remove password from response
  const userResponse = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organization_id: user.organization_id,
    created_at: user.created_at,
  };

  return { user: userResponse, token };
};

export const forgotPassword = async (email) => {
  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    // Don't reveal if user exists or not for security
    return {
      message: "If the email exists, a password reset link has been sent",
    };
  }

  // Generate reset token
  const resetToken = generateResetToken();
  const resetTokenExpiry = new Date();
  resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

  // Store reset token in user record (you may need to add these fields to User model)
  // For now, we'll store it in a separate table or use a different approach
  // This is a simplified version - in production, you'd want to store this securely
  await user.update({
    reset_token: resetToken,
    reset_token_expiry: resetTokenExpiry,
  });

  // In a real application, you would send an email here
  // For now, we'll just log it
  const resetLink = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/reset-password?token=${resetToken}`;
  logger.info(`Password reset link for ${email}: ${resetLink}`);

  return {
    message: "If the email exists, a password reset link has been sent",
    resetToken: resetToken,
  };
};

export const resetPassword = async (token, newPassword) => {
  // Find user with valid reset token
  const user = await User.findOne({
    where: {
      reset_token: token,
      reset_token_expiry: {
        [Op.gt]: new Date(), // Token not expired
      },
    },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  // Hash new password
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(newPassword, saltRounds);

  // Update password and clear reset token
  await user.update({
    password_hash,
    reset_token: null,
    reset_token_expiry: null,
  });

  return { message: "Password reset successfully" };
};

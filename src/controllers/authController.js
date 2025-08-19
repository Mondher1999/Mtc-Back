// src/controllers/authController.js
import crypto from "crypto";
import User from "../models/userModel.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * Helper: shape user for client
 */
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * Helper: set refresh token cookie with env-aware options
 * - In dev: SameSite=Lax, secure=false works on http://localhost
 * - In prod (HTTPS, possibly different domain): SameSite=None, secure=true
 */
const setRefreshCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,                     // cookie only over HTTPS in prod
    sameSite: isProd ? "none" : "lax",  // cross-site requires "none" in prod
    path: "/auth/refresh",              // cookie is sent only to this path
    maxAge: parseInt(process.env.JWT_REFRESH_MAX_AGE_MS || "", 10) || 7 * 24 * 60 * 60 * 1000, // default 7d
  });
};

/**
 * POST /auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const user = await User.create({ name, email, password, role });

    const accessToken = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id });

    // ⬇️ store refresh token in httpOnly cookie
    setRefreshCookie(res, refreshToken);

    // ⬇️ return sanitized user + access token only
    return res.status(201).json({
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (err) {
    return res.status(500).json({ error: "Registration failed" });
  }
};

/**
 * POST /auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const correct = await user.correctPassword(password, user.password);
    if (!correct) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id });

    setRefreshCookie(res, refreshToken);

    return res.json({
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (err) {
    return res.status(500).json({ error: "Login failed" });
  }
};

/**
 * POST /auth/refresh
 * - Reads refresh token from cookie
 * - Rotates refresh token
 * - Returns new access token
 */
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });

    // Rotate tokens
    const newAccess = signAccessToken({ id: user._id });
    const newRefresh = signRefreshToken({ id: user._id });

    setRefreshCookie(res, newRefresh);

    // Return ONLY the access token
    res.json({ accessToken: newAccess });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

/**
 * POST /auth/logout
 * - Clears refresh cookie
 */
export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/auth/refresh",
    });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
};

/**
 * GET /auth/me (protected)
 * - Return the user object directly to match frontend: setUser(res.data)
 */
export const me = async (req, res) => {
  res.json(sanitizeUser(req.user));
};

/**
 * PATCH /auth/update-password (protected)
 * - Issues fresh access token + rotates refresh token
 */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Both currentPassword and newPassword are required" });

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const correct = await user.correctPassword(currentPassword, user.password);
    if (!correct) return res.status(401).json({ error: "Current password incorrect" });

    user.password = newPassword;
    await user.save();

    const accessToken = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id });
    setRefreshCookie(res, refreshToken);

    res.json({
      message: "Password updated",
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not update password" });
  }
};

/**
 * POST /auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    const user = await User.findOne({ email });
    if (!user) {
      // For privacy, respond the same even if not found
      return res.json({ message: "If that email exists, a reset link was sent" });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Instructions",
      text: `Reset your password using this link (valid for a short time): ${resetURL}`,
      html: `<p>Reset your password using this link (valid for a short time):</p><p><a href="${resetURL}">${resetURL}</a></p>`,
    });

    res.json({ message: "If that email exists, a reset link was sent" });
  } catch (err) {
    res.status(500).json({ error: "Could not send reset email" });
  }
};

/**
 * POST /auth/reset-password
 * - Issues fresh access token + rotates refresh token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword)
      return res.status(400).json({ error: "token, email, newPassword required" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: Date.now() },
    }).select("+password");

    if (!user) return res.status(400).json({ error: "Token invalid or expired" });

    user.password = newPassword;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    const accessToken = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id });
    setRefreshCookie(res, refreshToken);

    res.json({
      message: "Password reset successful",
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not reset password" });
  }
};

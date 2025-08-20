import express from "express";
import {
  register,
  login,
  refresh,
  me,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
  getStudentsVerified,
  getTeachers,
  validateUser,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

router.get("/students-verified", getStudentsVerified);
router.get("/teachers", getTeachers);
router.patch("/validate-user/:id", validateUser);

// Protected
router.get("/me", protect, me);
router.patch("/update-password", protect, updatePassword);

export default router;

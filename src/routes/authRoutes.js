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
  getStudentsNotVerified,
  validateUserAccess,
  registerForm
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import uploadUserFiles  from '../middlewares/upload.js'; // Adjust path as needed

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.patch('/validate-user/:id', validateUserAccess);

router.get("/students-verified", getStudentsVerified);
router.get("/teachers", getTeachers);
router.get("/students-Notverified", getStudentsNotVerified);
router.patch("/validate-user/:id", validateUser);
router.patch("/register", register);

router.patch(
  "/registerForm/:id",
  uploadUserFiles.fields([
    { name: "receipt", maxCount: 1 },
    { name: "photoId", maxCount: 1 }
  ]),
  registerForm
);


// Protected
router.get("/me", protect, me);
router.patch("/update-password", protect, updatePassword);

export default router;

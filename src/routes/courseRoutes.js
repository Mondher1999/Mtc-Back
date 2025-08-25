import express from "express";
import {
  addCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
} from "../controllers/courseController.js";
import upload from '../middlewares/upload.js'; // Adjust path as needed

const router = express.Router();

router.post('/courses', upload.single('videoFile'), addCourse);

router.get("/courses", getAllCourses);
router.get("/courses/:id", getCourse);
router.patch("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

export default router;

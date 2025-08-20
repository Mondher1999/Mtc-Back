import express from "express";
import {
  addLiveCourse,getLiveCourse,updateLiveCourse,deleteLiveCourse,getAllLiveCourses
 
} from "../controllers/LiveCourseController.js"

const router = express.Router();

router.post("/livecourses", addLiveCourse);
router.get("/livecourses", getAllLiveCourses);
router.get("/livecourses/:id", getLiveCourse);
router.patch("/livecourses/:id", updateLiveCourse);
router.delete("/livecourses/:id", deleteLiveCourse);

export default router;

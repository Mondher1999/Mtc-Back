import LiveCourse from "../models/liveCourseModel.js";
import { liveCourseEmailContent,liveCourseInstructorEmailContent } from "../utils/emailTemplates.js";
import User from "../models/userModel.js"; // adjust the path to where your User model is
import { sendEmail } from "../utils/sendEmail.js";
import mongoose from "mongoose";

// Create course
export const addLiveCourse = async (req, res) => {
  try {
    // Remove any _id or id sent by client
    const { _id, id, ...courseData } = req.body;

    // Required fields validation
    const { date, startTime, endTime, selectedStudents, instructorName } = courseData;
    if (!date || !startTime || !endTime || !instructorName) {
      return res.status(400).json({
        error: "Date, startTime, endTime and instructorName are required",
      });
    }

    // Convert to Date object
    const dateObj = new Date(date);
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    // Adjust for UTC+8 (China)
    const startChina = new Date(dateObj);
    startChina.setHours(startHour + 7, startMin);
    const endChina = new Date(dateObj);
    endChina.setHours(endHour + 7, endMin);

    // Prepare course data for creation
    const courseToCreate = {
      ...courseData,
      startTimeChina: startChina.toTimeString().slice(0, 5),
      endTimeChina: endChina.toTimeString().slice(0, 5),
    };

    // Create live course
    const course = await LiveCourse.create(courseToCreate);
    console.log(`✅ Live course created: ${course.courseName} (ID: ${course._id})`);

    // Notify selected students
    const validStudentIds = (selectedStudents || []).filter((sid) =>
      mongoose.Types.ObjectId.isValid(sid)
    );

    if (validStudentIds.length > 0) {
      const students = await User.find({ _id: { $in: validStudentIds } });
      await Promise.all(
        students.map(async (student) => {
          const { text, html } = liveCourseEmailContent(student, course);
          await sendEmail({
            to: student.email,
            subject: `Nouveau cours en direct: ${course.courseName}`,
            text,
            html,
          });
          console.log(`✅ Email sent to student: ${student.name} (${student.email})`);
        })
      );
    } else {
      console.log("ℹ️ No valid students selected for this course");
    }

    // Notify instructor
    const instructor = await User.findOne({
      name: { $regex: `^${instructorName.trim()}$`, $options: "i" },
      role: "enseignant",
    });

    if (instructor) {
      const { text, html } = liveCourseInstructorEmailContent(instructor, course);
      await sendEmail({
        to: instructor.email,
        subject: `您是该课程的讲师: ${course.courseName}`,
        text,
        html,
      });
      console.log(`✅ Email sent to instructor: ${instructor.name} (${instructor.email})`);
    } else {
      console.warn(`⚠️ Instructor with name "${instructorName}" not found`);
    }

    // Respond with created course
    res.status(201).json({
      message: "Live course created, students and instructor notified",
      course,
    });
  } catch (error) {
    console.error("❌ Add live course error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get single course
export const getLiveCourse = async (req, res) => {
  try {
    const course = await LiveCourse.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update course
export const updateLiveCourse = async (req, res) => {
  try {
    const course = await LiveCourse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated doc
    );
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete course
export const deleteLiveCourse = async (req, res) => {
  try {
    const course = await LiveCourse.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all courses
export const getAllLiveCourses = async (req, res) => {
  try {
    const courses = await LiveCourse.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

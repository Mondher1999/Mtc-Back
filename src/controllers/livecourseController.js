import LiveCourse from "../models/liveCourseModel.js";
import { liveCourseEmailContent } from "../utils/emailTemplates.js";
import User from "../models/userModel.js"; // adjust the path to where your User model is
import { sendEmail } from "../utils/sendEmail.js";
// Create course
export const addLiveCourse = async (req, res) => {
  try {
    const { date, startTime, endTime, selectedStudents } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: "Date, startTime and endTime are required" });
    }

    // Convert to Date object
    const dateObj = new Date(date);
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    // UTC+8 for China
    const startChina = new Date(dateObj);
    startChina.setHours(startHour + 7, startMin);
    const endChina = new Date(dateObj);
    endChina.setHours(endHour + 7, endMin);

    // Create course
    const courseData = {
      ...req.body,
      startTimeChina: startChina.toTimeString().slice(0, 5),
      endTimeChina: endChina.toTimeString().slice(0, 5),
    };

    const course = await LiveCourse.create(courseData);

    // Fetch selected students emails
    if (selectedStudents && selectedStudents.length > 0) {
      const students = await User.find({ _id: { $in: selectedStudents } });

      // Send email to all students (sequentially, you can also parallelize if needed)
      for (const student of students) {
        const { text, html } = liveCourseEmailContent(student, course);
        await sendEmail({
          to: student.email,
          subject: `Nouveau cours en direct: ${course.courseName}`,
          text,
          html,
        });
      }
    }

    res.status(201).json({ message: "Live course created and students notified", course });
  } catch (error) {
    console.error("Add live course error:", error);
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

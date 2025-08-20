import LiveCourse from "../models/LivecourseModel.js";

// Create course
export const addLiveCourse = async (req, res) => {
  try {
    const course = await LiveCourse.create(req.body);
    res.status(201).json(course);
  } catch (error) {
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

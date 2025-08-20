import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  courseName: String,
  description: String,
  videoLink: String, 
  instructorName: String,
  duration: String,
  category  : String,
  recordingDate: String,
  selectedStudents: [],
  createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model("Course", courseSchema);

export default Course;

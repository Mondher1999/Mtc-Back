import mongoose from "mongoose";

const livecourseSchema = new mongoose.Schema({
  courseName: String,
  description: String,
  meetingLink: String, 
  instructorName: String,
  date: String,
  time : String,
  selectedStudents: [],
  createdAt: { type: Date, default: Date.now }
});

const LiveCourse = mongoose.model("LiveCourse", livecourseSchema);

export default LiveCourse;

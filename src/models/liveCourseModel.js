import mongoose from "mongoose";

const livecourseSchema = new mongoose.Schema({
  courseName: { type: String },
  description: { type: String },
  meetingLink: { type: String },
  instructorName: { type: String },
  date: { type: Date }, // date du cours
  startTime: { type: String }, // ex: "14:00"
  endTime: { type: String },   // ex: "16:00"
  selectedStudents: [],
  createdAt: { type: Date, default: Date.now },
  startTimeChina: { type: String }, // heure début en Chine
  endTimeChina: { type: String },   // heure fin en Chine

 
});





const LiveCourse = mongoose.model("LiveCourse", livecourseSchema);

export default LiveCourse;

import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  description: { type: String, required: true },
  videoFile: { type: String }, // File path/URL
  instructorName: { type: String, required: true },
  instructorId: { type: String }, // Add instructor ID reference
  duration: { type: String, required: true },
  category: { type: String, required: true },
  recordingDate: { type: String, required: true },
  selectedStudents: [{ type: String }], // Array of student IDs
  
  // Additional video metadata fields
  videoFileSize: { type: Number },
  videoFileOriginalName: { type: String },
  videoFileMimetype: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add pre-save middleware to update updatedAt
courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
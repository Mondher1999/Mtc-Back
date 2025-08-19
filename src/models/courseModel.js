import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model("Course", courseSchema);

export default Course;

import express from "express";
import http from "http";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";   // <-- add this
//import userRoutes from "./src/routes/userRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
//import livecourseRoutes from "./src/routes/liveCourseRoutes.js";

dotenv.config(); // Load .env file

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Define routes
//app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
//app.use("/livecourses", livecourseRoutes);

const port = process.env.PORT || 4002;
server.listen(port, () => console.log(`🚀 Server running on port ${port}`));

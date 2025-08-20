import express from "express";
import http from "http";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import livecourseRoutes from "./src/routes/LivecourseRoutes.js"

import authRoutes from "./src/routes/authRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();


const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({
    origin: "http://localhost:3000", // your Next.js frontend
    credentials: true,               // allow cookies/authorization headers
  }));
  
  app.use(cookieParser());

connectDB();

const server = http.createServer(app);

// Routes

app.use("/livecourses", livecourseRoutes);
app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);

const port = process.env.PORT || 4002;
server.listen(port, () => console.log(`🚀 Server running on port ${port}`));

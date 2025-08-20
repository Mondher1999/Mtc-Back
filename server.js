import express from "express";
import http from "http";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import livecourseRoutes from "./src/routes/livecourseRoutes.js"

import authRoutes from "./src/routes/authRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();


const app = express();
app.use(express.json());
app.use(morgan("dev"));
const allowedOrigins = [
  "http://localhost:3000",
  "http://43.154.65.148"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


  
  app.use(cookieParser());

connectDB();

const server = http.createServer(app);

// Routes

app.use("/livecourses", livecourseRoutes);
app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);

app.listen(4002, "127.0.0.1", () => {
  console.log("🚀 Server running on port 4002");
});

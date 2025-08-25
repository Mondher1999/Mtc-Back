import express from "express";
import http from "http";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import livecourseRoutes from "./src/routes/livecourseRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

import candidateRoutes from "./src/routes/candidateRoutes.js";



import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();

const app = express();

// 🚨 CRITICAL: Configure large payload limits BEFORE routes
// Support for 10GB video uploads
app.use(express.json({ 
  limit: '10gb',
  extended: true,
  parameterLimit: 1000000
}));

app.use(express.urlencoded({ 
  limit: '10gb', 
  extended: true,
  parameterLimit: 1000000
}));

// Logging middleware
app.use(morgan("dev"));

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://43.154.65.148"
];

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001','http://43.154.65.148'], // Add your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Cookie parser
app.use(cookieParser());


app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));

// 🚨 CRITICAL: Set timeout for large video uploads (15 minutes)
app.use((req, res, next) => {
  // Set request timeout
  req.setTimeout(15 * 60 * 1000, () => {
    console.log('Request timeout after 15 minutes');
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout - upload took too long' });
    }
  });
  
  // Set response timeout
  res.setTimeout(15 * 60 * 1000, () => {
    console.log('Response timeout after 15 minutes');
  });
  
  next();
});



  
  app.use(cookieParser());

connectDB();

const server = http.createServer(app);

// Routes

app.use("/livecourses", livecourseRoutes);
app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);
app.use("/candidate", candidateRoutes);

app.listen(4002, "127.0.0.1", () => {
  console.log("🚀 Server running on port 4002");
});

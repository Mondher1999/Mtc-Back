import multer from "multer";

// Set up memory storage which stores files in memory as Buffer objects
const storage = multer.memoryStorage();

// Optional: File filter function to control which files are accepted
// For example, to accept only images:
const fileFilter = (req, file, cb) => {
  // Check if the file is any type of image or a PDF
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true); // Accept file
  } else {
    // Reject file
    cb(
      new Error("Invalid file type! Only image files and PDFs are allowssed."),
      false
    );
  }
};

// Ensure this fileFilter is utilized in your multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
  //fileFilter: fileFilter, // Use the modified file filter
});

export default upload;

import Course from "../models/courseModel.js";

// Create course
export const addCourse = async (req, res) => {
  try {
    console.log('🎯 addCourse controller called');
    console.log('📋 req.body:', req.body);
    console.log('📎 req.file:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      destination: req.file.destination,
      filename: req.file.filename,
      path: req.file.path
    } : 'No file received');

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ error: "Veuillez télécharger un fichier vidéo" });
    }

    let { selectedStudents, ...courseData } = req.body;

    // Parse selectedStudents if needed
    if (selectedStudents && typeof selectedStudents === 'string') {
      try {
        selectedStudents = JSON.parse(selectedStudents);
        console.log('✅ Parsed selectedStudents:', selectedStudents);
      } catch (parseError) {
        console.log('⚠️ Failed to parse selectedStudents:', parseError);
        selectedStudents = [];
      }
    }

    // Add video info
    courseData.videoFile = `/uploads/${req.file.filename}`;
    courseData.videoFileSize = req.file.size;
    courseData.videoFileOriginalName = req.file.originalname;
    courseData.videoFileMimetype = req.file.mimetype;
    courseData.selectedStudents = selectedStudents || [];

    console.log('💾 Data to save:', courseData);

    const course = await Course.create(courseData);
    console.log('✅ Course created successfully:', course._id);

    return res.status(201).json(course);
  } catch (error) {
    console.error('❌ Error creating course:', error);
    console.error('Error stack:', error.stack);
    
    // More specific error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation Error', 
        details: Object.values(error.errors).map(err => err.message) 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate entry' });
    }

    return res.status(500).json({ error: error.message });
  }
};


// Get single course
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated doc
    );
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

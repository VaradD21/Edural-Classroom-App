const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const { compressVideo, compressPDF, copyFile } = require('./utils/compression');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure upload directories exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const compressedDir = path.join(uploadDir, 'compressed');

[uploadDir, compressedDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files from compressed directory
app.use('/uploads/compressed', express.static(compressedDir));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mkv|mov|pdf|docx|pptx|ppt|doc/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype.includes('video') || 
                     file.mimetype.includes('pdf') ||
                     file.mimetype.includes('document') ||
                     file.mimetype.includes('presentation');
    
    if (extname || mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only video, PDF, DOCX, and PPT files are allowed'));
    }
  }
});

// ==================== TEACHER ENDPOINTS ====================

/**
 * POST /teacher/upload
 * Upload and compress lecture/resource files
 */
app.post('/teacher/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { subject, topic } = req.body;

    if (!subject || !topic) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Subject and topic are required' });
    }

    const originalPath = req.file.path;
    const originalSize = req.file.size;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const baseName = path.basename(req.file.filename, fileExt);
    
    // Determine file type
    let fileType = 'other';
    if (['.mp4', '.avi', '.mkv', '.mov'].includes(fileExt)) {
      fileType = 'video';
    } else if (fileExt === '.pdf') {
      fileType = 'pdf';
    } else if (['.docx', '.doc'].includes(fileExt)) {
      fileType = 'docx';
    } else if (['.pptx', '.ppt'].includes(fileExt)) {
      fileType = 'ppt';
    }

    // Compressed file path
    const compressedFileName = `${baseName}-compressed${fileExt}`;
    const compressedPath = path.join(compressedDir, compressedFileName);
    const compressedUrl = `/uploads/compressed/${compressedFileName}`;

    // Compress based on file type
    try {
      if (fileType === 'video') {
        await compressVideo(originalPath, compressedPath);
      } else if (fileType === 'pdf') {
        await compressPDF(originalPath, compressedPath);
      } else {
        // For DOCX/PPT, just copy (compression can be added later)
        await copyFile(originalPath, compressedPath);
      }
    } catch (compressionError) {
      console.error('Compression failed:', compressionError);
      // If compression fails, use original file
      await copyFile(originalPath, compressedPath);
    }

    // Get compressed file size
    const compressedStats = fs.statSync(compressedPath);
    const compressedSize = compressedStats.size;

    // Delete original file to save space
    fs.unlinkSync(originalPath);

    // Save metadata to database
    const uploadDate = new Date().toISOString();
    
    db.run(
      `INSERT INTO resources (file_name, file_type, subject, topic, upload_date, compressed_url, original_size, compressed_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.file.originalname, fileType, subject, topic, uploadDate, compressedUrl, originalSize, compressedSize],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, error: 'Failed to save metadata' });
        }

        const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);
        
        res.json({
          success: true,
          file_id: this.lastID,
          compressed_url: compressedUrl,
          file_type: fileType,
          original_size: originalSize,
          compressed_size: compressedSize,
          compression_ratio: `${compressionRatio}%`,
          message: 'File uploaded and compressed successfully'
        });
      }
    );

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== STUDENT ENDPOINTS ====================

/**
 * GET /student/resources
 * Fetch all resources, optionally filtered by subject
 */
app.get('/student/resources', (req, res) => {
  const { subject } = req.query;
  
  let query = 'SELECT * FROM resources ORDER BY upload_date DESC';
  let params = [];

  if (subject) {
    query = 'SELECT * FROM resources WHERE subject = ? ORDER BY upload_date DESC';
    params = [subject];
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch resources' });
    }

    res.json({
      success: true,
      count: rows.length,
      resources: rows
    });
  });
});

/**
 * GET /student/videos
 * Fetch only video resources, optionally filtered by subject
 */
app.get('/student/videos', (req, res) => {
  const { subject } = req.query;
  
  let query = "SELECT * FROM resources WHERE file_type = 'video' ORDER BY upload_date DESC";
  let params = [];

  if (subject) {
    query = "SELECT * FROM resources WHERE file_type = 'video' AND subject = ? ORDER BY upload_date DESC";
    params = [subject];
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch videos' });
    }

    res.json({
      success: true,
      count: rows.length,
      videos: rows
    });
  });
});

// ==================== LIVE CLASS ENDPOINTS (PLACEHOLDER) ====================

/**
 * POST /live/start
 * Start a live class session
 */
app.post('/live/start', (req, res) => {
  const { subject, topic, join_link } = req.body;

  if (!subject || !topic || !join_link) {
    return res.status(400).json({ success: false, error: 'Subject, topic, and join_link are required' });
  }

  const startTime = new Date().toISOString();

  db.run(
    'INSERT INTO live_classes (subject, topic, join_link, start_time) VALUES (?, ?, ?, ?)',
    [subject, topic, join_link, startTime],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, error: 'Failed to start live class' });
      }

      res.json({
        success: true,
        class_id: this.lastID,
        join_link: join_link,
        message: 'Live class started successfully'
      });
    }
  );
});

/**
 * GET /live/join
 * Get active live class sessions
 */
app.get('/live/join', (req, res) => {
  const { subject } = req.query;

  let query = "SELECT * FROM live_classes WHERE status = 'active' ORDER BY start_time DESC";
  let params = [];

  if (subject) {
    query = "SELECT * FROM live_classes WHERE status = 'active' AND subject = ? ORDER BY start_time DESC";
    params = [subject];
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch live classes' });
    }

    res.json({
      success: true,
      count: rows.length,
      live_classes: rows
    });
  });
});

// ==================== ROOT ENDPOINT ====================

app.get('/', (req, res) => {
  res.json({ 
    message: 'Rural Classroom Backend API',
    version: '1.0.0',
    endpoints: {
      teacher: [
        'POST /teacher/upload - Upload and compress files'
      ],
      student: [
        'GET /student/resources?subject=... - Fetch all resources',
        'GET /student/videos?subject=... - Fetch video lectures'
      ],
      live: [
        'POST /live/start - Start live class',
        'GET /live/join?subject=... - Get active live classes'
      ]
    }
  });
});

// ==================== START SERVER ====================

app.listen(port, () => {
  console.log(`🚀 Rural Classroom Backend running on port ${port}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`📦 Compressed files: ${compressedDir}`);
});

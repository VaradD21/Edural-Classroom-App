const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const prisma = require('./prisma/client');
const { compressVideo, compressPDF, copyFile } = require('./utils/compression');
const logger = require('./utils/logger');

dotenv.config();

// Log environment configuration
logger.info('Environment variables loaded', `PORT: ${process.env.PORT || 5001}`);

const app = express();
const port = process.env.PORT || 5001;


app.use(cors());
app.use(express.json());


const uploadDir = process.env.UPLOAD_DIR || './uploads';
const compressedDir = path.join(uploadDir, 'compressed');

[uploadDir, compressedDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.success(`Directory created: ${dir}`);
  } else {
    logger.info(`Directory exists: ${dir}`);
  }
});


app.use('/uploads/compressed', express.static(compressedDir));


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
  limits: { fileSize: 500 * 1024 * 1024 }, 
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


// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verify email connection on startup
transporter.verify()
  .then(() => {
    logger.success('Email service connected', `Using: ${process.env.GMAIL_USER}`);
  })
  .catch((error) => {
    logger.error('Email service connection failed', error);
    logger.warning('OTP emails will not be sent. Please check GMAIL_USER and GMAIL_APP_PASSWORD in .env');
  });

// Helper function to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to send OTP email
async function sendOTPEmail(email, otp) {
  logger.email(`Sending OTP to ${email}`, `OTP: ${otp}`);
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Rural Classroom - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Rural Classroom</h2>
        <h3>Email Verification</h3>
        <p>Your OTP for email verification is:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
        <p style="color: #888; font-size: 12px;">Rural Classroom - Empowering Education</p>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    logger.success(`OTP email sent successfully to ${email}`, `Message ID: ${result.messageId}`);
    return result;
  } catch (error) {
    logger.error(`Failed to send OTP email to ${email}`, error);
    throw error;
  }
}


// ==================== AUTHENTICATION ENDPOINTS ====================

/**
 * POST /auth/student/signup
 * Register a new student account
 */
app.post('/auth/student/signup', async (req, res) => {
  try {
    const { username, password, name, phone, email } = req.body;
    logger.auth(`Signup attempt for username: ${username}, email: ${email}`);

    // Validate required fields
    if (!username || !password || !name || !phone || !email) {
      logger.warning('Signup failed: Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      logger.warning(`Signup failed: Password too short for ${username}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if username already exists
    const existingUsername = await prisma.student.findUnique({
      where: { username }
    });

    if (existingUsername) {
      logger.warning(`Signup failed: Username already exists - ${username}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Username already exists' 
      });
    }

    // Check if email already exists
    const existingEmail = await prisma.student.findUnique({
      where: { email }
    });

    if (existingEmail) {
      logger.warning(`Signup failed: Email already registered - ${email}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await prisma.student.create({
      data: {
        username,
        password: hashedPassword,
        name,
        phone,
        email,
        createdAt: new Date()
      }
    });
    logger.success(`Student account created: ${username} (ID: ${student.id})`);

    // Generate and send OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpVerification.create({
      data: {
        email,
        otp,
        createdAt: new Date(),
        expiresAt
      }
    });
    logger.info(`OTP generated for ${email}`, `Expires at: ${expiresAt.toLocaleString()}`);

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
      logger.success(`Signup completed successfully for ${username}`);
      res.json({
        success: true,
        message: 'Account created successfully. Please check your email for OTP verification.',
        student_id: student.id,
        email: email
      });
    } catch (emailError) {
      logger.error(`Signup: Account created but email failed for ${email}`, emailError);
      res.status(500).json({ 
        success: false, 
        error: 'Account created but failed to send OTP email. Please try resending OTP.' 
      });
    }

  } catch (error) {
    logger.error('Signup error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /auth/student/verify-otp
 * Verify email with OTP
 */
app.post('/auth/student/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    logger.auth(`OTP verification attempt for email: ${email}`);

    if (!email || !otp) {
      logger.warning('OTP verification failed: Missing email or OTP');
      return res.status(400).json({ 
        success: false, 
        error: 'Email and OTP are required' 
      });
    }

    // Find valid OTP
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email,
        otp,
        isUsed: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpRecord) {
      logger.warning(`OTP verification failed: Invalid OTP for ${email}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid OTP' 
      });
    }

    // Check if OTP expired
    const now = new Date();
    
    if (now > otpRecord.expiresAt) {
      logger.warning(`OTP verification failed: Expired OTP for ${email}`);
      return res.status(400).json({ 
        success: false, 
        error: 'OTP has expired. Please request a new one.' 
      });
    }

    // Mark OTP as used
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true }
    });
    logger.info(`OTP marked as used for ${email}`);

    // Mark student as verified
    await prisma.student.update({
      where: { email },
      data: { isVerified: true }
    });
    logger.success(`Email verified successfully: ${email}`);

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });

  } catch (error) {
    logger.error('Verify OTP error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /auth/student/resend-otp
 * Resend OTP to email
 */
app.post('/auth/student/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    logger.auth(`Resend OTP request for email: ${email}`);

    if (!email) {
      logger.warning('Resend OTP failed: Email not provided');
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { email }
    });

    if (!student) {
      logger.warning(`Resend OTP failed: Email not registered - ${email}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Email not registered' 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpVerification.create({
      data: {
        email,
        otp,
        createdAt: new Date(),
        expiresAt
      }
    });
    logger.info(`New OTP generated for ${email}`);

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
      logger.success(`OTP resent successfully to ${email}`);
      res.json({
        success: true,
        message: 'OTP sent successfully to your email'
      });
    } catch (emailError) {
      logger.error(`Failed to resend OTP email to ${email}`, emailError);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send OTP email' 
      });
    }

  } catch (error) {
    logger.error('Resend OTP error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /auth/student/login
 * Student login
 */
app.post('/auth/student/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    logger.auth(`Login attempt for username: ${username}`);

    if (!username || !password) {
      logger.warning('Login failed: Missing username or password');
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { username }
    });

    if (!student) {
      logger.warning(`Login failed: Invalid username - ${username}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid username or password' 
      });
    }

    // Check if verified
    if (!student.isVerified) {
      logger.warning(`Login failed: Email not verified - ${username}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Please verify your email first' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    
    if (!isPasswordValid) {
      logger.warning(`Login failed: Invalid password for ${username}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid username or password' 
      });
    }

    // Login successful
    logger.success(`Login successful: ${username} (ID: ${student.id})`);
    res.json({
      success: true,
      message: 'Login successful',
      student: {
        id: student.id,
        username: student.username,
        name: student.name,
        email: student.email,
        phone: student.phone
      }
    });

  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({ success: false, error: error.message });
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
      logger.warning('Upload failed: No file provided');
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { subject, topic } = req.body;
    logger.upload(`File upload started: ${req.file.originalname}`, `Subject: ${subject}, Topic: ${topic}`);

    if (!subject || !topic) {
      logger.warning('Upload failed: Missing subject or topic');
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Subject and topic are required' });
    }

    const originalPath = req.file.path;
    const originalSize = req.file.size;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const baseName = path.basename(req.file.filename, fileExt);
    
    
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
    logger.info(`File type detected: ${fileType}`, `Size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

    
    const compressedFileName = `${baseName}-compressed${fileExt}`;
    const compressedPath = path.join(compressedDir, compressedFileName);
    const compressedUrl = `/uploads/compressed/${compressedFileName}`;

    
    try {
      logger.info(`Starting compression for ${fileType}...`);
      if (fileType === 'video') {
        await compressVideo(originalPath, compressedPath);
      } else if (fileType === 'pdf') {
        await compressPDF(originalPath, compressedPath);
      } else {
        await copyFile(originalPath, compressedPath);
      }
      logger.success('Compression completed successfully');
    } catch (compressionError) {
      logger.error('Compression failed, copying original file', compressionError);
      await copyFile(originalPath, compressedPath);
    }

    
    const compressedStats = fs.statSync(compressedPath);
    const compressedSize = compressedStats.size;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);
    logger.info(`Compression ratio: ${compressionRatio}%`, `Final size: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);

    
    fs.unlinkSync(originalPath);

    
    // Save to database
    const resource = await prisma.resource.create({
      data: {
        fileName: req.file.originalname,
        fileType,
        subject,
        topic,
        uploadDate: new Date(),
        compressedUrl,
        originalSize,
        compressedSize
      }
    });
    logger.success(`File uploaded successfully: ${req.file.originalname} (ID: ${resource.id})`);
    
    res.json({
      success: true,
      file_id: resource.id,
      compressed_url: compressedUrl,
      file_type: fileType,
      original_size: originalSize,
      compressed_size: compressedSize,
      compression_ratio: `${compressionRatio}%`,
      message: 'File uploaded and compressed successfully'
    });

  } catch (error) {
    logger.error('Upload error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});



/**
 * GET /student/resources
 * Fetch all resources, optionally filtered by subject
 */
app.get('/student/resources', async (req, res) => {
  try {
    const { subject } = req.query;
    logger.info(`Fetching resources${subject ? ` for subject: ${subject}` : ' (all subjects)'}`);
    
    const where = subject ? { subject } : {};

    const resources = await prisma.resource.findMany({
      where,
      orderBy: {
        uploadDate: 'desc'
      }
    });
    logger.success(`Retrieved ${resources.length} resources`);

    res.json({
      success: true,
      count: resources.length,
      resources
    });

  } catch (error) {
    logger.error('Fetch resources error', error);
    res.status(500).json({ success: false, error: 'Failed to fetch resources' });
  }
});

/**
 * GET /student/videos
 * Fetch only video resources, optionally filtered by subject
 */
app.get('/student/videos', async (req, res) => {
  try {
    const { subject } = req.query;
    logger.info(`Fetching videos${subject ? ` for subject: ${subject}` : ' (all subjects)'}`);
    
    const where = {
      fileType: 'video',
      ...(subject && { subject })
    };

    const videos = await prisma.resource.findMany({
      where,
      orderBy: {
        uploadDate: 'desc'
      }
    });
    logger.success(`Retrieved ${videos.length} videos`);

    res.json({
      success: true,
      count: videos.length,
      videos
    });

  } catch (error) {
    logger.error('Fetch videos error', error);
    res.status(500).json({ success: false, error: 'Failed to fetch videos' });
  }
});



/**
 * POST /live/start
 * Start a live class session
 */
app.post('/live/start', async (req, res) => {
  try {
    const { subject, topic, join_link } = req.body;
    logger.info(`Starting live class: ${subject} - ${topic}`);

    if (!subject || !topic || !join_link) {
      logger.warning('Live class start failed: Missing required fields');
      return res.status(400).json({ success: false, error: 'Subject, topic, and join_link are required' });
    }

    const liveClass = await prisma.liveClass.create({
      data: {
        subject,
        topic,
        joinLink: join_link,
        startTime: new Date()
      }
    });
    logger.success(`Live class started: ${subject} - ${topic} (ID: ${liveClass.id})`);

    res.json({
      success: true,
      class_id: liveClass.id,
      join_link: join_link,
      message: 'Live class started successfully'
    });

  } catch (error) {
    logger.error('Start live class error', error);
    res.status(500).json({ success: false, error: 'Failed to start live class' });
  }
});

/**
 * GET /live/join
 * Get active live class sessions
 */
app.get('/live/join', async (req, res) => {
  try {
    const { subject } = req.query;
    logger.info(`Fetching active live classes${subject ? ` for subject: ${subject}` : ' (all subjects)'}`);

    const where = {
      status: 'active',
      ...(subject && { subject })
    };

    const liveClasses = await prisma.liveClass.findMany({
      where,
      orderBy: {
        startTime: 'desc'
      }
    });
    logger.success(`Retrieved ${liveClasses.length} active live classes`);

    res.json({
      success: true,
      count: liveClasses.length,
      live_classes: liveClasses
    });

  } catch (error) {
    logger.error('Fetch live classes error', error);
    res.status(500).json({ success: false, error: 'Failed to fetch live classes' });
  }
});



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



app.listen(port, () => {
  console.log('\n' + '='.repeat(60));
  logger.server(`Rural Classroom Backend running on port ${port}`);
  logger.info(`Upload directory: ${uploadDir}`);
  logger.info(`Compressed files: ${compressedDir}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60) + '\n');
  logger.success('Server is ready to accept connections');
  logger.info('Press Ctrl+C to stop the server\n');
});

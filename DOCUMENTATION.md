# Rural Classroom - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Files & Functions](#backend-files--functions)
4. [Frontend Files & Functions](#frontend-files--functions)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)

---

## 🎯 Project Overview

**Rural Classroom** is an educational platform for rural colleges with limited internet bandwidth.

### Key Features
- Automatic video compression (480p)
- PDF optimization
- Teacher & Student interfaces
- Cross-platform (Windows, Android, iOS, Web)
- Live class support

### Technology Stack
**Backend:** Node.js, Express, SQLite, FFmpeg, Multer
**Frontend:** Flutter, Dart, Provider, Dio, MediaKit

---

## 🏗️ Architecture

```
Flutter App (Frontend) ←→ HTTP/REST API ←→ Node.js Server (Backend) ←→ SQLite Database
```

---

## 🔧 Backend Files & Functions

### Directory Structure
```
backend/
├── data/                    # Database storage
├── uploads/compressed/      # Compressed files
├── utils/compression.js     # Compression functions
├── database.js             # Database setup
├── index.js                # Main server
├── package.json            # Dependencies
└── .env                    # Configuration
```

---

### File: `backend/package.json`

**Purpose:** Node.js project configuration

**Key Dependencies:**
- `express`: Web server framework
- `cors`: Enable cross-origin requests
- `multer`: Handle file uploads
- `sqlite3`: Database
- `ffmpeg-static` + `fluent-ffmpeg`: Video compression
- `pdf-lib`: PDF optimization
- `dotenv`: Environment variables

---

### File: `backend/.env`

**Purpose:** Configuration settings

```
PORT=5001
DB_PATH=./data/rural_classroom.db
UPLOAD_DIR=./uploads
```

---

### File: `backend/database.js`

**Purpose:** Initialize SQLite database

**What it does:**
1. Creates `data/` folder if missing
2. Opens/creates SQLite database
3. Creates two tables:
   - `resources`: Stores file metadata
   - `live_classes`: Stores live class sessions

**Tables:**

**resources table:**
- id, file_name, file_type, subject, topic, upload_date, compressed_url, original_size, compressed_size

**live_classes table:**
- id, subject, topic, join_link, start_time, status

---

### File: `backend/utils/compression.js`

**Purpose:** Compress videos and PDFs

#### Function: `compressVideo(inputPath, outputPath)`
**What:** Compresses video to 480p
**How:** Uses FFmpeg with H.264 codec, CRF 28, 96kbps audio
**Result:** ~80% file size reduction

#### Function: `compressPDF(inputPath, outputPath)`
**What:** Optimizes PDF by removing metadata
**Result:** 5-15% file size reduction

#### Function: `copyFile(inputPath, outputPath)`
**What:** Copies DOCX/PPT files (already compressed formats)

---

### File: `backend/index.js`

**Purpose:** Main server with API endpoints

**Setup:**
- Express server on port 5001
- CORS enabled for frontend
- Multer for file uploads (500MB limit)
- Accepts: mp4, avi, mkv, mov, pdf, docx, ppt

**API Endpoints:**

#### `POST /teacher/upload`
**Purpose:** Upload and compress files
**Input:** file, subject, topic
**Process:**
1. Receive file
2. Compress based on type (video/PDF/other)
3. Save to uploads/compressed/
4. Store metadata in database
5. Delete original file
**Output:** File ID, compressed URL, compression ratio

#### `GET /student/resources?subject=...`
**Purpose:** Fetch all resources
**Output:** List of all uploaded files

#### `GET /student/videos?subject=...`
**Purpose:** Fetch only videos
**Output:** List of video files

#### `POST /live/start`
**Purpose:** Start live class
**Input:** subject, topic, join_link
**Output:** Class ID, join link

#### `GET /live/join?subject=...`
**Purpose:** Get active live classes
**Output:** List of active classes

---

## 📱 Frontend Files & Functions

### Directory Structure
```
frontend/lib/
├── main.dart                    # App entry point
├── models/                      # Data structures
│   ├── resource_model.dart
│   └── live_class_model.dart
├── providers/                   # State management
│   └── resource_provider.dart
├── screens/                     # UI screens
│   ├── login_screen.dart
│   ├── teacher/                # Teacher screens
│   └── student/                # Student screens
├── services/                    # API calls
│   └── api_service.dart
├── utils/                       # Constants
│   └── constants.dart
└── widgets/                     # Reusable components
```

---

### File: `frontend/pubspec.yaml`

**Purpose:** Flutter dependencies

**Key Packages:**
- `provider`: State management
- `dio`: HTTP client
- `media_kit`: Video player
- `file_picker`: Select files
- `cached_network_image`: Image caching
- `hive`: Local storage
- `url_launcher`: Open links

---

### File: `frontend/lib/main.dart`

**Purpose:** App entry point

**What it does:**
1. Initialize MediaKit (video player)
2. Setup Provider (state management)
3. Configure Material Design theme (large fonts for rural users)
4. Define routes:
   - `/login` → LoginScreen
   - `/teacher` → TeacherHomeScreen
   - `/student` → StudentHomeScreen

---

### File: `frontend/lib/models/resource_model.dart`

**Purpose:** Data structure for files

**Properties:**
- id, fileName, fileType, subject, topic, uploadDate, compressedUrl, originalSize, compressedSize

**Methods:**
- `fromJson()`: Convert API response to object
- `toJson()`: Convert object to JSON
- `fullUrl`: Get complete file URL
- `formattedDate`: Format date as DD/MM/YYYY
- `fileSizeFormatted`: Convert bytes to KB/MB

---

### File: `frontend/lib/services/api_service.dart`

**Purpose:** Handle HTTP requests to backend

**Methods:**

#### `uploadFile(filePath, subject, topic, onProgress)`
**What:** Upload file with progress tracking
**Returns:** Server response with file details

#### `getResources(subject?)`
**What:** Fetch all resources
**Returns:** List of ResourceModel objects

#### `getVideos(subject?)`
**What:** Fetch only videos
**Returns:** List of video ResourceModel objects

#### `startLiveClass(subject, topic, joinLink)`
**What:** Create live class session
**Returns:** Class ID and join link

#### `getLiveClasses(subject?)`
**What:** Get active live classes
**Returns:** List of LiveClassModel objects

#### `_handleError(e)`
**What:** Convert errors to user-friendly messages

---

### File: `frontend/lib/utils/constants.dart`

**Purpose:** Centralized constants

**ApiConstants:**
- `baseUrl`: http://localhost:5001
- Endpoint paths for all API calls

**AppStrings:**
- UI text labels (app name, button labels, messages)

---

### File: `frontend/lib/providers/resource_provider.dart`

**Purpose:** Manage app state

**What it does:**
- Stores list of resources
- Tracks loading state
- Handles errors
- Notifies UI when data changes

**Pattern:**
1. Widget calls provider method
2. Provider fetches data from API
3. Provider calls `notifyListeners()`
4. UI automatically rebuilds with new data

---

### Screens Overview

**Login Screen:** Select Teacher or Student role

**Teacher Screens:**
- Teacher Home: Dashboard
- Upload Lecture: Upload videos
- Upload Resource: Upload PDFs/documents
- My Uploads: View uploaded files

**Student Screens:**
- Student Home: Dashboard
- Recorded Videos: Browse videos
- Resources: Browse PDFs/documents
- Live Classes: Join live sessions
- Video Player: Play videos

---

## 🗄️ Database Schema

### resources table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| file_name | TEXT | Original filename |
| file_type | TEXT | video/pdf/docx/ppt |
| subject | TEXT | Subject name |
| topic | TEXT | Topic name |
| upload_date | TEXT | ISO timestamp |
| compressed_url | TEXT | File path |
| original_size | INTEGER | Bytes before compression |
| compressed_size | INTEGER | Bytes after compression |

### live_classes table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| subject | TEXT | Subject name |
| topic | TEXT | Topic name |
| join_link | TEXT | Meeting URL |
| start_time | TEXT | ISO timestamp |
| status | TEXT | active/ended |

---

## 📡 API Reference

### POST /teacher/upload
Upload and compress file
**Input:** file, subject, topic
**Output:** file_id, compressed_url, compression_ratio

### GET /student/resources?subject=...
Get all resources
**Output:** List of resources

### GET /student/videos?subject=...
Get only videos
**Output:** List of videos

### POST /live/start
Start live class
**Input:** subject, topic, join_link
**Output:** class_id, join_link

### GET /live/join?subject=...
Get active live classes
**Output:** List of live classes

---

## 🔄 How It Works

### Teacher Upload Flow:
1. Teacher selects file in app
2. App sends file to backend via POST /teacher/upload
3. Backend compresses file (video→480p, PDF→optimized)
4. Backend saves metadata to database
5. Backend returns success with file URL
6. App shows success message

### Student View Flow:
1. Student opens "Recorded Lectures"
2. App calls GET /student/videos
3. Backend queries database
4. Backend returns list of videos
5. App displays videos in list
6. Student clicks video → plays in video player

---

## 🚀 Running the Project

### Backend:
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5001
```

### Frontend:
```bash
cd frontend
flutter pub get
flutter run
```

---

## 📊 File Size Examples

**Video Compression:**
- Input: 100MB (1080p) → Output: 15-20MB (480p)
- Compression: ~80-85%

**PDF Optimization:**
- Input: 10MB → Output: 8.5-9.5MB
- Compression: ~5-15%

---

## 🎯 Design Decisions

**Why 480p video?**
- Good quality for educational content
- Works on slow internet (2G/3G)
- Reduces storage costs

**Why SQLite?**
- No separate database server needed
- Perfect for small-medium scale
- Easy backup (single file)

**Why Flutter?**
- Single codebase for all platforms
- Fast development
- Native performance

**Why large fonts?**
- Better for users with varying literacy levels
- Easier to read on mobile devices
- Accessibility for older users

---

End of Documentation

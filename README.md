# Rural Classroom

A comprehensive classroom management system with a Flutter frontend and Node.js backend.

## Project Structure

```
Rural Classroom/
├── backend/          # Node.js backend server
│   ├── data/        # Database files
│   ├── uploads/     # File uploads directory
│   ├── utils/       # Utility functions
│   ├── database.js  # Database configuration
│   ├── index.js     # Main server file
│   └── package.json # Backend dependencies
│
└── frontend/        # Flutter mobile/web application
    ├── lib/         # Flutter source code
    ├── test/        # Test files
    └── pubspec.yaml # Flutter dependencies
```

## Prerequisites

### Backend
- Node.js (v14 or higher)
- npm or yarn

### Frontend
- Flutter SDK (latest stable version)
- Dart SDK (comes with Flutter)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5001
   DB_PATH=./data/rural_classroom.db
   UPLOAD_DIR=./uploads
   ```

4. Start the server:
   ```bash
   npm start
   ```

The backend server will run on `http://localhost:5001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Run the application:
   ```bash
   flutter run
   ```

## Features

- Classroom management
- File upload and management
- Student and teacher management
- Real-time updates

## Development

### Backend
- Built with Express.js
- SQLite database
- RESTful API architecture

### Frontend
- Built with Flutter
- Cross-platform support (iOS, Android, Web, Desktop)
- Material Design UI

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]

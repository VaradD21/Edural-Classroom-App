const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || './data/rural_classroom.db';
const db = new sqlite3.Database(dbPath);

// Initialize database schema
db.serialize(() => {
  // Resources table for lectures and materials
  db.run(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      upload_date TEXT NOT NULL,
      compressed_url TEXT NOT NULL,
      original_size INTEGER,
      compressed_size INTEGER
    )
  `);

  // Live classes table (placeholder for future)
  db.run(`
    CREATE TABLE IF NOT EXISTS live_classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      join_link TEXT NOT NULL,
      start_time TEXT NOT NULL,
      status TEXT DEFAULT 'active'
    )
  `);

  console.log('✅ Database initialized successfully');
});

module.exports = db;

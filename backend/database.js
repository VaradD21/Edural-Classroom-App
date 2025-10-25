const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');


const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || './data/rural_classroom.db';
const db = new sqlite3.Database(dbPath);


db.serialize(() => {
  
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

  // Students table for authentication
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      is_verified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  // OTP verifications table
  db.run(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      otp TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      is_used INTEGER DEFAULT 0
    )
  `);

  console.log('✅ Database initialized successfully');
});

module.exports = db;

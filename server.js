require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const twilio = require('twilio');

const app = express();
const PORT = 5000;
// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const otpStorage = new Map();
// MySQL Connection Pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'login_look',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// Ensure 'users' table exists
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    designation VARCHAR(100),
    photo VARCHAR(255),
    isAdmin INT DEFAULT 0
  )
`;

// Ensure 'AttendanceLogs' table exists
const createAttendanceLogsTable = `
  CREATE TABLE IF NOT EXISTS AttendanceLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    status ENUM('SUCCESS', 'FAILED') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

db.query(createUsersTable, (err) => {
  if (err) console.error('Error creating users table:', err);
  else console.log('Table "users" is ready.');
});

db.query(createAttendanceLogsTable, (err) => {
  if (err) console.error('Error creating AttendanceLogs table:', err);
  else console.log('Table "AttendanceLogs" is ready.');
});


// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage });
// User Registration API
// User Registration Endpoint
app.post('/register', upload.single('photo'), (req, res) => {
  const { fullName, email, phone, designation } = req.body;
  const photo = req.file ? req.file.filename : null;

  if (!fullName || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const insertUserQuery = 'INSERT INTO users (name, email, phone_number, designation, photo) VALUES (?, ?, ?, ?, ?)';
  db.query(insertUserQuery, [fullName, email, phone, designation, photo], (err) => {
    if (err) {
      console.error('Error saving to database:', err);
      return res.status(500).json({ error: 'Database error. Please try again.' });
    }
    res.status(201).json({ message: 'Profile registered successfully!' });
  });
});

// Send OTP API
app.post('/send-otp1', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStorage.set(phone, otp);
  res.json({ success: true, message: 'OTP sent successfully' });
});

// Send OTP API
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStorage.set(phone, otp);
  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
  
});

// Verify OTP API
app.post('/verify-otp1', (req, res) => {
  const { id,phone, otp } = req.body;
  console.log(id);
   const status = 'SUCCESS';
   const insertAttendanceLog = `
    INSERT INTO AttendanceLogs (user_id, phone_number, otp, status) VALUES (?, ?, ?, ?)
  `;

  db.query(insertAttendanceLog, [id, phone, otp, status], (err) => {
    if (err) {
      console.error('Error logging OTP attempt:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
  });
  //res.status(400).json({ success: false, message: 'Invalid OTP' });
  res.json({ success: true, message: 'OTP verified successfully' });
});

app.post('/verify-otp', (req, res) => {
  const { id,phone, otp } = req.body;
  const storedOtp = otpStorage.get(phone);
  console.log(id);
  const insertAttendanceLog = `
  INSERT INTO AttendanceLogs (user_id, phone_number, otp, status) VALUES (?, ?, ?, ?)`;
  if (parseInt(otp) === storedOtp) {
    otpStorage.delete(phone);
    const status = 'SUCCESS';
    db.query(insertAttendanceLog, [id, phone, otp, status], (err) => {
      if (err) {
        console.error('Error logging OTP attempt:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
    });
    res.json({ success: true, message: 'OTP verified successfully' });
  } else {
  const status = 'FAILED';
  db.query(insertAttendanceLog, [id, phone, otp, status], (err) => {
    if (err) {
      console.error('Error logging OTP attempt:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
  });
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
 
 });

app.get("/api/logs", (req, res) => {
  const query = `
    SELECT users.name, AttendanceLogs.phone_number, 
           AttendanceLogs.otp, AttendanceLogs.status, AttendanceLogs.created_at 
    FROM AttendanceLogs 
    JOIN users ON AttendanceLogs.user_id = users.id 
    ORDER BY AttendanceLogs.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching logs:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, logs: results });
  });
});

// Fetch all users
app.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, users: results });
  });
});

// Update user

app.post('/api/users/:id', upload.single('photo'), (req, res) => {
  const { id } = req.params;
  const { fullName, email, phone, designation,isAdmin } = req.body;
  const photo = req.file ? req.file.filename : null;

  const query = photo
    ? 'UPDATE users SET name = ?, email = ?, phone_number = ?, designation = ?, isAdmin=?,photo = ? WHERE id = ?'
    : 'UPDATE users SET name = ?, email = ?, phone_number = ?, designation = ?,isAdmin=? WHERE id = ?';

  const params = photo
    ? [fullName, email, phone, designation, photo, isAdmin,id]
    : [fullName, email, phone, designation, isAdmin,id];

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, message: 'User updated successfully' });
  });
});
// Delete user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM users WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
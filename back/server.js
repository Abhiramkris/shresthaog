// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const nodemon = require('nodemon');
const app = express();
const PORT = 5000;
const cors = require('cors'); // Import the cors middleware

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'shresthanew',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database');
});

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Register endpoint
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.query(sql, [username, hash], (err, result) => {
        if (err) {
          res.status(500).json({ error: 'Internal server error' });
        } else {
          res.status(200).json({ message: 'Registration successful' });
        }
      });
    }
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ?';

  db.query(sql, [username], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    } else if (result.length > 0) {
      const storedHash = result[0].password;

      // Compare the entered password with the stored hash
      bcrypt.compare(password, storedHash, (err, match) => {
        if (match) {
          res.status(200).json({ message: 'Login successful' });
        } else {
          res.status(401).json({ error: 'Invalid password' });
        }
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

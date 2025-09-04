const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // for parsing application/json
app.use(express.static('public')); // Serve static files from 'public' directory

// Simple route to check if server is running
app.get('/', (req, res) => {
  res.send('Guangzhou Metro Backend is running!');
});

// API routes
const DB_FILE = './db.json';

// Helper function to read data from db.json
const readDatabase = () => {
  const data = fs.readFileSync(DB_FILE);
  return JSON.parse(data);
};

// Helper function to write data to db.json
const writeDatabase = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// GET endpoint to fetch all lines
app.get('/api/lines', (req, res) => {
  try {
    const db = readDatabase();
    res.json(db.lines);
  } catch (error) {
    res.status(500).send('Error reading database');
  }
});

// POST endpoint to add a new line
app.post('/api/lines', (req, res) => {
  try {
    const db = readDatabase();
    const newLine = req.body;

    // Basic validation
    if (!newLine.lineName || !newLine.stations) {
      return res.status(400).send('Invalid data format');
    }

    // Assign a new ID (simple approach)
    newLine.lineId = new Date().getTime().toString();

    db.lines.push(newLine);
    writeDatabase(db);

    res.status(201).json(newLine);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error writing to database');
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

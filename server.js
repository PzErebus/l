const express = require('express');
const cors = require('cors');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const DB_FILE = './db.json';

// --- Database and User Initialization ---
let db = { user: null, lines: [] };

const initializeDatabase = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE);
      db = JSON.parse(data);
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    }

    // Self-healing user initialization:
    // If no user exists, or the password is not a valid hash, create one.
    const defaultPassword = 'admin123';
    let needsWrite = false;
    if (!db.user || !db.user.passwordHash || !db.user.passwordHash.startsWith('$2b$')) {
      console.log('No valid admin user found. Creating one with default password...');
      const saltRounds = 10;
      const passwordHash = bcrypt.hashSync(defaultPassword, saltRounds);
      db.user = {
        username: 'admin',
        passwordHash: passwordHash
      };
      needsWrite = true;
      console.log(`Admin user created. Username: admin, Password: ${defaultPassword}`);
    }

    if (needsWrite) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    }

  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1); // Exit if DB can't be set up
  }
};

initializeDatabase(); // Run initialization on server start

// --- Middleware ---
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(session({
  secret: 'a-very-secret-key-for-gz-metro',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(express.static('public'));
app.get('/', (req, res) => res.redirect('/login.html'));

// --- Authentication Logic ---
const checkAuth = (req, res, next) => {
  if (req.session.user) next();
  else res.status(401).send('Unauthorized');
};

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const adminUser = db.user;

  if (username === adminUser.username) {
    const match = await bcrypt.compare(password, adminUser.passwordHash);
    if (match) {
      req.session.user = { username: adminUser.username };
      return res.status(200).send('Login successful');
    }
  }
  res.status(401).send('Invalid credentials');
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Could not log out.');
    res.clearCookie('connect.sid');
    res.status(200).send('Logged out');
  });
});

app.get('/api/check-auth', (req, res) => {
  res.status(200).json({ loggedIn: !!req.session.user, user: req.session.user });
});

// --- Data API ---
const writeDatabase = (data) => {
  db = data;
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};

app.get('/api/lines', checkAuth, (req, res) => res.json(db.lines));

app.post('/api/lines', checkAuth, (req, res) => {
  const newLine = req.body;
  if (!newLine.lineName || !newLine.stations) {
    return res.status(400).send('Invalid data format');
  }
  newLine.lineId = new Date().getTime().toString();
  const newDb = { ...db, lines: [...db.lines, newLine] };
  writeDatabase(newDb);
  res.status(201).json(newLine);
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

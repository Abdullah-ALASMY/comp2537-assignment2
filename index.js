require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { MongoClient } = require('mongodb');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Build MongoDB connection URL from env variables
const mongoUrl = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority&tls=true`;

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.NODE_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUrl
  }),
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Connect to MongoDB
let db;
MongoClient.connect(mongoUrl)
  .then(client => {
    db = client.db(process.env.MONGODB_DATABASE);
    console.log("Connected to MongoDB");
  })
  .catch(err => console.error("MongoDB connection error:", err));

// Home page
app.get('/', (req, res) => {
  if (!req.session.name) {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  } else {
    res.send(`
      <h1>Welcome, ${req.session.name}</h1>
      <a href="/members">Go to Members Area</a> | <a href="/logout">Logout</a>
    `);
  }
});

// Login (GET)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Login (POST)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const validation = schema.validate({ email, password });
  if (validation.error) {
    return res.send("Invalid input: " + validation.error.details[0].message);
  }

  const user = await db.collection("users").findOne({ email: email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.send("Invalid email or password.");
  }

  req.session.name = user.name;
  res.redirect('/members');
});

// Signup (GET)
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// Signup (POST)
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  const schema = Joi.object({
    name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const validation = schema.validate({ name, email, password });
  if (validation.error) {
    return res.send("Invalid input: " + validation.error.details[0].message);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword
    });

    req.session.name = name;
    res.redirect('/members');
  } catch (err) {
    res.send("Error saving user: " + err.message);
  }
});

// Members Area
app.get('/members', (req, res) => {
  if (!req.session.name) {
    return res.redirect('/login');
  }

  const images = ['pic1.gif', 'pic2.gif', 'pic3.gif'];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  const htmlPath = path.join(__dirname, 'views', 'members.html');
  fs.readFile(htmlPath, 'utf8', (err, html) => {
    if (err) return res.status(500).send("Error loading members page.");

    const rendered = html
      .replace('{{name}}', req.session.name)
      .replace('{{image}}', randomImage);

    res.send(rendered);
  });
});

// Logout and destroy session
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send("Error logging out.");
    res.redirect('/');
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send("<h1>404 - Page Not Found</h1>");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

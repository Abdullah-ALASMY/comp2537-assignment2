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

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: process.env.NODE_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL
  }),
  cookie: { maxAge: 1000 * 60 * 60 }
}));

// MongoDB connection
let db;
MongoClient.connect(process.env.MONGO_URL)
  .then(client => {
    db = client.db();
    console.log("Connected to MongoDB");
  })
  .catch(err => console.error("MongoDB connection error:", err));

// Home Page
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

// loogin page (GET)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
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
  if (!user) {
    return res.send("Invalid email or password.");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.send("Invalid email or password.");
  }

  req.session.name = user.name;
  res.redirect('/members');
});




// Signup Page (GET)
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// Signup Logic (POST)
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


app.get('/members', (req, res) => {
  if (!req.session.name) {
    return res.redirect('/login');
  }

  const images = ['pic1.gif', 'pic2.gif', 'pic3.gif'];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  const htmlPath = path.join(__dirname, 'views', 'members.html');
  fs.readFile(htmlPath, 'utf8', (err, html) => {
    if (err) {
      return res.status(500).send("Error loading members page.");
    }

    const rendered = html
      .replace('{{name}}', req.session.name)
      .replace('{{image}}', randomImage);

    res.send(rendered);
  });
});


app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send("Error logging out.");
    }
    res.redirect('/');
  });
});


// 404 handler
app.use((req, res) => {
  res.status(404).send("<h1>404 - Page Not Found</h1>");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

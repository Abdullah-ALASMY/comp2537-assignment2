require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const mongoUrl = process.env.MONGODB_URI;
let db;

MongoClient.connect(mongoUrl)
  .then(client => {
    db = client.db(process.env.MONGODB_DATABASE);
    console.log('Connected to MongoDB');

    app.use(session({
      secret: process.env.NODE_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ client: client, dbName: process.env.MONGODB_DATABASE }),
      cookie: { maxAge: 1000 * 60 * 60 }
    }));

    // Home Route
    app.get('/', (req, res) => {
      res.render('index', { user: req.session.name || null, role: req.session.role || null, title: 'Home Page' });
    });

    // Login Form Route (GET)
    app.get('/login', (req, res) => {
      res.render('login', { user: req.session.name || null, role: req.session.role || null, title: 'Login Page' });
    });

    // Login Route (POST)
    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      const user = await db.collection('users').findOne({ email });
      
      if (user && await bcrypt.compare(password, user.password)) {
        req.session.name = user.name;
        req.session.role = user.role || 'user';
        console.log("User logged in:", user);
        return res.redirect('/members');
      }

      res.send('Invalid email or password.');
    });

// Signup Form Route (GET)
app.get('/signup', (req, res) => {
  res.render('signup', { 
    user: req.session.name || null, 
    role: req.session.role || null, 
    title: 'Sign Up Page' 
  });
});

// Signup Route (POST)
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.send('Email already in use.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      role: 'user'  // Default role
    });

    req.session.name = name;
    req.session.role = 'user';
    res.redirect('/members');
  } catch (err) {
    console.error('Error during signup:', err);
    res.send('Error during signup. Please try again.');
  }
});


    // Members Route
    app.get('/members', (req, res) => {
      if (!req.session.name) return res.redirect('/login');
      res.render('members', { user: req.session.name, role: req.session.role, title: 'Members Area' });
    });

    // Admin Route
    app.get('/admin', async (req, res) => {
      if (!req.session.name) return res.redirect('/login');
      if (req.session.role !== 'admin') return res.status(403).send('Access denied. Admins only.');

      const users = await db.collection('users').find().toArray();
      res.render('admin', { users, user: req.session.name, role: req.session.role, title: 'Admin Panel' });
    });
    // Promote User to Admin
app.get('/admin/promote/:email', async (req, res) => {
  if (!req.session.name) return res.redirect('/login');
  if (req.session.role !== 'admin') return res.status(403).send('Access denied. Admins only.');

  const email = req.params.email;
  await db.collection('users').updateOne({ email }, { $set: { role: 'admin' } });
  res.redirect('/admin');
});

// Demote User to Regular User
app.get('/admin/demote/:email', async (req, res) => {
  if (!req.session.name) return res.redirect('/login');
  if (req.session.role !== 'admin') return res.status(403).send('Access denied. Admins only.');

  const email = req.params.email;
  await db.collection('users').updateOne({ email }, { $set: { role: 'user' } });
  res.redirect('/admin');
});


    // logout User
    app.get('/logout', (req, res) => {
      req.session.destroy(() => res.redirect('/'));
    });

    // 404 Route
    app.use((req, res) => {
      res.status(404).render('404', { title: '404 - Not Found', user: req.session.name || null, role: req.session.role || null });
    });

    app.listen(PORT, () => console.log(`Server running on port ${PORT} at http://localhost:${PORT}`));

  })
  .catch(err => console.error('MongoDB connection error:', err));
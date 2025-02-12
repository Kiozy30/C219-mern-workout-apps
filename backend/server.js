// Entry file for the backend app
// where we register the express app

// dovenv is the package that loads environment variables
// from .env file into process.env object available globally in node.js environment
// config() attaches environment variables to process.env
require("dotenv").config();

// Require express that installed via npm
const express = require("express");
// Require mongoose that installed via npm
const mongoose = require("mongoose");
// Require routes
const workoutRoutes = require("./routes/workouts");
const userRoutes = require('./routes/user');


// Set up the express app
const app = express();

// Sign-up
app.post('/signup', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message }); // Handle errors
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, 'your_secret_key'); // Replace with a strong secret

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware:
// any code that executes between us getting a request on the server
// and us sending a response back to the client
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, 'your_secret_key', (err, user) => { // Replace with your secret
      if (err) {
        return res.sendStatus(403); // Or 401 for unauthorized
      }

      req.user = user; // Make user available in routes
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Protected Routes (example)
app.get('/workouts', authenticateJWT, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.userId }); // Filter by user
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Parse and attach data sent to server to request object
app.use(express.json());

// Global middleware
// the arrow function will fire for each request that comes in
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
// workoutRoutes is triggered when we make a request to /api/workouts
app.use("/api/workouts", workoutRoutes);
app.use('/api/user', userRoutes);

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log('connected to db & listening on port', process.env.PORT)
    })
  })
  .catch((error) => {
    console.log(error)
  })

  //Require cors
  const cors = require('cors');
  // Allow requests from all origins (for development only)
  app.use(cors());

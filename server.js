import express from 'express';
import next from 'next';
import session from 'express-session';
import mongoose from 'mongoose';
import connectMongo from 'connect-mongo';
import passport from 'passport';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Import your passport configuration
import './src/utils/passport.js';

// Import your authentication routes
import googleAuthRoutes from './src/app/api/auth/google.js';
import facebookAuthRoutes from './src/app/api/auth/facebook.js';
import githubAuthRoutes from './src/app/api/auth/github.js';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Connect to MongoDB
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('MongoDB connected');
  }).catch(err => {
    console.error(err);
  });

  // Set up session middleware
  server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: connectMongo.create({ mongoUrl: process.env.MONGO_URI }),
  }));

  // Initialize Passport and session
  server.use(passport.initialize());
  server.use(passport.session());

  // Use authentication routes
  server.use('/app/api/auth/google', googleAuthRoutes);
  server.use('/app/api/auth/facebook', facebookAuthRoutes);
  server.use('/app/api/auth/github', githubAuthRoutes);

  // Handle Next.js requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});

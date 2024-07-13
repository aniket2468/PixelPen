import express from 'express';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import passport from 'passport';
import googleAuthRoutes from '../../api/auth/google';
import facebookAuthRoutes from '../../api/auth/facebook';
import githubAuthRoutes from '../../api/auth/github';
import connectDB from '../../utils/connect';
import '../../utils/passport'; // This line ensures the passport config is imported and executed

const MongoStore = connectMongo(session);

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/auth/facebook', facebookAuthRoutes);
app.use('/api/auth/github', githubAuthRoutes);

connectDB();

export default app;

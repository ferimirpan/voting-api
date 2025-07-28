import express from 'express';
import cors from 'cors';
import { errorHanlder, notFoundPath } from './app/middleware/error.middleware.js';
import authRoute from './app/routes/auth.route.js';
import userRoute from './app/routes/user.route.js';
import pollRoute from './app/routes/poll.route.js';

const app = express();

// cors middleware
const corsOptions = {
  origin: '*'
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.json({ message: "Welcome To Vote API", uptime: process.uptime() })
});

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/poll', pollRoute);

app.use(notFoundPath);
app.use(errorHanlder);

export default app;

import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoute from './app/routes/user.route.js';
import { errorHanlder, notFoundPath } from './app/middleware/error.middleware.js';
import authRoute from './app/routes/auth.route.js';

const app = express();
const PORT = process.env.PORT || 8000;

const corsOptions = {
  origin: '*'
};

// cors middleware
app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.json({ message: "Welcome To Vote API", uptime: process.uptime() })
});

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/user', userRoute);

app.use(notFoundPath);
app.use(errorHanlder);

// connection database
try {
  await mongoose.connect(process.env.DATABASE);
  console.log('database connected');
} catch (e) {
  console.log(`failed to connect ${e.message}`);
}

app.listen(PORT, () => console.log(`server started on port ${PORT}`));

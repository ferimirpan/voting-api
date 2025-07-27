
import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

// connection database
try {
  await mongoose.connect(process.env.DATABASE);
  console.log('database connected');
} catch (e) {
  console.log(`failed to connect ${e.message}`);
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`server started on port ${PORT}`));

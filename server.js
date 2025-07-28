
import 'dotenv/config';
import app from './app.js';
import { connectDB } from './app/config/db.js';

const mongoURI = process.env.DATABASE;
const PORT = process.env.PORT || 8000;

// connection database
connectDB(mongoURI).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

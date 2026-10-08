import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.js';
import { initDatabase } from './database/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
try {
  initDatabase();
  console.log('[SMART-LIMS] SQLite Database Initialized.');
} catch (err) {
  console.error('[SMART-LIMS] Database Initialization Failed:', err);
}

// Health route
app.get('/health', (req, res) => {
  res.json({ status: 'ONLINE', timestamp: new Date().toISOString(), system: 'SMART-LIMS OS Engine' });
});

// API Routes
app.use('/api', apiRouter);

// Start server if not imported by test suite
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  SMART-LIMS Backend Server Running on http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

export default app;

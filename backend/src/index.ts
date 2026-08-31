import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'three-way-match-backend' });
});

app.use('/api', apiRoutes);

async function startServer() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.warn('⚠️ No MONGODB_URI provided in environment variables.');
  } else {
    try {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ MongoDB connected successfully');
    } catch (err) {
      console.error('❌ MongoDB connection error:', err);
      // Don't crash the entire container immediately so logs are captured
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server actively listening on 0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal crash during server startup:', err);
  process.exit(1);
});

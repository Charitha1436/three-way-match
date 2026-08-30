import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();
mongoose.set('bufferCommands', false);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

async function registerRoutes() {
  const routesDir = path.join(__dirname, 'routes');
  if (fs.existsSync(routesDir)) {
    const files = fs.readdirSync(routesDir);
    for (const file of files) {
      if ((file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')) {
        try {
          const filePath = path.join(routesDir, file);
          const fileUrl = pathToFileURL(filePath).href;
          const routeModule = await import(fileUrl);
          const router = routeModule.default || routeModule.router || routeModule;
          if (typeof router === 'function' || (router && router.stack)) {
            app.use('/api', router);
            console.log(`[Router] Successfully registered /api routes from: routes/${file}`);
            return;
          }
        } catch (e) {
          console.warn(`[Router Warning] Could not load routes/${file}:`, (e as Error).message);
        }
      }
    }
  }
}

async function startServer() {
  await registerRoutes();

  const atlasUri = process.env.MONGODB_URI;
  if (atlasUri && !atlasUri.includes('127.0.0.1')) {
    try {
      console.log('[MongoDB] Attempting to connect to Atlas cluster...');
      await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 3000 });
      console.log('MongoDB Atlas Connected successfully!');
    } catch (err: any) {
      console.warn('[MongoDB Atlas Blocked/Unreachable]:', err.message);
      console.log('[MongoDB] Starting local in-memory database instead...');
      const memoryServer = await MongoMemoryServer.create();
      const localUri = memoryServer.getUri();
      await mongoose.connect(localUri);
      console.log(`[MongoDB] Connected to in-memory database at: ${localUri}`);
    }
  } else {
    const memoryServer = await MongoMemoryServer.create();
    const localUri = memoryServer.getUri();
    await mongoose.connect(localUri);
    console.log(`[MongoDB] Connected to in-memory database at: ${localUri}`);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Match Engine Server running on port ${PORT}`);
  });
}

startServer();
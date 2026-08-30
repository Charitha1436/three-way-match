import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import {
  loginHandler,
  uploadDocumentHandler,
  getDocumentHandler,
  getDocumentFileHandler,
  listDocumentsHandler,
  getMatchHandler,
  getSummaryHandler,
  listSkusHandler,
  createSkuHandler,
  updateSkuHandler,
  deleteSkuHandler,
} from '../controllers/appController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Configure multer storage
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Public Auth Route
router.post('/auth/login', loginHandler);
router.post('/api/auth/login', loginHandler);

// Protected Document Routes
router.post('/documents/upload', authMiddleware, upload.single('file'), uploadDocumentHandler);
router.post('/api/documents/upload', authMiddleware, upload.single('file'), uploadDocumentHandler);

router.get('/documents', authMiddleware, listDocumentsHandler);
router.get('/api/documents', authMiddleware, listDocumentsHandler);

router.get('/documents/:id', authMiddleware, getDocumentHandler);
router.get('/api/documents/:id', authMiddleware, getDocumentHandler);

router.get('/documents/:id/file', authMiddleware, getDocumentFileHandler);
router.get('/api/documents/:id/file', authMiddleware, getDocumentFileHandler);

// Protected Match & Summary Routes
router.get('/match/:poNumber', authMiddleware, getMatchHandler);
router.get('/api/match/:poNumber', authMiddleware, getMatchHandler);

router.get('/summary/:poNumber', authMiddleware, getSummaryHandler);
router.get('/api/summary/:poNumber', authMiddleware, getSummaryHandler);

// Protected SKU Master CRUD Routes
router.get('/masters/sku', authMiddleware, listSkusHandler);
router.get('/api/masters/sku', authMiddleware, listSkusHandler);

router.post('/masters/sku', authMiddleware, createSkuHandler);
router.post('/api/masters/sku', authMiddleware, createSkuHandler);

router.patch('/masters/sku/:id', authMiddleware, updateSkuHandler);
router.patch('/api/masters/sku/:id', authMiddleware, updateSkuHandler);

router.delete('/masters/sku/:id', authMiddleware, deleteSkuHandler);
router.delete('/api/masters/sku/:id', authMiddleware, deleteSkuHandler);

export default router;
import { Router } from 'express';
import multer from 'multer';
import { processDocument, getDocument, getSessionDocuments } from '../controllers/ocrController';
import { config } from '../config/env';

const upload = multer({ dest: config.uploadDir });
const router = Router();
router.post('/process', upload.single('document'), processDocument);
router.get('/session/:sessionId', getSessionDocuments);
router.get('/:documentId', getDocument);
export default router;

import { Router } from 'express';
import multer from 'multer';
import { transcribe } from '../controllers/asrController';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
router.post('/transcribe', upload.single('audio'), transcribe);
export default router;

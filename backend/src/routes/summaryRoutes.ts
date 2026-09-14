import { Router } from 'express';
import { generateSummary, getSummary } from '../controllers/summaryController';

const router = Router();
router.post('/generate', generateSummary);
router.get('/:sessionId', getSummary);
export default router;

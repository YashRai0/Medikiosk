import { Router } from 'express';
import { getHistory, updateHistory, approveHistory, rejectHistory, sendBack } from '../controllers/physicianController';

const router = Router();
router.get('/:sessionId', getHistory);
router.put('/:sessionId', updateHistory);
router.post('/:sessionId/approve', approveHistory);
router.post('/:sessionId/reject', rejectHistory);
router.post('/:sessionId/send-back', sendBack);
export default router;

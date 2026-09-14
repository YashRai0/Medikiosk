import { Router } from 'express';
import { createAyushRecord, getAyushRecord, updateAyushRecord } from '../controllers/ayushController';

const router = Router();
router.post('/', createAyushRecord);
router.get('/:sessionId', getAyushRecord);
router.put('/:sessionId', updateAyushRecord);
export default router;

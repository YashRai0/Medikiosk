import { Router } from 'express';
import { createSession, getSession, recordConsent, listSessions, updateSession } from '../controllers/sessionController';

const router = Router();
router.post('/', createSession);
router.get('/', listSessions);
router.get('/:id', getSession);
router.post('/:id/consent', recordConsent);
router.put('/:id', updateSession);
export default router;

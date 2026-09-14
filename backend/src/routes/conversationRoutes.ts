import { Router } from 'express';
import { addMessage, getConversation, getNextQuestion } from '../controllers/conversationController';

const router = Router();
router.post('/message', addMessage);
router.get('/:sessionId', getConversation);
router.post('/next-question', getNextQuestion);
export default router;

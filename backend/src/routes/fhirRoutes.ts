import { Router } from 'express';
import { getFHIRBundle } from '../controllers/fhirController';

const router = Router();
router.get('/:sessionId', getFHIRBundle);
export default router;

import { Router } from 'express';
import { createPrediction, getPredictionHistory } from '../controllers/predictController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validateBody, predictionSchema } from '../utils/validation.js';

const router = Router();

router.post('/predictions', authenticate, validateBody(predictionSchema), asyncHandler(createPrediction));
router.get('/predictions', authenticate, asyncHandler(getPredictionHistory));

export default router;

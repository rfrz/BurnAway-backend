import { Router } from 'express';
import { createSession } from '../controllers/authController.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { createSessionSchema, validateBody } from '../utils/validation.js';

const router = Router();

router.post('/', validateBody(createSessionSchema), asyncHandler(createSession));

export default router;

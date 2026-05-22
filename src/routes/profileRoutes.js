import { Router } from 'express';
import { getProfile, updateProfile, deleteProfile } from '../controllers/profileController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validateBody, updateProfileSchema } from '../utils/validation.js';

const router = Router();

router.get('/', authenticate, asyncHandler(getProfile));
router.patch('/', authenticate, validateBody(updateProfileSchema), asyncHandler(updateProfile));
router.delete('/', authenticate, asyncHandler(deleteProfile));

export default router;

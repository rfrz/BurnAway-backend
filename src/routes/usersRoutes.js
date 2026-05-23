import { Router } from 'express';
import { createUser, updateCurrentUserPassword } from '../controllers/authController.js';
import {
  deleteCurrentUser,
  getCurrentUser,
  updateCurrentUser
} from '../controllers/profileController.js';
import {
  createCurrentUserPrediction,
  listCurrentUserPredictions
} from '../controllers/predictController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import {
  createUserSchema,
  predictionSchema,
  updateCurrentUserPasswordSchema,
  updateCurrentUserSchema,
  validateBody
} from '../utils/validation.js';

const router = Router();

router.post('/', validateBody(createUserSchema), asyncHandler(createUser));
router.get('/me', authenticate, asyncHandler(getCurrentUser));
router.patch('/me', authenticate, validateBody(updateCurrentUserSchema), asyncHandler(updateCurrentUser));
router.delete('/me', authenticate, asyncHandler(deleteCurrentUser));
router.patch(
  '/me/password',
  authenticate,
  validateBody(updateCurrentUserPasswordSchema),
  asyncHandler(updateCurrentUserPassword)
);
router.post(
  '/me/predictions',
  authenticate,
  validateBody(predictionSchema),
  asyncHandler(createCurrentUserPrediction)
);
router.get('/me/predictions', authenticate, asyncHandler(listCurrentUserPredictions));

export default router;

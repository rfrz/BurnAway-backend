import { Router } from 'express';
import { changePassword, login, register } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { changePasswordSchema, validateBody, loginSchema, registerSchema } from '../utils/validation.js';

const router = Router();

router.post('/register', validateBody(registerSchema), asyncHandler(register));
router.post('/login', validateBody(loginSchema), asyncHandler(login));
router.patch('/change-password', authenticate, validateBody(changePasswordSchema), asyncHandler(changePassword));

export default router;

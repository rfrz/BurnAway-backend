import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { validateBody, loginSchema, registerSchema } from '../utils/validation.js';

const router = Router();

router.post('/register', validateBody(registerSchema), asyncHandler(register));
router.post('/login', validateBody(loginSchema), asyncHandler(login));

export default router;

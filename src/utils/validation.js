import { z } from 'zod';

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    next(result.error);
    return;
  }

  req.body = result.data;
  next();
};

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be at most 50 characters')
      .regex(/^[A-Za-z0-9_]+$/, 'Username may only contain letters, numbers, and underscores'),
    email: z
      .string()
      .trim()
      .email('Email must be valid')
      .max(255, 'Email must be at most 255 characters')
      .transform((email) => email.toLowerCase()),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
    age: z.coerce
      .number()
      .int('Age must be an integer')
      .min(13, 'Age must be at least 13')
      .max(100, 'Age must be at most 100'),
    experience_years: z.coerce
      .number()
      .min(0, 'Experience years cannot be negative')
      .max(80, 'Experience years must be realistic')
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email('Email must be valid')
      .max(255, 'Email must be at most 255 characters')
      .transform((email) => email.toLowerCase()),
    password: z.string().min(1, 'Password is required').max(128, 'Password must be at most 128 characters')
  })
  .strict();

export const predictionSchema = z
  .object({
    dailyWorkHours: z.coerce.number().min(0).max(24),
    sleepHours: z.coerce.number().min(0).max(24),
    caffeineIntake: z.coerce.number().int().min(0).max(2000),
    bugsPerDay: z.coerce.number().int().min(0).max(1000),
    commitsPerDay: z.coerce.number().int().min(0).max(1000),
    meetingsPerDay: z.coerce.number().int().min(0).max(100),
    screenTime: z.coerce.number().min(0).max(24),
    exerciseHours: z.coerce.number().min(0).max(24),
    stressLevel: z.coerce.number().min(0).max(10)
  })
  .strict();

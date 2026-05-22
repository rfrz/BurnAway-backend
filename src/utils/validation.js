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

export const updateProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be at most 50 characters')
      .regex(/^[A-Za-z0-9_]+$/, 'Username may only contain letters, numbers, and underscores')
      .optional(),
    email: z
      .string()
      .trim()
      .email('Email must be valid')
      .max(255, 'Email must be at most 255 characters')
      .transform((email) => email.toLowerCase())
      .optional(),
    age: z.coerce
      .number()
      .int('Age must be an integer')
      .min(13, 'Age must be at least 13')
      .max(100, 'Age must be at most 100')
      .optional(),
    experience_years: z.coerce
      .number()
      .min(0, 'Experience years cannot be negative')
      .max(80, 'Experience years must be realistic')
      .optional()
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one profile field is required'
  });

export const predictionSchema = z
  .object({
    daily_work_hours: z.coerce.number().min(0).max(24),
    sleep_hours: z.coerce.number().min(0).max(24),
    caffeine_intake: z.coerce.number().int().min(0).max(2000),
    bugs_per_day: z.coerce.number().int().min(0).max(1000),
    commits_per_day: z.coerce.number().int().min(0).max(1000),
    meetings_per_day: z.coerce.number().int().min(0).max(100),
    screen_time: z.coerce.number().min(0).max(24),
    exercise_hours: z.coerce.number().min(0).max(24),
    stress_level: z.coerce.number().min(0).max(100)
  })
  .strict();

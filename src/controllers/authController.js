import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient.js';
import { AppError } from '../middlewares/errorHandler.js';

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT secret is not configured', 500);
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const register = async (req, res) => {
  const { username, email, password, age, experience_years } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      age,
      experience_years
    },
    select: {
      id: true
    }
  });

  const token = signToken(user.id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user_id: user.id,
      token
    }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user.id);

  res.status(200).json({
    success: true,
    message: 'User logged in successfully',
    data: {
      user_id: user.id,
      token
    }
  });
};

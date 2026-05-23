import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient.js';
import { AppError } from '../middlewares/errorHandler.js';

const signToken = (userId, tokenVersion) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT secret is not configured', 500);
  }

  return jwt.sign({ userId, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const getAuthenticatedUserId = (req) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Authentication is required', 401);
  }

  return userId;
};

export const createUser = async (req, res) => {
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
      id: true,
      tokenVersion: true
    }
  });

  const token = signToken(user.id, user.tokenVersion);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user_id: user.id,
      token
    }
  });
};

export const createSession = async (req, res) => {
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

  const token = signToken(user.id, user.tokenVersion);

  res.status(201).json({
    success: true,
    message: 'Session created successfully',
    data: {
      user_id: user.id,
      token
    }
  });
};

export const updateCurrentUserPassword = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { current_password, new_password } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
      tokenVersion: true
    }
  });

  if (!user) {
    throw new AppError('Authenticated user was not found', 404);
  }

  const isPasswordValid = await bcrypt.compare(current_password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const hashedPassword = await bcrypt.hash(new_password, 12);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      tokenVersion: {
        increment: 1
      }
    },
    select: {
      id: true,
      tokenVersion: true
    }
  });

  const token = signToken(updatedUser.id, updatedUser.tokenVersion);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: {
      user_id: updatedUser.id,
      token
    }
  });
};

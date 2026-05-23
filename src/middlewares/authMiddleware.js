import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient.js';
import { AppError } from './errorHandler.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token is required', 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT secret is not configured', 500);
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new AppError('Invalid or expired authentication token', 401);
    }

    if (!decoded?.userId || !Number.isInteger(decoded.tokenVersion)) {
      throw new AppError('Invalid authentication token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, tokenVersion: true }
    });

    if (!user) {
      throw new AppError('Authenticated user was not found', 404);
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new AppError('Invalid or expired authentication token', 401);
    }

    req.user = {
      id: user.id,
      tokenVersion: user.tokenVersion
    };

    next();
  } catch (error) {
    next(error);
  }
};

import prisma from '../config/prismaClient.js';
import { AppError } from '../middlewares/errorHandler.js';

const currentUserSelect = {
  id: true,
  username: true,
  email: true,
  age: true,
  experience_years: true,
  createdAt: true
};

const formatUser = (user) => ({
  user_id: user.id,
  username: user.username,
  email: user.email,
  age: user.age,
  experience_years: user.experience_years,
  created_at: user.createdAt
});

const getAuthenticatedUserId = (req) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Authentication is required', 401);
  }

  return userId;
};

export const getCurrentUser = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: currentUserSelect
  });

  if (!user) {
    throw new AppError('Authenticated user was not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'User fetched successfully',
    data: formatUser(user)
  });
};

export const updateCurrentUser = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  const user = await prisma.user.update({
    where: { id: userId },
    data: req.body,
    select: currentUserSelect
  });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: formatUser(user)
  });
};

export const deleteCurrentUser = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  await prisma.$transaction(async (tx) => {
    await tx.prediction.deleteMany({
      where: { user_id: userId }
    });

    await tx.user.delete({
      where: { id: userId }
    });
  });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: null
  });
};

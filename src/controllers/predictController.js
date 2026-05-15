import prisma from '../config/prismaClient.js';
import { getBurnoutPrediction } from '../services/aiService.js';
import { AppError } from '../middlewares/errorHandler.js';

const toMlPayload = (user, metrics) => ({
  age: user.age,
  experience_years: user.experience_years,
  daily_work_hours: metrics.dailyWorkHours,
  sleep_hours: metrics.sleepHours,
  caffeine_intake: metrics.caffeineIntake,
  bugs_per_day: metrics.bugsPerDay,
  commits_per_day: metrics.commitsPerDay,
  meetings_per_day: metrics.meetingsPerDay,
  screen_time: metrics.screenTime,
  exercise_hours: metrics.exerciseHours,
  stress_level: metrics.stressLevel
});

const normalizePredictionResponse = (response) => {
  const burnoutLevel = response?.burnout_level ?? response?.result;
  const confidenceScore = Number(response?.confidence_score ?? response?.confidenceScore);

  if (!burnoutLevel || Number.isNaN(confidenceScore)) {
    throw new AppError('Invalid response from ML prediction service', 502);
  }

  return {
    burnoutLevel,
    confidenceScore
  };
};

const formatHistoryItem = (prediction) => ({
  prediction_id: prediction.id,
  dailyWorkHours: prediction.dailyWorkHours,
  sleepHours: prediction.sleepHours,
  caffeineIntake: prediction.caffeineIntake,
  bugsPerDay: prediction.bugsPerDay,
  commitsPerDay: prediction.commitsPerDay,
  meetingsPerDay: prediction.meetingsPerDay,
  screenTime: prediction.screenTime,
  exerciseHours: prediction.exerciseHours,
  stressLevel: prediction.stressLevel,
  burnout_level: prediction.result,
  confidence_score: prediction.confidenceScore,
  createdAt: prediction.createdAt
});

export const createPrediction = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Authentication is required', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      age: true,
      experience_years: true
    }
  });

  if (!user) {
    throw new AppError('Authenticated user was not found', 404);
  }

  const mlResponse = await getBurnoutPrediction(toMlPayload(user, req.body));
  const { burnoutLevel, confidenceScore } = normalizePredictionResponse(mlResponse);

  const prediction = await prisma.prediction.create({
    data: {
      userId,
      dailyWorkHours: req.body.dailyWorkHours,
      sleepHours: req.body.sleepHours,
      caffeineIntake: req.body.caffeineIntake,
      bugsPerDay: req.body.bugsPerDay,
      commitsPerDay: req.body.commitsPerDay,
      meetingsPerDay: req.body.meetingsPerDay,
      screenTime: req.body.screenTime,
      exerciseHours: req.body.exerciseHours,
      stressLevel: req.body.stressLevel,
      result: burnoutLevel,
      confidenceScore
    },
    select: {
      id: true,
      result: true,
      confidenceScore: true
    }
  });

  res.status(201).json({
    success: true,
    message: 'Prediction created successfully',
    data: {
      prediction_id: prediction.id,
      burnout_level: prediction.result,
      confidence_score: prediction.confidenceScore
    }
  });
};

export const getPredictionHistory = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Authentication is required', 401);
  }

  const predictions = await prisma.prediction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      dailyWorkHours: true,
      sleepHours: true,
      caffeineIntake: true,
      bugsPerDay: true,
      commitsPerDay: true,
      meetingsPerDay: true,
      screenTime: true,
      exerciseHours: true,
      stressLevel: true,
      result: true,
      confidenceScore: true,
      createdAt: true
    }
  });

  res.status(200).json({
    success: true,
    message: 'Prediction history fetched successfully',
    data: predictions.map(formatHistoryItem)
  });
};

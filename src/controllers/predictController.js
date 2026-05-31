import prisma from '../config/prismaClient.js';
import { getBurnoutPrediction } from '../services/aiService.js';
import { AppError } from '../middlewares/errorHandler.js';

const calculateAge = (birthDate) => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const toMlPayload = (user, metrics) => ({
  age: calculateAge(new Date(user.birth_date)),
  experience_years: user.experience_years,
  daily_work_hours: metrics.daily_work_hours,
  sleep_hours: metrics.sleep_hours,
  caffeine_intake: metrics.caffeine_intake,
  bugs_per_day: metrics.bugs_per_day,
  commits_per_day: metrics.commits_per_day,
  meetings_per_day: metrics.meetings_per_day,
  screen_time: metrics.screen_time,
  exercise_hours: metrics.exercise_hours,
  stress_level: metrics.stress_level
});

const normalizePredictionResponse = (response) => {
  const prediction = response?.prediction;
  const burnout_level = prediction?.burnout_level;
  const confidence = Number(prediction?.confidence);
  const stress_estimate = Number(prediction?.stress_estimate);
  const probabilities = prediction?.probabilities;
  const advice = response?.advice;

  const hasValidProbabilities =
    probabilities &&
    typeof probabilities === 'object' &&
    !Array.isArray(probabilities) &&
    Object.keys(probabilities).length > 0 &&
    Object.values(probabilities).every((value) => Number.isFinite(Number(value)));

  if (
    typeof burnout_level !== 'string' ||
    burnout_level.trim().length === 0 ||
    prediction?.confidence == null ||
    !Number.isFinite(confidence) ||
    prediction?.stress_estimate == null ||
    !Number.isFinite(stress_estimate) ||
    !hasValidProbabilities ||
    typeof advice !== 'string'
  ) {
    throw new AppError('Invalid response from ML prediction service', 502);
  }

  return {
    prediction: {
      burnout_level: burnout_level.trim(),
      confidence,
      stress_estimate,
      probabilities: Object.fromEntries(
        Object.entries(probabilities).map(([level, probability]) => [level, Number(probability)])
      )
    },
    advice
  };
};

const formatHistoryItem = (prediction) => ({
  prediction_id: prediction.id,
  daily_work_hours: prediction.daily_work_hours,
  sleep_hours: prediction.sleep_hours,
  caffeine_intake: prediction.caffeine_intake,
  bugs_per_day: prediction.bugs_per_day,
  commits_per_day: prediction.commits_per_day,
  meetings_per_day: prediction.meetings_per_day,
  screen_time: prediction.screen_time,
  exercise_hours: prediction.exercise_hours,
  stress_level: prediction.stress_level,
  prediction: {
    burnout_level: prediction.burnout_level,
    confidence: prediction.confidence,
    stress_estimate: prediction.stress_estimate,
    probabilities: prediction.probabilities
  },
  advice: prediction.advice,
  created_at: prediction.created_at
});

export const createCurrentUserPrediction = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Authentication is required', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      birth_date: true,
      experience_years: true
    }
  });

  if (!user) {
    throw new AppError('Authenticated user was not found', 404);
  }

  const mlResponse = await getBurnoutPrediction(toMlPayload(user, req.body));
  const { prediction: aiPrediction, advice } = normalizePredictionResponse(mlResponse);

  const prediction = await prisma.prediction.create({
    data: {
      user_id: userId,
      daily_work_hours: req.body.daily_work_hours,
      sleep_hours: req.body.sleep_hours,
      caffeine_intake: req.body.caffeine_intake,
      bugs_per_day: req.body.bugs_per_day,
      commits_per_day: req.body.commits_per_day,
      meetings_per_day: req.body.meetings_per_day,
      screen_time: req.body.screen_time,
      exercise_hours: req.body.exercise_hours,
      stress_level: req.body.stress_level,
      burnout_level: aiPrediction.burnout_level,
      confidence: aiPrediction.confidence,
      stress_estimate: aiPrediction.stress_estimate,
      probabilities: aiPrediction.probabilities,
      advice
    },
    select: {
      id: true,
      burnout_level: true,
      confidence: true,
      stress_estimate: true,
      probabilities: true,
      advice: true
    }
  });

  res.status(201).json({
    success: true,
    message: 'Prediction created successfully',
    data: {
      prediction_id: prediction.id,
      prediction: {
        burnout_level: prediction.burnout_level,
        confidence: prediction.confidence,
        stress_estimate: prediction.stress_estimate,
        probabilities: prediction.probabilities
      },
      advice: prediction.advice
    }
  });
};

export const listCurrentUserPredictions = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Authentication is required', 401);
  }

  const predictions = await prisma.prediction.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      daily_work_hours: true,
      sleep_hours: true,
      caffeine_intake: true,
      bugs_per_day: true,
      commits_per_day: true,
      meetings_per_day: true,
      screen_time: true,
      exercise_hours: true,
      stress_level: true,
      burnout_level: true,
      confidence: true,
      stress_estimate: true,
      probabilities: true,
      advice: true,
      created_at: true
    }
  });

  res.status(200).json({
    success: true,
    message: 'Prediction history fetched successfully',
    data: predictions.map(formatHistoryItem)
  });
};

export const getCurrentUserPredictionById = async (req, res) => {
  const userId = req.user?.id;
  const predictionId = req.params.predictionId;

  if (!userId) {
    throw new AppError('Authentication is required', 401);
  }

  const prediction = await prisma.prediction.findFirst({
    where: { 
      id: predictionId,
      user_id: userId 
    },
    select: {
      id: true,
      daily_work_hours: true,
      sleep_hours: true,
      caffeine_intake: true,
      bugs_per_day: true,
      commits_per_day: true,
      meetings_per_day: true,
      screen_time: true,
      exercise_hours: true,
      stress_level: true,
      burnout_level: true,
      confidence: true,
      stress_estimate: true,
      probabilities: true,
      advice: true,
      created_at: true
    }
  });

  if (!prediction) {
    throw new AppError('Prediction not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Prediction detail fetched successfully',
    data: formatHistoryItem(prediction)
  });
};

export const deleteCurrentUserPredictionById = async (req, res) => {
  const userId = req.user?.id;
  const predictionId = req.params.predictionId;

  if (!userId) {
    throw new AppError('Authentication is required', 401);
  }

  const prediction = await prisma.prediction.findFirst({
    where: { 
      id: predictionId,
      user_id: userId 
    }
  });

  if (!prediction) {
    throw new AppError('Prediction not found', 404);
  }

  await prisma.prediction.delete({
    where: { id: predictionId }
  });

  res.status(200).json({
    success: true,
    message: 'Prediction deleted successfully',
    data: null
  });
};

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

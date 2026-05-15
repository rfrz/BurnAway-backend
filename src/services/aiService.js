import axios from 'axios';
import { AppError } from '../middlewares/errorHandler.js';

const aiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const getPredictUrl = () => {
  if (!process.env.ML_API_URL) {
    throw new AppError('ML API URL is not configured', 500);
  }

  return `${process.env.ML_API_URL.replace(/\/$/, '')}/predict`;
};

export const getBurnoutPrediction = async (payload) => {
  try {
    const response = await aiClient.post(getPredictUrl(), payload);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new AppError('ML prediction service timed out', 503);
    }

    if (error.response || error.request) {
      throw new AppError('ML prediction service is unavailable', 503);
    }

    throw error;
  }
};

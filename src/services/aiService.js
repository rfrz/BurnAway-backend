import axios from 'axios';
import { AppError } from '../middlewares/errorHandler.js';

const aiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const getPredictUrl = () => {
  if (!process.env.DL_API_URL) {
    throw new AppError('DL API URL is not configured', 500);
  }

  const predictPath = process.env.DL_PREDICT_PATH || '/predict_burnout';
  return `${process.env.DL_API_URL.replace(/\/$/, '')}/${predictPath.replace(/^\//, '')}`;
};

const summarizeAiError = (data) => {
  if (!data) return '';

  const detail = data.detail || data.message || data.error || data;

  if (typeof detail === 'string') {
    return detail;
  }

  try {
    return JSON.stringify(detail);
  } catch {
    return 'Unreadable error response';
  }
};

export const getBurnoutPrediction = async (payload) => {
  try {
    const response = await aiClient.post(getPredictUrl(), payload);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new AppError('DL prediction service timed out', 503);
    }

    if (error.response) {
      const detail = summarizeAiError(error.response.data);
      const status = error.response.status;
      const suffix = detail ? `: ${detail}` : '';
      throw new AppError(`DL prediction service returned ${status}${suffix}`, 503);
    }

    if (error.request) {
      throw new AppError('DL prediction service did not respond', 503);
    }

    throw error;
  }
};

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import prisma from './config/prismaClient.js';
import authRoutes from './routes/authRoutes.js';
import predictRoutes from './routes/predictRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();
const port = process.env.PORT || 3000;

const corsOrigin = process.env.CORS_ORIGIN || '*';
const corsOptions =
  corsOrigin === '*'
    ? { origin: '*' }
    : {
        origin: corsOrigin.split(',').map((origin) => origin.trim()),
        credentials: true
      };

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later',
      data: null
    }
  })
);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BurnAway backend is healthy',
    data: {
      status: 'ok'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', predictRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`BurnAway backend listening on port ${port}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default app;

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import config from './config/config.js';
import { connectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { initCache } from './utils/cache.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import { initializeQueues, closeQueues, queueManager } from './queues/index.js';

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    allowedHeaders: config.cors.allowedHeaders,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Bull Board Admin UI
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [], // Will be populated after queues are initialized
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

// Routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Connect to Redis and initialize cache
    const redisClient = await connectRedis();
    if (redisClient) {
      initCache(redisClient);
    }

    // Initialize queues and workers
    await initializeQueues();

    // Add all queues to Bull Board
    const queues = queueManager.getAllQueues();
    const bullBoardQueues = Array.from(queues.values()).map((queue) => new BullMQAdapter(queue));
    setQueues(bullBoardQueues);
    logger.info(`Bull Board UI available at http://localhost:${config.port}/admin/queues`);
    
    // Start listening
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close all queues and workers
    await closeQueues();
    
    // Disconnect Redis
    await disconnectRedis();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();


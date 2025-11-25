import { Worker } from "bullmq";
import logger from "../../utils/logger.js";
import { getRedisConnection } from "../queueConfig.js";

/**
 * Base worker class with logging for success and failure
 * Extend this class to create custom workers
 */
export class BaseWorker {
  constructor(queueName, processor, options = {}) {
    this.queueName = queueName;
    this.processor = processor;
    this.options = options;

    this.worker = new Worker(
      queueName,
      async (job) => {
        const startTime = Date.now();
        logger.info(`[${queueName}] Processing job ${job.id}`, {
          jobId: job.id,
          jobName: job.name,
          data: job.data,
        });

        try {
          const result = await this.processor(job);
          const duration = Date.now() - startTime;

          logger.info(`[${queueName}] Job ${job.id} completed successfully`, {
            jobId: job.id,
            jobName: job.name,
            duration: `${duration}ms`,
            result,
          });

          return result;
        } catch (error) {
          const duration = Date.now() - startTime;

          logger.error(`[${queueName}] Job ${job.id} failed`, {
            jobId: job.id,
            jobName: job.name,
            duration: `${duration}ms`,
            error: error.message,
            stack: error.stack,
            attemptsMade: job.attemptsMade,
            attemptsRemaining: job.opts.attempts - job.attemptsMade,
          });

          throw error;
        }
      },
      {
        connection: getRedisConnection(),
        ...options,
      }
    );

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Worker events
    this.worker.on("completed", (job) => {
      logger.info(`[${this.queueName}] Worker completed job ${job.id}`, {
        jobId: job.id,
        jobName: job.name,
      });
    });

    this.worker.on("failed", (job, err) => {
      logger.error(`[${this.queueName}] Worker failed job ${job?.id || "unknown"}`, {
        jobId: job?.id,
        jobName: job?.name,
        error: err.message,
        stack: err.stack,
      });
    });

    this.worker.on("error", (err) => {
      logger.error(`[${this.queueName}] Worker error:`, err);
    });

    this.worker.on("stalled", (jobId) => {
      logger.warn(`[${this.queueName}] Worker stalled job ${jobId}`);
    });

    this.worker.on("closing", () => {
      logger.info(`[${this.queueName}] Worker closing...`);
    });

    this.worker.on("closed", () => {
      logger.info(`[${this.queueName}] Worker closed`);
    });
  }

  /**
   * Get the worker instance
   * @returns {Worker} - BullMQ Worker instance
   */
  getWorker() {
    return this.worker;
  }

  /**
   * Close the worker gracefully
   */
  async close() {
    await this.worker.close();
  }
}


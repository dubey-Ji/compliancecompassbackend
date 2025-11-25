import { Queue } from "bullmq";
import logger from "../utils/logger.js";
import { getRedisConnection, defaultJobOptions } from "./queueConfig.js";

class QueueManager {
  constructor() {
    this.queues = new Map();
    this.workers = new Map();
  }

  /**
   * Register a new queue
   * @param {string} queueName - Name of the queue
   * @param {object} options - Optional queue-specific options
   * @returns {Queue} - BullMQ Queue instance
   */
  registerQueue(queueName, options = {}) {
    if (this.queues.has(queueName)) {
      logger.warn(`Queue ${queueName} already exists, returning existing instance`);
      return this.queues.get(queueName);
    }

    const queue = new Queue(queueName, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        ...defaultJobOptions,
        ...options.defaultJobOptions,
      },
      ...options,
    });

    this.queues.set(queueName, queue);
    logger.info(`Queue registered: ${queueName}`);

    return queue;
  }

  /**
   * Get a queue by name
   * @param {string} queueName - Name of the queue
   * @returns {Queue|null} - BullMQ Queue instance or null if not found
   */
  getQueue(queueName) {
    return this.queues.get(queueName) || null;
  }

  /**
   * Get all registered queues
   * @returns {Map} - Map of all queues
   */
  getAllQueues() {
    return this.queues;
  }

  /**
   * Get all registered workers
   * @returns {Map} - Map of all workers
   */
  getAllWorkers() {
    return this.workers;
  }

  /**
   * Register a worker for a queue
   * @param {string} queueName - Name of the queue
   * @param {Worker} worker - BullMQ Worker instance
   */
  registerWorker(queueName, worker) {
    this.workers.set(queueName, worker);
    logger.info(`Worker registered for queue: ${queueName}`);
  }

  /**
   * Get a worker by queue name
   * @param {string} queueName - Name of the queue
   * @returns {Worker|null} - BullMQ Worker instance or null if not found
   */
  getWorker(queueName) {
    return this.workers.get(queueName) || null;
  }

  /**
   * Close all queues and workers gracefully
   */
  async closeAll() {
    logger.info("Closing all queues and workers...");

    // Close all workers
    for (const [queueName, worker] of this.workers.entries()) {
      try {
        await worker.close();
        logger.info(`Worker closed: ${queueName}`);
      } catch (error) {
        logger.error(`Error closing worker ${queueName}:`, error);
      }
    }

    // Close all queues
    for (const [queueName, queue] of this.queues.entries()) {
      try {
        await queue.close();
        logger.info(`Queue closed: ${queueName}`);
      } catch (error) {
        logger.error(`Error closing queue ${queueName}:`, error);
      }
    }

    this.queues.clear();
    this.workers.clear();
    logger.info("All queues and workers closed");
  }
}

// Singleton instance
const queueManager = new QueueManager();

export default queueManager;


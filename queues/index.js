import queueManager from "./queueManager.js";
import { ExampleWorker } from "./workers/exampleWorker.js";
import logger from "../utils/logger.js";

/**
 * Initialize all queues and workers
 * Add new queues and workers here as you create them
 */
export const initializeQueues = async () => {
  try {
    logger.info("Initializing queues and workers...");

    // Register queues
    const exampleQueue = queueManager.registerQueue("example-queue");

    // Initialize and register workers
    const exampleWorker = new ExampleWorker();
    queueManager.registerWorker("example-queue", exampleWorker.getWorker());

    logger.info("All queues and workers initialized successfully");

    return {
      queues: queueManager.getAllQueues(),
      workers: queueManager.workers,
    };
  } catch (error) {
    logger.error("Error initializing queues:", error);
    throw error;
  }
};

/**
 * Close all queues and workers gracefully
 */
export const closeQueues = async () => {
  await queueManager.closeAll();
};

export { queueManager };
export default queueManager;


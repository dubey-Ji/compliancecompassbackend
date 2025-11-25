import { BaseWorker } from "./baseWorker.js";
import logger from "../../utils/logger.js";

/**
 * Example worker - replace with your actual worker logic
 * This demonstrates how to create a worker for a queue
 */
export class ExampleWorker extends BaseWorker {
  constructor() {
    super(
      "example-queue",
      async (job) => {
        // Your job processing logic here
        logger.info(`Processing example job with data:`, job.data);

        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Return result
        return {
          processed: true,
          jobId: job.id,
          timestamp: new Date().toISOString(),
        };
      },
      {
        concurrency: 5, // Process 5 jobs concurrently
      }
    );
  }
}


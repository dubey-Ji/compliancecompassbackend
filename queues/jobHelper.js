import queueManager from "./queueManager.js";
import logger from "../utils/logger.js";

/**
 * Helper functions for adding jobs to queues
 */

/**
 * Add a job to a queue
 * @param {string} queueName - Name of the queue
 * @param {string} jobName - Name of the job
 * @param {object} data - Job data
 * @param {object} options - Optional job-specific options
 * @returns {Promise<Job>} - The created job
 */
export const addJob = async (queueName, jobName, data = {}, options = {}) => {
  const queue = queueManager.getQueue(queueName);

  if (!queue) {
    throw new Error(`Queue ${queueName} not found. Make sure it's registered in queues/index.js`);
  }

  try {
    const job = await queue.add(jobName, data, options);
    logger.info(`Job added to queue ${queueName}`, {
      jobId: job.id,
      jobName,
      queueName,
    });
    return job;
  } catch (error) {
    logger.error(`Error adding job to queue ${queueName}:`, error);
    throw error;
  }
};

/**
 * Add multiple jobs to a queue
 * @param {string} queueName - Name of the queue
 * @param {Array<{name: string, data: object, options?: object}>} jobs - Array of jobs to add
 * @returns {Promise<Job[]>} - Array of created jobs
 */
export const addBulkJobs = async (queueName, jobs) => {
  const queue = queueManager.getQueue(queueName);

  if (!queue) {
    throw new Error(`Queue ${queueName} not found. Make sure it's registered in queues/index.js`);
  }

  try {
    const jobData = jobs.map((job) => ({
      name: job.name,
      data: job.data,
      opts: job.options || {},
    }));

    const createdJobs = await queue.addBulk(jobData);
    logger.info(`Added ${createdJobs.length} jobs to queue ${queueName}`, {
      queueName,
      count: createdJobs.length,
    });
    return createdJobs;
  } catch (error) {
    logger.error(`Error adding bulk jobs to queue ${queueName}:`, error);
    throw error;
  }
};

/**
 * Get job status
 * @param {string} queueName - Name of the queue
 * @param {string} jobId - Job ID
 * @returns {Promise<Job|null>} - Job instance or null if not found
 */
export const getJob = async (queueName, jobId) => {
  const queue = queueManager.getQueue(queueName);

  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  return await queue.getJob(jobId);
};

/**
 * Get queue statistics
 * @param {string} queueName - Name of the queue
 * @returns {Promise<object>} - Queue statistics
 */
export const getQueueStats = async (queueName) => {
  const queue = queueManager.getQueue(queueName);

  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
};


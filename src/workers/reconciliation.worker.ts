import { Worker } from 'bullmq';
import env from '@config/env';
import logger from '@config/logger';

const reconciliationWorker = new Worker(
  'reconciliation',
  async (job) => {
    logger.info(`Processing reconciliation job ${job.id}`);
    // Placeholder for gateway vs ledger reconciliation tasks.
  },
  {
    concurrency: 1,
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  },
);

reconciliationWorker.on('completed', (job) => {
  logger.info(`Reconciliation job ${job.id} completed`);
});

reconciliationWorker.on('failed', (job, err) => {
  logger.error(`Reconciliation job ${job?.id} failed:`, err);
});

reconciliationWorker.on('error', (error) => {
  logger.error('Reconciliation worker encountered an error:', error);
});

logger.info('Reconciliation worker started');

export default reconciliationWorker;

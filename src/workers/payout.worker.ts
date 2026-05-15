import { Worker } from 'bullmq';
import env from '@config/env';
import logger from '@config/logger';
import PayoutService from '@modules/payouts/services/payout.service';

const payoutWorker = new Worker(
  'payouts',
  async (job) => {
    const { payoutId, action, reason } = job.data;
    logger.info(`Processing payout job ${job.id}`);

    if (action === 'success') {
      await PayoutService.markSuccess(payoutId);
      return;
    }

    if (action === 'failed') {
      await PayoutService.markFailed(payoutId, reason);
      return;
    }

    await PayoutService.markProcessing(payoutId);
  },
  {
    concurrency: 3,
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  },
);

payoutWorker.on('completed', (job) => {
  logger.info(`Payout job ${job.id} completed`);
});

payoutWorker.on('failed', (job, err) => {
  logger.error(`Payout job ${job?.id} failed:`, err);
});

payoutWorker.on('error', (error) => {
  logger.error('Payout worker encountered an error:', error);
});

logger.info('Payout worker started');

export default payoutWorker;

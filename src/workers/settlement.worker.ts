import { Worker } from 'bullmq';
import env from '@config/env';
import logger from '@config/logger';
import SettlementService from '@modules/settlements/services/settlement.service';

const settlementWorker = new Worker(
  'settlements',
  async (job) => {
    const { organizationId, eventId, amount, currency, createdBy } = job.data;
    logger.info(`Processing settlement job ${job.id}`);

    await SettlementService.releaseHoldToAvailable({
      organizationId,
      eventId,
      amount,
      currency,
      createdBy,
    });
  },
  {
    concurrency: 5,
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  },
);

settlementWorker.on('completed', (job) => {
  logger.info(`Settlement job ${job.id} completed`);
});

settlementWorker.on('failed', (job, err) => {
  logger.error(`Settlement job ${job?.id} failed:`, err);
});

settlementWorker.on('error', (error) => {
  logger.error('Settlement worker encountered an error:', error);
});

logger.info('Settlement worker started');

export default settlementWorker;

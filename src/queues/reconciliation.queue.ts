import { Queue } from 'bullmq';
import env from '@config/env';

const reconciliationQueue = new Queue('reconciliation', {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export default reconciliationQueue;

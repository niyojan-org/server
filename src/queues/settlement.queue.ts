import { Queue } from 'bullmq';
import env from '@config/env';

const settlementQueue = new Queue('settlements', {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export default settlementQueue;

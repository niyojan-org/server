import { Queue } from 'bullmq';
import env from '@config/env';

const pushQueue = new Queue('push-notifications', {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export default pushQueue;

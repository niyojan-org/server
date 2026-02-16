import { Worker } from 'bullmq';
import env from '@config/env';
import logger from '@config/logger';
import { sendPushNotification } from '@infra/push/fcm.sender';

const pushWorker = new Worker(
  'push-notifications',
  async (job) => {
    const { userId, title, body, data } = job.data;

    logger.info(`Sending push notification to user ${userId}`);

    try {
      const result = await sendPushNotification({
        userId,
        title,
        body,
        data,
      });

      logger.info(
        `Push notification sent to user ${userId}: ${result.sent} sent, ${result.failed} failed`
      );

      return result;
    } catch (error) {
      logger.error(`Failed to send push notification to user ${userId}:`, error);
      throw error;
    }
  },
  {
    concurrency: 10,
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  }
);

pushWorker.on('completed', (job) => {
  logger.info(`Push notification job ${job.id} completed`);
});

pushWorker.on('failed', (job, err) => {
  logger.error(`Push notification job ${job?.id} failed:`, err);
});

pushWorker.on('error', (error) => {
  logger.error('Push worker encountered an error:', error);
});

logger.info('Push notification worker started');

export default pushWorker;

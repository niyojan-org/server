import env from '@config/env';
import logger from '@config/logger';
import nodemailer from 'nodemailer';

const SMTP_CONFIG = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.NODE_ENV === 'production',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
};

const createTransporter = async () => {
  const transporter = nodemailer.createTransport(SMTP_CONFIG);
  transporter.verify((error: Error | null, _success: boolean) => {
    if (error) {
      logger.error('Error configuring mail transporter:', error);
    } else {
      logger.info('SMTP service is configured and ready to send emails');
    }
  });
  return transporter;
};
const transporter = await createTransporter();

export default transporter;

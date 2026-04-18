import mongoose from 'mongoose';
import env from '@config/env';
import logger from '@config/logger';

const connectDatabase = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to the database successfully.');
  } catch (error) {
    logger.error('Failed to connect to the database', error);
    process.exit(1);
  }
};

export default connectDatabase;

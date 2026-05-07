import 'dotenv/config';
import { Env, envSchema } from './env.schema';
import { treeifyError } from 'zod';

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', treeifyError(parsed.error));
  process.exit(1);
}

export const env: Env = parsed.data;
export default env;

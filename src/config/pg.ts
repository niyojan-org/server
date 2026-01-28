import pkg from "pg";
import env from "./env";
const { Pool } = pkg;
export const pool = new Pool({
  connectionString: env.PSQL_URI,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
});
export default pool;

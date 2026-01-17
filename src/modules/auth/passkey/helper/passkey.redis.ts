import redis from "@config/redis";

const PREFIX = "passkey:register";
const TTL = 5 * 60;

const getKey = (userId: string) => `${PREFIX}-${userId}`;

const passkeyRedis = {
  setRegistrationChallenge: async (
    userId: string,
    challenge: string,
    deviceName: string | undefined
  ) => {
    const key = getKey(userId);
    await redis.setex(key, TTL, JSON.stringify({ challenge, deviceName }));
  },
  getRegistrationChallenge: async (userId: string) => {
    const key = getKey(userId);
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  },
  clearRegistrationChallenge: async (userId: string) => {
    const key = getKey(userId);
    await redis.del(key);
  },
  setAuthenticationChallenge: async (userId: string, challenge: string) => {
    const key = getKey(userId);
    await redis.setex(key, TTL, JSON.stringify({ challenge }));
  },
  getAuthenticationChallenge: async (userId: string) => {
    const key = getKey(userId);
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  },
  clearAuthenticationChallenge: async (userId: string) => {
    const key = getKey(userId);
    await redis.del(key);
  },
};

export default passkeyRedis;

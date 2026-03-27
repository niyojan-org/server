import redis from "@config/redis";

const PREFIX = "passkey:register";
const TTL = 5 * 60;

const getKey = (email: string) => `${PREFIX}-${email}`;

const passkeyRedis = {
  setRegistrationChallenge: async (
    email: string,
    challenge: string,
    deviceName: string | undefined,
  ) => {
    const key = getKey(email);
    await redis.setex(key, TTL, JSON.stringify({ challenge, deviceName }));
  },
  getRegistrationChallenge: async (email: string) => {
    const key = getKey(email);
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  },
  clearRegistrationChallenge: async (email: string) => {
    const key = getKey(email);
    await redis.del(key);
  },
  setAuthenticationChallenge: async (email: string, challenge: string) => {
    const key = getKey(email);
    await redis.setex(key, TTL, JSON.stringify({ challenge }));
  },
  getAuthenticationChallenge: async (email: string) => {
    const key = getKey(email);
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  },
  clearAuthenticationChallenge: async (email: string) => {
    const key = getKey(email);
    await redis.del(key);
  },
};

export default passkeyRedis;

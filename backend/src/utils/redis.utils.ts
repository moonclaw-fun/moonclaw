import Redis from 'ioredis';
import { RedisKey } from './RedisKey';

export namespace RedisLock {
  export const setLock = async (
    redis: Redis,
    name: string,
    limit: number = 10,
  ) => {
    const key = `${RedisKey.flag}:${name}`;
    const result = await redis.set(key, '1', 'NX');
    if (result) {
      await redis.expire(key, limit);
    }
    return result;
  };

  export const releaseLock = async (redis: Redis, name: string) => {
    const key = `${RedisKey.flag}:${name}`;
    await redis.del(key);
  };
}

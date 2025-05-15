import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

type RedisKeyMap = {
  blacklist: true;
};

type RedisKeyPrefix = keyof RedisKeyMap;

class RedisService {
  #client: Redis;

  constructor() {
    this.#client = new Redis({
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    });

    this.#client.on('connect', () => logger.info('Connected to Redis'));
    this.#client.on('error', (error) => logger.error(error));
  }

  private buildKey<K extends RedisKeyPrefix>(
    keyPrefix: K,
    key: string
  ): string {
    return `${keyPrefix}:${key}`;
  }

  async get<K extends RedisKeyPrefix>(
    keyPrefix: K,
    key: string
  ): Promise<RedisKeyMap[K] | null> {
    const value = await this.#client.get(this.buildKey(keyPrefix, key));
    return value !== null ? JSON.parse(value) : null;
  }

  async set<K extends RedisKeyPrefix>(
    keyPrefix: K,
    key: string,
    value: RedisKeyMap[K],
    ttl: number = 24 * 60 * 60
  ): Promise<void> {
    await this.#client.set(
      this.buildKey(keyPrefix, key),
      JSON.stringify(value),
      'EX',
      ttl
    );
  }

  async del(keyPrefix: RedisKeyPrefix, key: string): Promise<void> {
    await this.#client.del(this.buildKey(keyPrefix, key));
  }
}

export const redis = new RedisService();

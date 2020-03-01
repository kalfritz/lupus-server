import Redis from 'ioredis';

class Cache {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      keyPrefix: 'cache:',
    });
  }

  set(key, value) {
    return this.redis.set(key, JSON.stringify(value), 'EX', 60 * 1 * 1);
  }

  async get(key) {
    const cached = await this.redis.get(key);

    return cached ? JSON.parse(cached) : null;
  }

  invalidate(key) {
    return this.redis.del(key);
  }

  async invalidatePrefix(prefix) {
    console.log(`cache:${prefix}:*`);
    const keys = await this.redis.keys(`cache:${prefix}:*`);
    console.log(keys);
    console.log('.............');
    const keysWithoutPrefix = keys.map(key => key.replace('cache:', ''));

    return keys.length > 0 && this.redis.del(keysWithoutPrefix);
  }

  async invalidateManyPosts(idsArray) {
    console.log(idsArray);
    idsArray.forEach(async id => {
      console.log(id);
      const keys = await this.redis.keys(`cache:user:${id}:posts:*`);
      console.log(keys);
      const keysWithoutPrefix = keys.map(key => key.replace('cache:', ''));
      console.log(keysWithoutPrefix);
      return keysWithoutPrefix.length > 0 && this.redis.del(keysWithoutPrefix);
    });
  }
}
export default new Cache();

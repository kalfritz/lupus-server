import Redis from 'ioredis';

class Cache {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      keyPrefix: 'io:',
    });
  }

  set(key, value) {
    return this.redis.set(key, JSON.stringify(value), 'EX', 60 * 60 * 24);
  }

  async get(key) {
    const cached = await this.redis.get(key);

    return cached ? JSON.parse(cached) : null;
  }

  async connectAnUser({ socket, user_id }) {
    const key = 'io:connected_users';
    let connectedUsers = await this.get(key);
    if (!connectedUsers) {
      connectedUsers = {};
    }
    connectedUsers[user_id] = socket.id;
    await this.set(key, connectedUsers);

    return await this.get(key);
  }

  async disconnectAnUser({ socket }) {
    const key = 'io:connected_users';
    let connectedUsers = await this.get(key);
    const userId = Object.keys(connectedUsers).find(
      socket_id => connectedUsers[socket_id] === socket.id
    );
    connectedUsers[userId] = undefined;
    await this.set(key, connectedUsers);

    return await this.get(key);
    //connectedUsers
  }

  invalidate(key) {
    return this.redis.del(key);
  }

  async invalidatePrefix(prefix) {
    const keys = await this.redis.keys(`io:${prefix}:*`);
    const keysWithoutPrefix = keys.map(key => key.replace('io:', ''));

    return this.redis.del(keysWithoutPrefix);
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

import Redis from 'ioredis';

class IoRedis {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      keyPrefix: 'io:',
    });
  }

  set(key, value) {
    return this.redis.set(key, JSON.stringify(value), 'EX', 60 * 60 * 1);
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
    try {
      // remove user from connected users
      const key = 'io:connected_users';
      const connectedUsers = await this.get(key);
      const userId = Object.keys(connectedUsers).find(
        socket_id => connectedUsers[socket_id] === socket.id
      );
      connectedUsers[userId] = undefined;
      await this.set(key, connectedUsers);

      return await this.get(key);
    } catch (err) {
      console.log(err);
    }
  }

  invalidate(key) {
    return this.redis.del(key);
  }

  async invalidatePrefix(prefix) {
    const keys = await this.redis.keys(`io:${prefix}:*`);

    const keysWithoutPrefix = keys.map(key => key.replace('io:', ''));

    return this.redis.del(keysWithoutPrefix);
  }

  async invalidateAllPostsThatAnUserIsListeningTo(userId) {
    const keys = await this.redis.keys(`io:user:${userId}:posts`);

    const keysWithoutPrefix = keys.map(key => key.replace('io:', ''));

    return this.redis.del(keysWithoutPrefix);
  }
}
export default new IoRedis();

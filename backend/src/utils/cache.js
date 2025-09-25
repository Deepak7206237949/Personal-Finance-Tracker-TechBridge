const Redis = require('ioredis');

let redis;
let redisAvailable = false;

try {
  redis = new Redis(process.env.REDIS_URL);
  redis.on('connect', () => {
    redisAvailable = true;
    console.log('Redis connected successfully');
  });
  redis.on('error', (err) => {
    redisAvailable = false;
    console.warn('Redis connection failed, caching disabled:', err.message);
  });
} catch (err) {
  console.warn('Redis initialization failed, caching disabled:', err.message);
  redisAvailable = false;
}

async function getOrSet(key, ttlSeconds, fetcher) {
  if (!redisAvailable || !redis) {
    // If Redis is not available, just fetch the data directly
    return await fetcher();
  }

  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
    const data = await fetcher();
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Redis operation failed, falling back to direct fetch:', err.message);
    return await fetcher();
  }
}

async function delKeys(pattern) {
  if (!redisAvailable || !redis) {
    return; // Skip cache invalidation if Redis is not available
  }

  try {
    // pattern example: analytics:user:1:*
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch (err) {
    console.warn('Redis cache invalidation failed:', err.message);
  }
}

module.exports = { redis, getOrSet, delKeys };

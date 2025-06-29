import { Redis } from '@upstash/redis';

// Initialize Redis - use environment variables for production
const redis = process.env.REDIS_URL ? new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
}) : null;

// Generic cache function
export async function getCachedData(key, fetchFunction, ttl = 300) {
  // If no Redis, just return the data directly
  if (!redis) {
    console.warn('Redis not configured, skipping cache');
    return await fetchFunction();
  }

  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`Cache hit for key: ${key}`);
      return cached;
    }
    
    console.log(`Cache miss for key: ${key}`);
    const data = await fetchFunction();
    await redis.set(key, data, { ex: ttl });
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to direct data fetch if Redis fails
    return await fetchFunction();
  }
}

// Batch view counting system
export async function recordView(slug) {
  if (!redis) {
    console.warn('Redis not configured, view counting disabled');
    return;
  }

  try {
    await redis.incr(`views:${slug}`);
    console.log(`View recorded for slug: ${slug}`);
  } catch (error) {
    console.error('Error recording view:', error);
  }
}

export async function getViewCount(slug) {
  if (!redis) return 0;
  
  try {
    const count = await redis.get(`views:${slug}`);
    return parseInt(count) || 0;
  } catch (error) {
    console.error('Error getting view count:', error);
    return 0;
  }
}

// Clear cached data
export async function clearCache(pattern) {
  if (!redis) return;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cleared ${keys.length} cache entries for pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
} 
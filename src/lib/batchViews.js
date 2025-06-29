import { Redis } from '@upstash/redis';
import prisma from '@/utils/connect';

const redis = process.env.REDIS_URL ? new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
}) : null;

// Batch update views every 30 seconds
export async function batchUpdateViews() {
  if (!redis) {
    console.warn('Redis not configured, batch updates disabled');
    return;
  }

  try {
    // Get all view keys from Redis
    const viewKeys = await redis.keys('views:*');
    
    if (viewKeys.length === 0) {
      console.log('No views to batch update');
      return;
    }

    console.log(`Batch updating ${viewKeys.length} post views`);

    // Get all view counts
    const viewCounts = await Promise.all(
      viewKeys.map(async (key) => {
        const count = await redis.get(key);
        const slug = key.replace('views:', '');
        return { slug, count: parseInt(count) || 0 };
      })
    );

    // Filter out zero counts
    const validViews = viewCounts.filter(v => v.count > 0);

    if (validViews.length === 0) {
      console.log('No valid views to update');
      return;
    }

    // Update database in batches
    const updatePromises = validViews.map(({ slug, count }) =>
      prisma.post.update({
        where: { slug },
        data: { views: { increment: count } }
      }).catch(error => {
        console.error(`Failed to update views for ${slug}:`, error);
      })
    );

    await Promise.allSettled(updatePromises);

    // Clear the Redis counters after successful update
    await redis.del(...viewKeys);

    console.log(`Successfully batch updated ${validViews.length} post views`);
  } catch (error) {
    console.error('Batch update views error:', error);
  }
}

// Initialize batch processing (call this in your main app)
export function startBatchProcessor() {
  console.log('Starting view batch processor...');
  
  // Run immediately on start
  batchUpdateViews();
  
  // Then run every 30 seconds
  setInterval(batchUpdateViews, 30000);
}

// Manual trigger for testing
export async function triggerBatchUpdate() {
  console.log('Manually triggering batch update...');
  await batchUpdateViews();
} 
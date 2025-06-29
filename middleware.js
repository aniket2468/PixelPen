import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Create rate limiter only if Redis is configured
const ratelimit = process.env.REDIS_URL ? new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour per IP
  analytics: true,
}) : null;

// More generous rate limit for authenticated users
const authRatelimit = process.env.REDIS_URL ? new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(200, '1 h'), // 200 requests per hour for auth users
  analytics: true,
}) : null;

export default async function middleware(request) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Skip rate limiting if Redis is not configured
    if (!ratelimit) {
      console.warn('Rate limiting disabled - Redis not configured');
      return NextResponse.next();
    }

    try {
      // Get user IP for rate limiting
      const ip = request.ip ?? 
        request.headers.get('x-forwarded-for')?.split(',')[0] ?? 
        request.headers.get('x-real-ip') ?? 
        'anonymous';

      // Check if user is authenticated (simple check for auth header)
      const isAuthenticated = request.headers.get('authorization') || 
                            request.cookies.get('next-auth.session-token') ||
                            request.cookies.get('__Secure-next-auth.session-token');

      // Use different rate limits for authenticated vs anonymous users
      const rateLimiter = isAuthenticated ? authRatelimit : ratelimit;
      
      const { success, limit, reset, remaining } = await rateLimiter.limit(ip);

      if (!success) {
        console.log(`Rate limit exceeded for IP: ${ip}`);
        
        return new Response(
          JSON.stringify({ 
            message: 'Rate limit exceeded. Please try again later.',
            error: 'RATE_LIMIT_EXCEEDED'
          }), 
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': new Date(reset).toISOString(),
              'Retry-After': Math.round((reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());

      return response;

    } catch (error) {
      console.error('Rate limiting error:', error);
      // If rate limiting fails, allow the request to proceed
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 
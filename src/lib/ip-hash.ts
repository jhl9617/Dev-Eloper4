import { createHmac } from 'crypto';

/**
 * Hash IP address for privacy protection while maintaining uniqueness for functionality
 * Uses HMAC-SHA256 with a server-side secret to prevent rainbow table attacks
 */
export function hashIpAddress(ipAddress: string): string {
  const secret = process.env.IP_HASH_SECRET;
  
  if (!secret) {
    throw new Error(
      'IP_HASH_SECRET environment variable is required for security. ' +
      'Please set a strong random string in your .env.local file.'
    );
  }
  
  return createHmac('sha256', secret)
    .update(ipAddress)
    .digest('hex');
}

/**
 * Extract IP address from request headers
 */
export function getClientIpAddress(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  
  return forwarded?.split(',')[0] || realIp || '127.0.0.1';
}
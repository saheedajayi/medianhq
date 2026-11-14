import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Signs unsubscribe links so they work without signing in, and only for the
 * account they were sent to. EMAIL_LINK_SECRET is preferred; the Resend key
 * is the fallback so links work before it's set. Changing the secret breaks
 * links in emails already sent.
 */
function secret() {
  return process.env.EMAIL_LINK_SECRET || process.env.RESEND_API_KEY || '';
}

export function signUnsubscribeToken(userId: string) {
  const key = secret();
  if (!key) return null;
  return createHmac('sha256', key)
    .update(`unsubscribe:${userId}`)
    .digest('base64url');
}

export function isValidUnsubscribeToken(userId: string, token: string) {
  const expected = signUnsubscribeToken(userId);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

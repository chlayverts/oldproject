export type LimitResult = { success: boolean; reason?: string };
export type Limiter = { limit(identifier: string): Promise<LimitResult> };

export type TutorLimitStatus = 'allowed' | 'limited' | 'unavailable';

export async function checkTutorRateLimit(
  userId: string,
  perMinute: Limiter,
  perDay: Limiter,
): Promise<TutorLimitStatus> {
  try {
    const [minuteLimit, dailyLimit] = await Promise.all([
      perMinute.limit(userId),
      perDay.limit(userId),
    ]);
    if (minuteLimit.reason === 'timeout' || dailyLimit.reason === 'timeout') return 'unavailable';
    return minuteLimit.success && dailyLimit.success ? 'allowed' : 'limited';
  } catch {
    return 'unavailable';
  }
}

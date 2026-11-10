import { checkTutorRateLimit, type Limiter } from './rateLimit.ts';

const limiter = (result: { success: boolean; reason?: string }): Limiter => ({
  limit: async () => result,
});

Deno.test('allows requests only when both shared limits pass', async () => {
  const result = await checkTutorRateLimit('user-1', limiter({ success: true }), limiter({ success: true }));
  if (result !== 'allowed') throw new Error(`Expected allowed, received ${result}`);
});

Deno.test('blocks requests when either shared limit is exhausted', async () => {
  const result = await checkTutorRateLimit('user-1', limiter({ success: true }), limiter({ success: false }));
  if (result !== 'limited') throw new Error(`Expected limited, received ${result}`);
});

Deno.test('fails closed when the shared rate-limit service times out', async () => {
  const result = await checkTutorRateLimit('user-1', limiter({ success: true }), limiter({ success: true, reason: 'timeout' }));
  if (result !== 'unavailable') throw new Error(`Expected unavailable, received ${result}`);
});

Deno.test('fails closed when Redis throws an error', async () => {
  const unavailable: Limiter = { limit: async () => { throw new Error('Redis is unavailable'); } };
  const result = await checkTutorRateLimit('user-1', unavailable, limiter({ success: true }));
  if (result !== 'unavailable') throw new Error(`Expected unavailable, received ${result}`);
});

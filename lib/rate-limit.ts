// ponytail: in-memory sliding window rate limiter; swap for Redis (@upstash/ratelimit) if scaling to multi-region serverless clusters
type RateLimitOptions = {
  windowMs: number
  max: number
}

const trackers = new Map<string, number[]>()

export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): { success: boolean; resetInSeconds: number } {
  const now = Date.now()
  const timestamps = (trackers.get(key) ?? []).filter((ts) => now - ts < options.windowMs)

  if (timestamps.length >= options.max) {
    const oldest = timestamps[0]
    const resetInSeconds = Math.ceil((oldest + options.windowMs - now) / 1000)
    return { success: false, resetInSeconds: Math.max(1, resetInSeconds) }
  }

  timestamps.push(now)
  trackers.set(key, timestamps)

  // Periodic memory cleanup if tracker map exceeds 2,000 entries
  if (trackers.size > 2000) {
    for (const [k, tsList] of trackers.entries()) {
      const valid = tsList.filter((ts) => now - ts < options.windowMs)
      if (valid.length === 0) trackers.delete(k)
      else trackers.set(k, valid)
    }
  }

  return { success: true, resetInSeconds: 0 }
}

const cache = new Map();

/**
 * Wraps a data fetching promise with in-memory caching.
 * @param {string} key - Cache key.
 * @param {Function} fetcher - Async function returning data to cache.
 * @param {number} ttlMs - Time-to-live in milliseconds (default: 12 hours).
 */
export async function withCache(key, fetcher, ttlMs = 12 * 60 * 60 * 1000) {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now < cached.expiry) {
    return cached.value;
  }

  const value = await fetcher();

  // Only cache if the data is valid/non-empty
  if (value && !value.error) {
    cache.set(key, {
      value,
      expiry: now + ttlMs,
    });
  }

  return value;
}

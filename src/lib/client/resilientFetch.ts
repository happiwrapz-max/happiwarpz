/**
 * Resilient fetch utility with exponential backoff, jitter, and automatic network retry
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 2,
  baseDelayMs = 400
): Promise<Response> {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, options);

      // If server returned 502/503/504 transient error, retry
      if ([502, 503, 504].includes(response.status) && attempt < maxRetries) {
        attempt++;
        const jitter = Math.random() * 200;
        const delay = baseDelayMs * Math.pow(2, attempt - 1) + jitter;
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }

      return response;
    } catch (networkError: any) {
      if (attempt >= maxRetries) {
        throw networkError;
      }
      attempt++;
      const jitter = Math.random() * 200;
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + jitter;
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw new Error(`Failed to fetch ${url} after ${maxRetries} retries.`);
}


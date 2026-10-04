const lastRequestTimeByHost = new Map<string, number>();

export async function rateLimit(host: string, minIntervalMs = 3000): Promise<void> {
  const now = Date.now();
  const lastTime = lastRequestTimeByHost.get(host) || 0;
  const elapsed = now - lastTime;
  if (elapsed < minIntervalMs) {
    const delay = minIntervalMs - elapsed;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  lastRequestTimeByHost.set(host, Date.now());
}

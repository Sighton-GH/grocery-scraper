import { rateLimit } from './rateLimiter';

interface RobotsRules {
  disallowedPaths: string[];
  fetchedAt: number;
}

const robotsCache = new Map<string, RobotsRules>();

export async function isPathAllowed(urlStr: string, userAgent = '*'): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.host;
    const origin = parsed.origin;
    const pathname = parsed.pathname;

    let rules = robotsCache.get(host);
    if (!rules || Date.now() - rules.fetchedAt > 24 * 60 * 60 * 1000) {
      const robotsUrl = `${origin}/robots.txt`;
      await rateLimit(host, 1500);

      try {
        const res = await fetch(robotsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SightonGroceryBot/1.0)',
          },
        });

        if (res.ok) {
          const txt = await res.text();
          const lines = txt.split('\n');
          const disallowed: string[] = [];
          let currentAgentApplies = false;

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (line.startsWith('#') || !line) continue;

            const [directive, ...rest] = line.split(':');
            const d = directive.trim().toLowerCase();
            const val = rest.join(':').trim();

            if (d === 'user-agent') {
              currentAgentApplies = val === '*' || val.toLowerCase().includes('bot');
            } else if (d === 'disallow' && currentAgentApplies) {
              if (val) disallowed.push(val);
            }
          }

          rules = { disallowedPaths: disallowed, fetchedAt: Date.now() };
          robotsCache.set(host, rules);
        } else {
          // If robots.txt returns 404 or 403, standard convention allows crawling public paths
          rules = { disallowedPaths: [], fetchedAt: Date.now() };
          robotsCache.set(host, rules);
        }
      } catch (err: any) {
        rules = { disallowedPaths: [], fetchedAt: Date.now() };
        robotsCache.set(host, rules);
      }
    }

    if (rules) {
      for (const disallowed of rules.disallowedPaths) {
        if (disallowed === '/') {
          return { allowed: false, reason: `robots.txt disallows all paths ('/') for host ${host}` };
        }
        if (pathname.startsWith(disallowed)) {
          return { allowed: false, reason: `robots.txt disallows path '${disallowed}'` };
        }
      }
    }

    return { allowed: true };
  } catch (err: any) {
    return { allowed: true };
  }
}

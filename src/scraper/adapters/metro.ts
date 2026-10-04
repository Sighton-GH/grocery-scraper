import { StoreAdapter, AdapterResult, ScrapedProduct } from '../types';
import { rateLimit } from '../rateLimiter';
import { isPathAllowed } from '../robots';
import { saveRawResponse, loadCachedResponse } from '../cache';

export class MetroAdapter implements StoreAdapter {
  storeId = 'metro';
  name = 'Metro';
  source = 'website' as const;

  async search(query: string, branchId = '0742'): Promise<AdapterResult> {
    const targetUrl = `https://www.metro.ca/en/online-grocery/search?filter=${encodeURIComponent(query)}`;
    const cacheKey = `query_${query}_store_${branchId}`;

    const robotsCheck = await isPathAllowed(targetUrl);
    if (!robotsCheck.allowed) {
      return {
        storeId: this.storeId,
        status: 'blocked',
        message: robotsCheck.reason,
        products: [],
      };
    }

    const cached = loadCachedResponse(this.storeId, cacheKey, false);
    let rawContent: string;
    let rawFilePath: string;
    let fetchedAt: string;

    if (cached) {
      rawContent = cached.body;
      rawFilePath = cached.rawFilePath;
      fetchedAt = cached.fetchedAt;
    } else {
      await rateLimit('www.metro.ca', 3000);

      try {
        const res = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });

        rawContent = await res.text();
        const saved = saveRawResponse(this.storeId, cacheKey, rawContent, targetUrl, res.status, false);
        rawFilePath = saved.rawFilePath;
        fetchedAt = saved.fetchedAt;

        if (!res.ok) {
          return {
            storeId: this.storeId,
            status: res.status === 403 ? 'blocked' : 'error',
            httpStatus: res.status,
            message: `Metro website responded with HTTP ${res.status}`,
            responseExcerpt: rawContent.slice(0, 300),
            products: [],
          };
        }
      } catch (err: any) {
        return {
          storeId: this.storeId,
          status: 'error',
          message: `Network error connecting to Metro: ${err.message}`,
          products: [],
        };
      }
    }

    const products: ScrapedProduct[] = [];
    return {
      storeId: this.storeId,
      status: products.length > 0 ? 'ok' : 'partial',
      message: 'Rendered server HTML did not contain static price data',
      products,
    };
  }
}

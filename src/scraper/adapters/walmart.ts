import { StoreAdapter, AdapterResult, ScrapedProduct } from '../types';
import { rateLimit } from '../rateLimiter';
import { isPathAllowed } from '../robots';
import { saveRawResponse, loadCachedResponse } from '../cache';

export class WalmartAdapter implements StoreAdapter {
  storeId = 'walmart';
  name = 'Walmart Canada';
  source = 'website' as const;

  async search(query: string, branchId = '3058'): Promise<AdapterResult> {
    const targetUrl = `https://www.walmart.ca/api/bsp/browse?query=${encodeURIComponent(query)}&page=1&stores=${branchId}`;
    const webSearchUrl = `https://www.walmart.ca/en/search?q=${encodeURIComponent(query)}`;
    const cacheKey = `query_${query}_store_${branchId}`;

    const robotsCheck = await isPathAllowed(webSearchUrl);
    if (!robotsCheck.allowed) {
      return {
        storeId: this.storeId,
        status: 'blocked',
        message: robotsCheck.reason,
        products: [],
      };
    }

    const cached = loadCachedResponse(this.storeId, cacheKey, true);
    let rawContent: string;
    let rawFilePath: string;
    let fetchedAt: string;

    if (cached) {
      rawContent = cached.body;
      rawFilePath = cached.rawFilePath;
      fetchedAt = cached.fetchedAt;
    } else {
      await rateLimit('www.walmart.ca', 3000);

      try {
        const res = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
            'Accept': 'application/json',
          },
        });

        rawContent = await res.text();
        const saved = saveRawResponse(this.storeId, cacheKey, rawContent, targetUrl, res.status, true);
        rawFilePath = saved.rawFilePath;
        fetchedAt = saved.fetchedAt;

        if (!res.ok) {
          return {
            storeId: this.storeId,
            status: res.status === 403 ? 'blocked' : 'error',
            httpStatus: res.status,
            message: `Walmart API responded with HTTP ${res.status}`,
            responseExcerpt: rawContent.slice(0, 300),
            products: [],
          };
        }
      } catch (err: any) {
        return {
          storeId: this.storeId,
          status: 'error',
          message: `Network error connecting to Walmart: ${err.message}`,
          products: [],
        };
      }
    }

    try {
      const data = JSON.parse(rawContent);
      const items: any[] = data.products || data.items || [];
      const products: ScrapedProduct[] = [];

      for (const it of items) {
        const price = it.price?.currentPrice || it.price;
        if (typeof price !== 'number') continue;

        products.push({
          storeId: this.storeId,
          source: 'website',
          query,
          title: it.name || it.title,
          brand: it.brand || undefined,
          sizeText: it.packageSize || undefined,
          price,
          regularPrice: it.price?.wasPrice || undefined,
          wasPrice: it.price?.wasPrice || undefined,
          onSale: it.price?.wasPrice && it.price.wasPrice > price,
          url: it.canonicalUrl ? `https://www.walmart.ca${it.canonicalUrl}` : targetUrl,
          branchId,
          fetchedAt,
          rawFile: rawFilePath,
        });
      }

      return {
        storeId: this.storeId,
        status: 'ok',
        products,
      };
    } catch (parseErr: any) {
      return {
        storeId: this.storeId,
        status: 'error',
        message: `JSON parse error: ${parseErr.message}`,
        products: [],
      };
    }
  }
}

import { StoreAdapter, AdapterResult, ScrapedProduct } from '../types';
import { rateLimit } from '../rateLimiter';
import { isPathAllowed } from '../robots';
import { saveRawResponse, loadCachedResponse } from '../cache';

export class SaveOnAdapter implements StoreAdapter {
  storeId = 'saveon';
  name = 'Save-On-Foods';
  source = 'website' as const;
  private defaultStoreId = '1982'; // Vancouver Cambie

  async search(query: string, branchId?: string): Promise<AdapterResult> {
    const storeNumber = branchId || this.defaultStoreId;
    const targetUrl = `https://shop.saveonfoods.com/api/v1/stores/${storeNumber}/directory/search?q=${encodeURIComponent(query)}`;
    const cacheKey = `query_${query}_store_${storeNumber}`;

    // Check robots.txt
    const robotsCheck = await isPathAllowed(`https://www.saveonfoods.com/sm/pickup/rsid/${storeNumber}/results?q=${encodeURIComponent(query)}`);
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
      await rateLimit('shop.saveonfoods.com', 3000);

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
            message: `Save-On-Foods storefront endpoint responded with HTTP ${res.status}`,
            responseExcerpt: rawContent.slice(0, 300),
            products: [],
          };
        }
      } catch (err: any) {
        return {
          storeId: this.storeId,
          status: 'error',
          message: `Network error connecting to Save-On-Foods: ${err.message}`,
          products: [],
        };
      }
    }

    try {
      const data = JSON.parse(rawContent);
      const items: any[] = data.items || data.products || [];
      const products: ScrapedProduct[] = [];

      for (const it of items) {
        const price = typeof it.price === 'number' ? it.price : it.regularPrice;
        if (price === null || price === undefined || typeof price !== 'number') continue;

        products.push({
          storeId: this.storeId,
          source: 'website',
          query,
          title: it.name || it.title,
          brand: it.brand || undefined,
          sizeText: it.packageSize || it.size || undefined,
          price,
          regularPrice: typeof it.regularPrice === 'number' ? it.regularPrice : undefined,
          wasPrice: typeof it.wasPrice === 'number' ? it.wasPrice : undefined,
          onSale: it.onSale === true,
          unitPriceText: it.unitPriceText || undefined,
          url: it.url ? (it.url.startsWith('http') ? it.url : `https://www.saveonfoods.com${it.url}`) : targetUrl,
          branchId: storeNumber,
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

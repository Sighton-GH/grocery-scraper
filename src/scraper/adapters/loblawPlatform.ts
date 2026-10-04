import { StoreAdapter, AdapterResult, ScrapedProduct } from '../types';
import { rateLimit } from '../rateLimiter';
import { isPathAllowed } from '../robots';
import { saveRawResponse, loadCachedResponse } from '../cache';

export class LoblawPlatformAdapter implements StoreAdapter {
  storeId: string;
  name: string;
  source = 'website' as const;
  private domain: string;
  private banner: string;
  private defaultStoreId: string;

  constructor(storeId: 'loblaws' | 'nofrills' | 'superstore', defaultStoreId = '1000') {
    this.storeId = storeId;
    if (storeId === 'loblaws') {
      this.name = 'Loblaws';
      this.domain = 'www.loblaws.ca';
      this.banner = 'loblaw';
    } else if (storeId === 'nofrills') {
      this.name = 'No Frills';
      this.domain = 'www.nofrills.ca';
      this.banner = 'nofrills';
    } else {
      this.name = 'Real Canadian Superstore';
      this.domain = 'www.realcanadiansuperstore.ca';
      this.banner = 'superstore';
    }
    this.defaultStoreId = defaultStoreId;
  }

  async search(query: string, branchId?: string): Promise<AdapterResult> {
    const storeIdParam = branchId || this.defaultStoreId;
    const targetUrl = `https://api.pcexpress.ca/product-facade/v3/products/search`;
    const webUrl = `https://${this.domain}/en/search?search-bar=${encodeURIComponent(query)}`;
    const cacheKey = `query_${query}_store_${storeIdParam}`;

    // Check robots.txt first
    const robotsCheck = await isPathAllowed(webUrl);
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
    let httpStatus = 200;

    if (cached) {
      rawContent = cached.body;
      rawFilePath = cached.rawFilePath;
      fetchedAt = cached.fetchedAt;
    } else {
      await rateLimit(this.domain, 3000);

      const payload = {
        pagination: { from: 0, size: 24 },
        sort: {},
        filter: {},
        fields: {},
        searchTerm: query,
        storeId: storeIdParam,
      };

      try {
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-apikey': 'C1xujSegT5j3ap3yPlHG6xDpaCzRlqmX',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          },
          body: JSON.stringify(payload),
        });

        httpStatus = res.status;
        rawContent = await res.text();
        const saved = saveRawResponse(this.storeId, cacheKey, rawContent, targetUrl, res.status, true);
        rawFilePath = saved.rawFilePath;
        fetchedAt = saved.fetchedAt;

        if (!res.ok) {
          return {
            storeId: this.storeId,
            status: res.status === 403 ? 'blocked' : 'error',
            httpStatus: res.status,
            message: `Official store API returned HTTP ${res.status}`,
            responseExcerpt: rawContent.slice(0, 300),
            products: [],
          };
        }
      } catch (err: any) {
        return {
          storeId: this.storeId,
          status: 'error',
          message: `Network error connecting to ${this.name}: ${err.message}`,
          products: [],
        };
      }
    }

    try {
      const data = JSON.parse(rawContent);
      const results: any[] = data.results || [];
      const products: ScrapedProduct[] = [];

      for (const item of results) {
        const prices = item.prices || {};
        const priceObj = prices.price;
        const currentPrice = priceObj?.value;

        if (currentPrice === null || currentPrice === undefined || typeof currentPrice !== 'number') {
          continue;
        }

        const wasPriceObj = prices.wasPrice;
        const wasPrice = typeof wasPriceObj?.value === 'number' ? wasPriceObj.value : undefined;
        const regularPrice = typeof prices.regularPrice?.value === 'number' ? prices.regularPrice.value : wasPrice;
        const onSale = wasPrice && wasPrice > currentPrice ? true : undefined;

        const packageSize = item.packageSize || undefined;
        const brand = item.brand || undefined;
        const code = item.code || '';
        const link = item.link || (code ? `/en/p/${code}` : '');
        const productUrl = link.startsWith('http') ? link : `https://${this.domain}${link}`;

        products.push({
          storeId: this.storeId,
          source: 'website',
          query,
          title: item.name,
          brand,
          sizeText: packageSize,
          price: currentPrice,
          regularPrice,
          wasPrice,
          onSale,
          unitPriceText: prices.unitPrice ? `${prices.unitPrice.value}/${prices.unitPrice.unit}` : undefined,
          url: productUrl,
          branchId: storeIdParam,
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
        message: `Failed to parse response: ${parseErr.message}`,
        products: [],
      };
    }
  }
}

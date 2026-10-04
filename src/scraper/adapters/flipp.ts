import { StoreAdapter, AdapterResult, ScrapedProduct } from '../types';
import { rateLimit } from '../rateLimiter';
import { saveRawResponse, loadCachedResponse } from '../cache';

const FLIPP_MERCHANT_MAP: Record<string, string> = {
  'Walmart': 'walmart',
  'Walmart Canada': 'walmart',
  'No Frills': 'nofrills',
  'Loblaws': 'loblaws',
  'Real Canadian Superstore': 'superstore',
  'Save-On-Foods': 'saveon',
  'T&T Supermarket': 'tnt',
  'T&T': 'tnt',
  'Metro': 'metro',
  'Food Basics': 'foodbasics',
  'Sobeys': 'sobeys',
  'FreshCo': 'freshco',
  'Costco': 'costco',
  'Costco Wholesale': 'costco',
};

export class FlippAdapter implements StoreAdapter {
  storeId = 'flipp';
  name = 'Flipp Circulars';
  source = 'flipp' as const;

  async search(query: string, postalCode = 'M5V2T6'): Promise<AdapterResult> {
    const targetUrl = `https://backflipp.wishabi.com/flipp/items/search?q=${encodeURIComponent(query)}&postal_code=${encodeURIComponent(postalCode)}`;
    const cacheKey = `query_${query}_${postalCode}`;

    // Check same-day cache first
    const cached = loadCachedResponse(this.storeId, cacheKey, true);
    let rawContent: string;
    let rawFilePath: string;
    let fetchedAt: string;

    if (cached) {
      rawContent = cached.body;
      rawFilePath = cached.rawFilePath;
      fetchedAt = cached.fetchedAt;
    } else {
      await rateLimit('backflipp.wishabi.com', 3000);

      try {
        const res = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
            'Accept': 'application/json',
          },
        });

        if (!res.ok) {
          const errText = await res.text();
          return {
            storeId: this.storeId,
            status: res.status === 403 ? 'blocked' : 'error',
            httpStatus: res.status,
            message: `Flipp API responded with status ${res.status}`,
            responseExcerpt: errText.slice(0, 300),
            products: [],
          };
        }

        rawContent = await res.text();
        const saved = saveRawResponse(this.storeId, cacheKey, rawContent, targetUrl, res.status, true);
        rawFilePath = saved.rawFilePath;
        fetchedAt = saved.fetchedAt;
      } catch (err: any) {
        return {
          storeId: this.storeId,
          status: 'error',
          message: `Network error connecting to Flipp: ${err.message}`,
          products: [],
        };
      }
    }

    try {
      const data = JSON.parse(rawContent);
      const items: any[] = data.items || [];
      const products: ScrapedProduct[] = [];

      for (const it of items) {
        const merchant = it.merchant_name;
        const mappedStoreId = FLIPP_MERCHANT_MAP[merchant];
        if (!mappedStoreId) continue; // Drop unmapped merchants

        const price = it.current_price;
        if (price === null || price === undefined || typeof price !== 'number' || isNaN(price)) {
          continue; // Hard rule: If current_price is null, drop the row
        }

        const title = it.name;
        if (!title || typeof title !== 'string') continue;

        const originalPrice = typeof it.original_price === 'number' ? it.original_price : undefined;
        const saleStory = it.sale_story || undefined;
        const prePrice = it.pre_price_text || '';
        const postPrice = it.post_price_text || '';
        const unitText = (prePrice || postPrice) ? `${prePrice} ${postPrice}`.trim() : undefined;

        let onSale: boolean | undefined = undefined;
        if (originalPrice && originalPrice > price) {
          onSale = true;
        } else if (saleStory && (saleStory.toLowerCase().includes('save') || saleStory.toLowerCase().includes('off'))) {
          onSale = true;
        }

        let multiBuyText: string | undefined = undefined;
        if (saleStory && /\b\d+\s+for\s+\$?\d+/i.test(saleStory)) {
          multiBuyText = saleStory;
        }

        const itemUrl = it.clean_image_url || it.flyer_item_url || `https://flipp.com/en-ca/flyer_item/${it.id}`;

        const product: ScrapedProduct = {
          storeId: mappedStoreId,
          source: 'flipp',
          query,
          title,
          brand: it.merchant_name,
          price,
          regularPrice: originalPrice,
          wasPrice: originalPrice,
          multiBuyText,
          onSale,
          unitPriceText: unitText,
          url: itemUrl,
          branchId: postalCode,
          fetchedAt,
          rawFile: rawFilePath,
        };

        products.push(product);
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
        message: `Failed to parse JSON response: ${parseErr.message}`,
        products: [],
      };
    }
  }
}

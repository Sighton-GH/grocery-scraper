import * as fs from 'fs';
import * as path from 'path';
import { ScrapedProduct, StoreAdapter, AdapterResult } from '../src/scraper/types';
import { SaveOnAdapter } from '../src/scraper/adapters/saveon';
import { LoblawPlatformAdapter } from '../src/scraper/adapters/loblawPlatform';
import { WalmartAdapter } from '../src/scraper/adapters/walmart';
import { TNTAdapter } from '../src/scraper/adapters/tnt';
import { MetroAdapter } from '../src/scraper/adapters/metro';
import { FlippAdapter } from '../src/scraper/adapters/flipp';
import { getTodayDateString } from '../src/scraper/cache';

async function main() {
  console.log('=== Canadian Grocery Scraper Runner ===\n');

  // Read queries from queries.json
  const queriesFile = path.resolve(process.cwd(), 'queries.json');
  if (!fs.existsSync(queriesFile)) {
    console.error('Error: queries.json not found.');
    process.exit(1);
  }
  const queries: string[] = JSON.parse(fs.readFileSync(queriesFile, 'utf-8'));
  console.log(`Loaded ${queries.length} queries:`, queries);

  const adapters: StoreAdapter[] = [
    new SaveOnAdapter(),
    new LoblawPlatformAdapter('nofrills', '3133'),
    new WalmartAdapter(),
    new TNTAdapter(),
    new LoblawPlatformAdapter('loblaws', '1006'),
    new MetroAdapter(),
    new FlippAdapter(),
  ];

  const allScrapedProducts: ScrapedProduct[] = [];
  const storeReports: Record<string, { status: string; rows: number; queriesMatched: number; endpoint: string }> = {};

  for (const adapter of adapters) {
    console.log(`\n--- Running adapter: ${adapter.name} (${adapter.storeId}) [${adapter.source}] ---`);
    let adapterMatchedQueries = 0;
    let adapterRows = 0;
    let finalStatus: 'works' | 'partial' | 'blocked' | 'error' = 'works';

    for (const query of queries) {
      console.log(`Querying: "${query}"...`);
      try {
        const res: AdapterResult = await adapter.search(query);
        if (res.status === 'blocked') {
          finalStatus = 'blocked';
          console.log(`  -> Status: BLOCKED (${res.httpStatus || 403})`);
          if (res.responseExcerpt) {
            console.log(`  -> Excerpt: ${res.responseExcerpt.slice(0, 120)}...`);
          }
          break; // Stop further requests to blocked store per rule 3
        } else if (res.status === 'error') {
          finalStatus = 'error';
          console.log(`  -> Status: ERROR (${res.message})`);
        } else {
          console.log(`  -> Found ${res.products.length} products`);
          if (res.products.length > 0) {
            adapterMatchedQueries++;
            adapterRows += res.products.length;
            allScrapedProducts.push(...res.products);
          }
        }
      } catch (err: any) {
        finalStatus = 'error';
        console.error(`  -> Unhandled error for ${adapter.storeId}: ${err.message}`);
      }
    }

    if (finalStatus === 'works' && adapterRows === 0) {
      finalStatus = 'partial';
    }

    storeReports[adapter.storeId] = {
      status: finalStatus,
      rows: adapterRows,
      queriesMatched: adapterMatchedQueries,
      endpoint: adapter.source === 'flipp' ? 'https://backflipp.wishabi.com/flipp/items/search' : `Direct ${adapter.name} storefront API`,
    };
  }

  // Write output to data/scraped/<YYYY-MM-DD>.json
  const todayStr = getTodayDateString();
  const scrapedDir = path.resolve(process.cwd(), 'data', 'scraped');
  if (!fs.existsSync(scrapedDir)) {
    fs.mkdirSync(scrapedDir, { recursive: true });
  }

  const outFilePath = path.join(scrapedDir, `${todayStr}.json`);
  fs.writeFileSync(outFilePath, JSON.stringify(allScrapedProducts, null, 2), 'utf-8');
  console.log(`\n========================================`);
  console.log(`Wrote ${allScrapedProducts.length} total scraped products to: ${outFilePath}`);
  console.log(`========================================\n`);

  console.log('Adapter Run Summary:');
  console.table(storeReports);
}

main().catch(err => {
  console.error('Fatal scrape runner error:', err);
  process.exit(1);
});

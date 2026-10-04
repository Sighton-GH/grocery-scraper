export interface ScrapedProduct {
  storeId: string;
  source: 'website' | 'flipp';
  query: string;
  title: string;
  brand?: string;
  sizeText?: string;
  price: number;
  regularPrice?: number;
  wasPrice?: number;
  multiBuyText?: string;
  onSale?: boolean;
  unitPriceText?: string;
  url: string;
  branchId?: string;
  fetchedAt: string;
  rawFile: string;
}

export interface AdapterResult {
  storeId: string;
  status: 'ok' | 'partial' | 'blocked' | 'error';
  message?: string;
  httpStatus?: number;
  responseExcerpt?: string;
  products: ScrapedProduct[];
}

export interface StoreAdapter {
  storeId: string;
  name: string;
  source: 'website' | 'flipp';
  search(query: string, branchId?: string): Promise<AdapterResult>;
}

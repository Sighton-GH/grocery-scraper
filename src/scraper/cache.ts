import * as fs from 'fs';
import * as path from 'path';

export interface CachedResponse {
  rawFilePath: string;
  body: string;
  isJson: boolean;
  fetchedAt: string;
  url: string;
  status: number;
}

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

export function getRawStorageDir(storeId: string, dateStr = getTodayDateString()): string {
  const dir = path.resolve(process.cwd(), 'data', 'raw', storeId, dateStr);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function saveRawResponse(
  storeId: string,
  key: string,
  content: string,
  url: string,
  status: number,
  isJson: boolean,
  dateStr = getTodayDateString()
): CachedResponse {
  const dir = getRawStorageDir(storeId, dateStr);
  const ext = isJson ? '.json' : '.html';
  const filename = `${sanitizeKey(key)}${ext}`;
  const filePath = path.join(dir, filename);
  const relativePath = path.relative(process.cwd(), filePath);

  fs.writeFileSync(filePath, content, 'utf-8');

  return {
    rawFilePath: relativePath,
    body: content,
    isJson,
    fetchedAt: new Date().toISOString(),
    url,
    status,
  };
}

export function loadCachedResponse(
  storeId: string,
  key: string,
  isJson: boolean,
  dateStr = getTodayDateString()
): CachedResponse | null {
  const dir = getRawStorageDir(storeId, dateStr);
  const ext = isJson ? '.json' : '.html';
  const filename = `${sanitizeKey(key)}${ext}`;
  const filePath = path.join(dir, filename);

  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);
    return {
      rawFilePath: relativePath,
      body: content,
      isJson,
      fetchedAt: stats.mtime.toISOString(),
      url: '',
      status: 200,
    };
  }

  return null;
}

import { sleep } from './timeHelper';

export const promiseLimit = async <T>(
  promises: Promise<T>[],
  limit: number = 20,
): Promise<T[]> => {
  const results: T[] = [];
  let index = 0;

  const processBatch = async () => {
    const currentBatch = promises.slice(index, index + limit);
    index += limit;

    const batchResults = await Promise.all(currentBatch);
    results.push(...batchResults);
  };

  while (index < promises.length) {
    await processBatch();
  }

  return results;
};

export const promiseLimitVer2 = async <T>(
  promiseFactory: (() => Promise<T>)[],
  limit: number = 20,
): Promise<T[]> => {
  const results: T[] = [];
  let index = 0;

  const processBatch = async () => {
    const currentBatch = promiseFactory
      .slice(index, index + limit)
      .map((fn) => fn());
    index += limit;

    const batchResults = await Promise.all(currentBatch);
    results.push(...batchResults);
  };

  while (index < promiseFactory.length) {
    await processBatch();
  }

  return results;
};

export function getNew(bases: string[], news: string[]): string[] {
  const setA = new Set(bases);
  return news.filter((item) => !setA.has(item));
}

export const retryFunction = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000,
): Promise<T> => {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      await sleep(delayMs);
    }
  }
};

export function formatNumber(
  value: number | string,
  decimals: number,
  useComma = true,
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (useComma) {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return num.toFixed(decimals);
}

import BigNumber from 'bignumber.js';

export const getTimestampInSeconds = () => {
  // Get the current timestamp in milliseconds
  const timestampMs = Date.now();

  // Convert milliseconds to seconds and return
  return Math.floor(timestampMs / 1000);
};

export const getTimestampMsInResolution = (
  timestampMs: number,
  resolution: number,
) => {
  return Math.floor(timestampMs / resolution) * resolution;
};

export function normalizeNumber(number: string): number {
  const MAX_SAFE_INTEGER = 9007199254740991;
  return BigNumber(number).isGreaterThan(MAX_SAFE_INTEGER)
    ? MAX_SAFE_INTEGER
    : Number(number);
}

export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

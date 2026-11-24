export interface Timeout {
  ms: number;
  message: string;
}

export const READ_TIMEOUT: Timeout = {
  ms: 10_000,
  message: 'GeoServer did not answer in time',
};

// A write that times out may still have been committed, so the client must
// not assume it failed and blindly retry (a retried insert duplicates it).
export const WRITE_TIMEOUT: Timeout = {
  ms: 30_000,
  message: 'GeoServer did not answer in time; the change may have been saved',
};

/** AbortSignal.timeout() rejects fetch and body reads with a TimeoutError. */
export function isTimeout(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'TimeoutError';
}

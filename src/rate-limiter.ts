/**
 * Sliding-window limiter that allows at most `limit` acquisitions per interval.
 * Callers are served in FIFO order.
 */
export class RateLimiter {
  private timestamps: number[] = [];
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly limit: number,
    private readonly intervalMs: number = 1000
  ) {}

  /**
   * Resolve once a request slot is available
   */
  acquire(): Promise<void> {
    const slot = this.queue.then(() => this.waitForSlot());
    this.queue = slot.catch(() => undefined);
    return slot;
  }

  private async waitForSlot(): Promise<void> {
    for (;;) {
      const now = Date.now();
      this.timestamps = this.timestamps.filter((t) => now - t < this.intervalMs);

      if (this.timestamps.length < this.limit) {
        this.timestamps.push(now);
        return;
      }

      const waitMs = this.intervalMs - (now - this.timestamps[0]);
      await new Promise<void>((resolve) => setTimeout(resolve, Math.max(waitMs, 1)));
    }
  }
}

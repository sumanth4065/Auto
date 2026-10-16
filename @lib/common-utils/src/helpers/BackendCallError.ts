/**
 * Thrown when a call to a backend/private service (e.g. Integration Gateway,
 * Mulesoft, or a private Lambda) fails inside a public Lambda handler.
 *
 * Structured logging of this error (via extractErrorDetails) will include:
 *   - errorSource: 'backend'   — distinguishes from public-layer errors in Splunk
 *   - backendName               — identifies which backend system failed
 *   - cause                     — the original error details, nested for traceability
 */
export class BackendCallError extends Error {
  readonly errorSource = 'backend' as const;
  readonly backendName: string;
  readonly cause: unknown;

  constructor(backendName: string, cause: unknown) {
    super(`Backend call failed [${backendName}]`);
    this.name = 'BackendCallError';
    this.backendName = backendName;
    this.cause = cause;
    if (this.stack) {
      // Extract file:line:col from the first /lambdas/ frame as a compact location string.
      // Falls back to all non-prefix frames (e.g. in test environments).
      const lines = this.stack.split('\n');
      const firstAppFrame = lines.find(line => line.includes('/lambdas/'));
      const match = firstAppFrame?.match(/\((.+:\d+:\d+)\)/);
      this.stack = match ? match[1] : lines.slice(1).join('\n') || undefined;
    }
    // Restore prototype chain broken by TypeScript's ES5 extends Error compilation
    Object.setPrototypeOf(this, BackendCallError.prototype);
  }
}

/**
 * Threeium SDK error type.
 *
 * - Explicit error codes
 * - Human-readable + machine-parseable
 * - No silent failures
 */

export type ThreeiumErrorInit = Readonly<{
  code: string;
  message: string;
  details?: Readonly<Record<string, unknown>>;
  cause?: unknown;
}>;

export class ThreeiumError extends Error {
  public readonly code: string;
  public readonly details?: Readonly<Record<string, unknown>>;

  public constructor(init: ThreeiumErrorInit) {
    super(init.message);
    this.name = 'ThreeiumError';
    this.code = init.code;
    if (init.details !== undefined) {
      (this as { details: Readonly<Record<string, unknown>> }).details = init.details;
    }

    if (init.cause !== undefined) {
      // Standardized `cause` support.
      (this as unknown as { cause: unknown }).cause = init.cause;
    }
  }

  public toJSON(): Readonly<{ name: string; code: string; message: string; details?: unknown }> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
}

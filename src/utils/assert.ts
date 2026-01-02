/**
 * Fail-fast assertion utilities.
 *
 * All assertions throw deterministically with a stable error code.
 */

import { ThreeiumError } from '../errors/ThreeiumError.js';

/**
 * Asserts that `condition` is truthy.
 * Throws `ThreeiumError` with the provided code/message on failure.
 */
export function assert(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) {
    throw new ThreeiumError({
      code,
      message
    });
  }
}

/** Asserts that `value` is a string. */
export function assertString(value: unknown, code: string, message: string): asserts value is string {
  assert(typeof value === 'string', code, message);
}

/** Asserts that `value` is a non-empty string. */
export function assertNonEmptyString(
  value: unknown,
  code: string,
  message: string
): asserts value is string {
  assertString(value, code, message);
  assert(value.length > 0, code, message);
}

/** Asserts that `value` is a finite number. */
export function assertNumber(value: unknown, code: string, message: string): asserts value is number {
  assert(typeof value === 'number' && Number.isFinite(value), code, message);
}

/** Asserts that `value` is a bigint. */
export function assertBigInt(value: unknown, code: string, message: string): asserts value is bigint {
  assert(typeof value === 'bigint', code, message);
}

/** Asserts that `value` is a plain object (non-null, non-array). */
export function assertPlainObject(
  value: unknown,
  code: string,
  message: string
): asserts value is Record<string, unknown> {
  assert(value !== null && typeof value === 'object' && !Array.isArray(value), code, message);
}

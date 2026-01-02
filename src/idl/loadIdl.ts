/**
 * Runtime IDL loader (Anchor-compatible).
 *
 * No embedded IDLs.
 * Structural validation is performed.
 */

import { readFile } from 'node:fs/promises';
import { assertNonEmptyString, assertPlainObject, assert } from '../utils/assert.js';
import { ThreeiumError } from '../errors/ThreeiumError.js';

export type AnchorIdl = Readonly<{
  /** IDL version string. */
  version: string;
  /** Program name. */
  name: string;
  /** Instruction descriptors (Anchor-compatible). */
  instructions: ReadonlyArray<unknown>;
  accounts?: ReadonlyArray<unknown>;
  types?: ReadonlyArray<unknown>;
  events?: ReadonlyArray<unknown>;
  errors?: ReadonlyArray<unknown>;
  metadata?: Readonly<Record<string, unknown>>;
}>;

function validateAnchorIdl(idl: unknown): AnchorIdl {
  assertPlainObject(idl, 'E_IDL_INVALID', 'IDL must be a plain object');

  const version = (idl as Record<string, unknown>)['version'];
  const name = (idl as Record<string, unknown>)['name'];
  const instructions = (idl as Record<string, unknown>)['instructions'];

  assertNonEmptyString(version, 'E_IDL_INVALID', 'IDL.version must be a non-empty string');
  assertNonEmptyString(name, 'E_IDL_INVALID', 'IDL.name must be a non-empty string');
  assert(Array.isArray(instructions), 'E_IDL_INVALID', 'IDL.instructions must be an array');

  return idl as AnchorIdl;
}

export async function loadIdlFromFile(path: string): Promise<AnchorIdl> {
  assertNonEmptyString(path, 'E_IDL_PATH_REQUIRED', 'IDL path is required');

  let raw: string;
  try {
    raw = await readFile(path, { encoding: 'utf8' });
  } catch (cause) {
    throw new ThreeiumError({
      code: 'E_IDL_READ_FAILED',
      message: 'Failed to read IDL from file',
      details: { path },
      cause
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (cause) {
    throw new ThreeiumError({
      code: 'E_IDL_PARSE_FAILED',
      message: 'Failed to parse IDL JSON',
      details: { path },
      cause
    });
  }

  return validateAnchorIdl(parsed);
}

/**
 * Loads an Anchor-compatible IDL from an http(s) URL at runtime.
 * Performs structural validation.
 */
export async function loadIdlFromUrl(url: string): Promise<AnchorIdl> {
  assertNonEmptyString(url, 'E_IDL_URL_REQUIRED', 'IDL URL is required');

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (cause) {
    throw new ThreeiumError({
      code: 'E_IDL_URL_INVALID',
      message: 'IDL URL must be a valid URL',
      details: { url },
      cause
    });
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new ThreeiumError({
      code: 'E_IDL_URL_INVALID',
      message: 'IDL URL must use http or https',
      details: { url }
    });
  }

  let res: Response;
  try {
    res = await fetch(parsedUrl);
  } catch (cause) {
    throw new ThreeiumError({
      code: 'E_IDL_FETCH_FAILED',
      message: 'Failed to fetch IDL',
      details: { url },
      cause
    });
  }

  if (!res.ok) {
    throw new ThreeiumError({
      code: 'E_IDL_FETCH_FAILED',
      message: 'IDL fetch returned non-OK status',
      details: { url, status: res.status }
    });
  }

  let json: unknown;
  try {
    json = (await res.json()) as unknown;
  } catch (cause) {
    throw new ThreeiumError({
      code: 'E_IDL_PARSE_FAILED',
      message: 'Failed to parse IDL JSON from URL',
      details: { url },
      cause
    });
  }

  return validateAnchorIdl(json);
}

/**
 * Program registry.
 *
 * Absolute constraint: No hardcoded program IDs.
 * Consumers must inject program addresses explicitly.
 */

import { PublicKey } from '@solana/web3.js';
import { ThreeiumError } from '../errors/ThreeiumError.js';
import { assertNonEmptyString, assert } from '../utils/assert.js';

export type ProgramAddress = Readonly<{
  /** Logical name used by the integrator to reference a program. */
  name: string;
  /** Program address (must be injected; never hardcoded by this SDK). */
  programId: PublicKey;
}>;

export class ProgramRegistry {
  private readonly byName: ReadonlyMap<string, PublicKey>;

  public constructor(entries: ReadonlyArray<ProgramAddress>) {
    assert(Array.isArray(entries), 'E_PROGRAM_REGISTRY_INVALID', 'Program registry entries must be an array');
    const map = new Map<string, PublicKey>();

    for (const entry of entries) {
      assertNonEmptyString(entry.name, 'E_PROGRAM_NAME_REQUIRED', 'Program name is required');
      assert(!!entry.programId, 'E_PROGRAM_ID_REQUIRED', 'programId is required');

      if (map.has(entry.name)) {
        throw new ThreeiumError({
          code: 'E_PROGRAM_NAME_DUPLICATE',
          message: 'Duplicate program name in registry',
          details: { name: entry.name }
        });
      }
      map.set(entry.name, entry.programId);
    }

    this.byName = map;
  }

  /** Get a program id by name. Throws if missing. */
  public get(name: string): PublicKey {
    assertNonEmptyString(name, 'E_PROGRAM_NAME_REQUIRED', 'Program name is required');
    const programId = this.byName.get(name);
    if (!programId) {
      throw new ThreeiumError({
        code: 'E_PROGRAM_NOT_FOUND',
        message: 'Program not found in registry',
        details: { name }
      });
    }
    return programId;
  }

  /** True if registry contains a program name. */
  public has(name: string): boolean {
    assertNonEmptyString(name, 'E_PROGRAM_NAME_REQUIRED', 'Program name is required');
    return this.byName.has(name);
  }

  /** Export registry as a deterministic list. */
  public list(): ReadonlyArray<ProgramAddress> {
    const names = [...this.byName.keys()].sort();
    return names.map((name) => {
      const programId = this.byName.get(name);
      assert(!!programId, 'E_PROGRAM_REGISTRY_INVALID', 'Internal program registry invariant violated');
      return { name, programId };
    });
  }
}

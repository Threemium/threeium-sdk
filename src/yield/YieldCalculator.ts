/**
 * YieldCalculator
 *
 * Computes yield from:
 * - Execution fees (lamports paid)
 * - Protocol revenue flows (lamports received)
 *
 * No APR/APY metrics.
 */

import { assertNumber, assertBigInt, assert } from '../utils/assert.js';
import type { YieldReport } from './YieldReport.js';

export type ExecutionFeeEvent = Readonly<{
  /** Slot of the referenced transaction. */
  slot: number;
  /** Verifiable transaction signature. */
  signature: string;
  /** Lamports paid in execution fees. */
  lamports: bigint;
  /** Human-readable description of the fee source. */
  description: string;
}>;

export type ProtocolRevenueEvent = Readonly<{
  /** Slot of the referenced transaction. */
  slot: number;
  /** Verifiable transaction signature. */
  signature: string;
  /** Lamports received as protocol revenue. */
  lamports: bigint;
  /** Human-readable description of the revenue source. */
  description: string;
}>;

export type YieldInputs = Readonly<{
  /** Slot window covered by this report. */
  window: Readonly<{ startSlot: number; endSlot: number }>;
  /** Execution fee evidence. */
  executionFees: ReadonlyArray<ExecutionFeeEvent>;
  /** Protocol revenue evidence. */
  protocolRevenue: ReadonlyArray<ProtocolRevenueEvent>;
  /** Report generation timestamp (unix ms). */
  generatedAtUnixMs: number;
}>;

export class YieldCalculator {
  /** Computes a `YieldReport` from explicit, validated inputs. */
  public compute(inputs: YieldInputs): YieldReport {
    assert(!!inputs, 'E_YIELD_INPUT_REQUIRED', 'Yield inputs are required');

    assertNumber(inputs.window.startSlot, 'E_SLOT_INVALID', 'startSlot must be a finite number');
    assertNumber(inputs.window.endSlot, 'E_SLOT_INVALID', 'endSlot must be a finite number');
    assert(inputs.window.endSlot >= inputs.window.startSlot, 'E_SLOT_INVALID', 'endSlot must be >= startSlot');
    assertNumber(inputs.generatedAtUnixMs, 'E_TIMESTAMP_INVALID', 'generatedAtUnixMs must be a finite number');

    let executionFeesLamports = 0n;
    for (const e of inputs.executionFees) {
      assertNumber(e.slot, 'E_EVENT_INVALID', 'execution fee slot must be a number');
      assert(typeof e.signature === 'string' && e.signature.length > 0, 'E_EVENT_INVALID', 'execution fee signature required');
      assertBigInt(e.lamports, 'E_EVENT_INVALID', 'execution fee lamports must be bigint');
      assert(typeof e.description === 'string' && e.description.length > 0, 'E_EVENT_INVALID', 'execution fee description required');
      executionFeesLamports += e.lamports;
    }

    let protocolRevenueLamports = 0n;
    for (const e of inputs.protocolRevenue) {
      assertNumber(e.slot, 'E_EVENT_INVALID', 'protocol revenue slot must be a number');
      assert(typeof e.signature === 'string' && e.signature.length > 0, 'E_EVENT_INVALID', 'protocol revenue signature required');
      assertBigInt(e.lamports, 'E_EVENT_INVALID', 'protocol revenue lamports must be bigint');
      assert(typeof e.description === 'string' && e.description.length > 0, 'E_EVENT_INVALID', 'protocol revenue description required');
      protocolRevenueLamports += e.lamports;
    }

    const netLamports = protocolRevenueLamports - executionFeesLamports;

    return {
      generatedAtUnixMs: Math.trunc(inputs.generatedAtUnixMs),
      window: {
        startSlot: Math.trunc(inputs.window.startSlot),
        endSlot: Math.trunc(inputs.window.endSlot)
      },
      totals: {
        executionFeesLamports,
        protocolRevenueLamports,
        netLamports
      },
      references: [
        ...inputs.executionFees.map((e) => ({
          slot: e.slot,
          signature: e.signature,
          description: e.description
        })),
        ...inputs.protocolRevenue.map((e) => ({
          slot: e.slot,
          signature: e.signature,
          description: e.description
        }))
      ]
    };
  }
}

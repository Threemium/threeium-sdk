/**
 * Execution router.
 *
 * Deterministic instruction ordering with explicit priority fee injection.
 * No retries, no heuristics.
 */

import { TransactionInstruction, type AccountMeta } from '@solana/web3.js';
import { assert } from '../utils/assert.js';

/** Explicit priority fee instruction wrapper. */
/**
 * Explicit priority fee injection.
 *
 * The caller must provide the exact instruction to inject.
 */
export type PriorityFeeInjection = Readonly<{
  /** Instruction that sets priority fee / compute budget preferences. */
  instruction: TransactionInstruction;
}>;

export type ExecutionPlan = Readonly<{
  /** Base instruction set to execute. */
  instructions: ReadonlyArray<TransactionInstruction>;
  /** Optional explicit priority fee instruction to inject first. */
  priorityFee?: PriorityFeeInjection;
}>;

export class ExecutionRouter {
  /**
   * Deterministically orders instructions by (programId, data, keys).
   * This is purely structural ordering and does not infer semantics.
   */
  public orderDeterministically(instructions: ReadonlyArray<TransactionInstruction>): ReadonlyArray<TransactionInstruction> {
    assert(Array.isArray(instructions), 'E_INSTRUCTIONS_REQUIRED', 'instructions must be an array');

    return [...instructions].sort((a, b) => {
      const ap = a.programId.toBase58();
      const bp = b.programId.toBase58();
      if (ap !== bp) return ap < bp ? -1 : 1;

      const ad = Buffer.from(a.data).toString('hex');
      const bd = Buffer.from(b.data).toString('hex');
      if (ad !== bd) return ad < bd ? -1 : 1;

      const ak = a.keys
        .map((k: AccountMeta) => `${k.pubkey.toBase58()}:${k.isSigner ? 's' : '-'}:${k.isWritable ? 'w' : '-'}`)
        .join('|');
      const bk = b.keys
        .map((k: AccountMeta) => `${k.pubkey.toBase58()}:${k.isSigner ? 's' : '-'}:${k.isWritable ? 'w' : '-'}`)
        .join('|');
      if (ak !== bk) return ak < bk ? -1 : 1;
      return 0;
    });
  }

  /**
   * Builds an execution plan, optionally injecting an explicit priority fee instruction.
   */
  public buildPlan(input: ExecutionPlan): ReadonlyArray<TransactionInstruction> {
    assert(!!input, 'E_EXECUTION_PLAN_REQUIRED', 'execution plan is required');
    assert(Array.isArray(input.instructions), 'E_INSTRUCTIONS_REQUIRED', 'instructions must be an array');

    const ordered = this.orderDeterministically(input.instructions);

    if (!input.priorityFee) {
      return ordered;
    }

    assert(!!input.priorityFee.instruction, 'E_PRIORITY_FEE_INVALID', 'priorityFee.instruction is required');
    return [input.priorityFee.instruction, ...ordered];
  }
}

/**
 * Transaction composer.
 *
 * - Versioned transactions
 * - Explicit blockhash & fee payer
 * - No auto-signing logic
 */

import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction
} from '@solana/web3.js';
import { assert } from '../utils/assert.js';

export type ComposeTransactionInput = Readonly<{
  /** Fee payer public key (explicit; no implicit payer selection). */
  feePayer: PublicKey;
  /** Recent blockhash (explicit; no implicit refresh). */
  recentBlockhash: string;
  /** Instruction list (explicit; no auto insertion). */
  instructions: ReadonlyArray<TransactionInstruction>;
}>;

export class TransactionComposer {
  /** Compose a v0 versioned transaction from explicit inputs. */
  public composeV0(input: ComposeTransactionInput): VersionedTransaction {
    assert(!!input, 'E_COMPOSE_INPUT_REQUIRED', 'compose input is required');
    assert(!!input.feePayer, 'E_FEE_PAYER_REQUIRED', 'feePayer is required');
    assert(typeof input.recentBlockhash === 'string' && input.recentBlockhash.length > 0, 'E_BLOCKHASH_REQUIRED', 'recentBlockhash is required');
    assert(Array.isArray(input.instructions), 'E_INSTRUCTIONS_REQUIRED', 'instructions must be an array');

    const messageV0 = new TransactionMessage({
      payerKey: input.feePayer,
      recentBlockhash: input.recentBlockhash,
      instructions: [...input.instructions]
    }).compileToV0Message();

    return new VersionedTransaction(messageV0);
  }
}

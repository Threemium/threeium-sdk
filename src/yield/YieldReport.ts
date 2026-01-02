import type { PublicKey } from '@solana/web3.js';

/**
 * Serializable yield report.
 * Timestamped, with references to verifiable on-chain data.
 */
export type YieldReport = Readonly<{
  generatedAtUnixMs: number;
  window: Readonly<{
    startSlot: number;
    endSlot: number;
  }>;
  totals: Readonly<{
    executionFeesLamports: bigint;
    protocolRevenueLamports: bigint;
    netLamports: bigint;
  }>;
  references: ReadonlyArray<
    Readonly<{
      slot: number;
      signature: string;
      programId?: PublicKey;
      description: string;
    }>
  >;
}>;

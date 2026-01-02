import type { PublicKey, VersionedTransaction } from '@solana/web3.js';

/** Signer-agnostic wallet boundary. No key custody, no secret storage. */
export type ThreeiumWallet = Readonly<{
  publicKey?: PublicKey;
  signTransaction?: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
  signAllTransactions?: (txs: ReadonlyArray<VersionedTransaction>) => Promise<ReadonlyArray<VersionedTransaction>>;
}>;

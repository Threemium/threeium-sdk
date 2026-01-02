import { describe, it, expect } from 'vitest';
import { Connection } from '@solana/web3.js';
import { YieldCalculator } from '../src/yield/YieldCalculator.js';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || typeof value !== 'string' || value.length === 0) {
    throw new Error(`${name} is required for integration tests`);
  }
  return value;
}

function parseSignaturesCsv(value: string): ReadonlyArray<string> {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

describe('yield', () => {
  it('computes totals from real on-chain transaction fees (no send)', async () => {
    const connection = new Connection(requireEnv('SOLANA_RPC_URL'), { commitment: 'confirmed' });
    const sigs = parseSignaturesCsv(requireEnv('THREEIUM_TEST_SIGNATURES'));
    if (sigs.length < 2) {
      throw new Error('THREEIUM_TEST_SIGNATURES must include at least 2 comma-separated signatures');
    }

    const sigA = sigs[0]!;
    const sigB = sigs[1]!;

    const txA = await connection.getTransaction(sigA, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
    const txB = await connection.getTransaction(sigB, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
    if (!txA?.meta || txA.meta.fee === undefined || txA.slot === undefined) {
      throw new Error('First signature did not resolve to a confirmed transaction with fee metadata');
    }
    if (!txB?.meta || txB.meta.fee === undefined || txB.slot === undefined) {
      throw new Error('Second signature did not resolve to a confirmed transaction with fee metadata');
    }

    const calc = new YieldCalculator();

    const feeA = BigInt(txA.meta.fee);
    const feeB = BigInt(txB.meta.fee);

    const startSlot = Math.min(txA.slot, txB.slot);
    const endSlot = Math.max(txA.slot, txB.slot);

    const report = calc.compute({
      window: { startSlot, endSlot },
      generatedAtUnixMs: Date.now(),
      executionFees: [{ slot: txA.slot, signature: sigA, lamports: feeA, description: 'transaction fee (RPC meta.fee)' }],
      protocolRevenue: [{ slot: txB.slot, signature: sigB, lamports: feeB, description: 'transaction fee used as an input amount' }]
    });

    expect(report.totals.executionFeesLamports).toBe(feeA);
    expect(report.totals.protocolRevenueLamports).toBe(feeB);
    expect(report.totals.netLamports).toBe(feeB - feeA);
  });
});

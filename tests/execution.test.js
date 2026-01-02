import { describe, it, expect } from 'vitest';
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { ExecutionRouter } from '../src/execution/ExecutionRouter.js';
import { TransactionComposer } from '../src/execution/TransactionComposer.js';
function requireEnv(name) {
    const value = process.env[name];
    if (!value || typeof value !== 'string' || value.length === 0) {
        throw new Error(`${name} is required for integration tests`);
    }
    return value;
}
describe('execution', () => {
    it('builds a deterministic plan and composes a v0 transaction (no send)', async () => {
        const connection = new Connection(requireEnv('SOLANA_RPC_URL'), { commitment: 'confirmed' });
        const { blockhash } = await connection.getLatestBlockhash('confirmed');
        const router = new ExecutionRouter();
        const composer = new TransactionComposer();
        const programA = new PublicKey(requireEnv('THREEIUM_TEST_PROGRAM_ID_A'));
        const programB = new PublicKey(requireEnv('THREEIUM_TEST_PROGRAM_ID_B'));
        const feePayer = new PublicKey(requireEnv('THREEIUM_TEST_FEE_PAYER_PUBKEY'));
        const ixA = new TransactionInstruction({ programId: programA, keys: [], data: new Uint8Array([1, 2, 3]) });
        const ixB = new TransactionInstruction({ programId: programB, keys: [], data: new Uint8Array([1, 2, 3]) });
        const plan = router.buildPlan({ instructions: [ixB, ixA] });
        expect(plan.length).toBe(2);
        expect(plan[0].programId.toBase58()).toBe(programA.toBase58());
        const tx = composer.composeV0({ feePayer, recentBlockhash: blockhash, instructions: plan });
        expect(tx.message).toBeDefined();
    });
});
//# sourceMappingURL=execution.test.js.map
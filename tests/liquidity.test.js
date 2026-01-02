import { describe, it, expect } from 'vitest';
import { Connection, PublicKey } from '@solana/web3.js';
import { LiquidityEngine } from '../src/liquidity/LiquidityEngine.js';
import { allocateRoutes } from '../src/liquidity/RouteAllocator.js';
function requireEnv(name) {
    const value = process.env[name];
    if (!value || typeof value !== 'string' || value.length === 0) {
        throw new Error(`${name} is required for integration tests`);
    }
    return value;
}
function parsePubkeysCsv(value) {
    const parts = value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    return parts.map((p) => new PublicKey(p));
}
describe('liquidity', () => {
    it('observes real on-chain accounts and allocates deterministically', async () => {
        const connection = new Connection(requireEnv('SOLANA_RPC_URL'), { commitment: 'confirmed' });
        const engine = new LiquidityEngine(connection);
        const observed = parsePubkeysCsv(requireEnv('THREEIUM_TEST_OBSERVED_ACCOUNTS'));
        if (observed.length < 2) {
            throw new Error('THREEIUM_TEST_OBSERVED_ACCOUNTS must include at least 2 comma-separated public keys');
        }
        const routes = [
            { routeId: 'route-a', observedAccounts: [observed[0]] },
            { routeId: 'route-b', observedAccounts: [observed[1]] }
        ];
        const metrics = await engine.observeAndDerive(routes, (obs) => {
            const totalLamports = obs.accounts.reduce((acc, a) => acc + a.lamports, 0n);
            const executionCostMicroLamports = Number(totalLamports % 1000000n);
            const feeEfficiencyBps = Number((totalLamports / 1000n) % 10000n);
            const liquidityDepthScore = Number((totalLamports / 1000000n) % 1000000n);
            return {
                routeId: obs.routeId,
                executionCostMicroLamports,
                feeEfficiencyBps,
                liquidityDepthScore
            };
        });
        const allocations = allocateRoutes(metrics, {
            executionCost: 1,
            feeEfficiency: 1,
            liquidityDepth: 1
        });
        expect(allocations.length).toBe(2);
        const sum = allocations.reduce((acc, a) => acc + a.weight, 0);
        expect(Math.abs(sum - 1)).toBeLessThan(1e-9);
    });
});
//# sourceMappingURL=liquidity.test.js.map
/**
 * LiquidityEngine
 *
 * Reads real on-chain state only.
 * Does not mutate chain state.
 */

import type { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { assert } from '../utils/assert.js';
import type { RouteMetrics } from './RouteAllocator.js';

export type LiquidityRoute = Readonly<{
  /** Route identifier (integrator-defined). */
  routeId: string;
  /** Accounts to observe on-chain (read-only). */
  observedAccounts: ReadonlyArray<PublicKey>;
}>;

export type LiquidityObservation = Readonly<{
  /** Route identifier. */
  routeId: string;
  /** Slot at which observation was sampled. */
  slot: number;
  /** Account snapshots. */
  accounts: ReadonlyArray<{
    address: PublicKey;
    lamports: bigint;
    executable: boolean;
    owner: PublicKey;
    dataLength: number;
  }>;
}>;

/** Converts an on-chain observation into deterministic route metrics. */
export type MetricsDeriver = (observation: LiquidityObservation) => RouteMetrics;

export class LiquidityEngine {
  private readonly connection: Connection;
  private readonly commitment: Commitment;

  public constructor(connection: Connection, commitment: Commitment) {
    assert(!!connection, 'E_CONNECTION_REQUIRED', 'connection is required');
    assert(typeof commitment === 'string' && commitment.length > 0, 'E_COMMITMENT_REQUIRED', 'commitment is required');
    this.connection = connection;
    this.commitment = commitment;
  }

  /**
   * Fetches account state for each route and returns derived metrics.
   * The metric derivation is caller-supplied to avoid inventing protocol semantics.
   */
  public async observeAndDerive(
    routes: ReadonlyArray<LiquidityRoute>,
    derive: MetricsDeriver
  ): Promise<ReadonlyArray<RouteMetrics>> {
    assert(Array.isArray(routes), 'E_ROUTES_REQUIRED', 'routes must be an array');
    assert(typeof derive === 'function', 'E_DERIVER_REQUIRED', 'derive must be a function');

    const results: RouteMetrics[] = [];

    for (const route of routes) {
      assert(typeof route.routeId === 'string' && route.routeId.length > 0, 'E_ROUTE_ID_REQUIRED', 'routeId is required');
      assert(Array.isArray(route.observedAccounts), 'E_ROUTE_ACCOUNTS_REQUIRED', 'observedAccounts must be an array');

      const infos = await this.connection.getMultipleAccountsInfo(
        route.observedAccounts,
        { commitment: this.commitment }
      );

      const slot = await this.connection.getSlot(this.commitment);

      const accounts = route.observedAccounts.map((address: PublicKey, idx: number) => {
        const info = infos[idx];
        assert(!!info, 'E_ACCOUNT_INFO_MISSING', 'account info missing from RPC response');
        return {
          address,
          lamports: BigInt(info.lamports),
          executable: info.executable,
          owner: info.owner,
          dataLength: info.data.length
        };
      });

      const observation: LiquidityObservation = {
        routeId: route.routeId,
        slot,
        accounts
      };

      results.push(derive(observation));
    }

    return results;
  }
}

/**
 * Cluster configuration. No hidden defaults.
 */

import { assertNonEmptyString } from '../utils/assert.js';

export type ClusterName = 'mainnet-beta' | 'devnet' | 'testnet' | 'custom';

/**
 * Cluster configuration.
 *
 * All fields are required and must be provided explicitly.
 */
export type ClusterConfig = Readonly<{
  cluster: ClusterName;
  rpcUrl: string;
  commitment: 'processed' | 'confirmed' | 'finalized';
}>;

/** Fail-fast validation for `ClusterConfig`. */
export function validateClusterConfig(config: ClusterConfig): void {
  assertNonEmptyString(config.rpcUrl, 'E_RPC_URL_REQUIRED', 'rpcUrl is required');
  assertNonEmptyString(config.cluster, 'E_CLUSTER_REQUIRED', 'cluster is required');
  assertNonEmptyString(config.commitment, 'E_COMMITMENT_REQUIRED', 'commitment is required');
}

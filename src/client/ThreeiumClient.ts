/**
 * Stateless Threeium client entry point.
 *
 * Injected dependencies only:
 * - Solana Connection
 * - Wallet abstraction (optional; required only for signing)
 * - ClusterConfig
 * - ProgramRegistry
 */

import type { Connection } from '@solana/web3.js';
import type { ClusterConfig } from '../config/ClusterConfig.js';
import type { ProgramRegistry } from '../config/ProgramRegistry.js';
import type { ThreeiumWallet } from '../types/public.js';
import { assert } from '../utils/assert.js';

export type ThreeiumClientInit = Readonly<{
  connection: Connection;
  wallet?: ThreeiumWallet;
  cluster: ClusterConfig;
  programs: ProgramRegistry;
}>;

export class ThreeiumClient {
  public readonly connection: Connection;
  public readonly wallet: ThreeiumWallet | undefined;
  public readonly cluster: ClusterConfig;
  public readonly programs: ProgramRegistry;

  public constructor(init: ThreeiumClientInit) {
    assert(!!init, 'E_CLIENT_INIT_REQUIRED', 'Client init is required');
    assert(!!init.connection, 'E_CONNECTION_REQUIRED', 'connection is required');
    assert(!!init.cluster, 'E_CLUSTER_CONFIG_REQUIRED', 'cluster config is required');
    assert(!!init.programs, 'E_PROGRAM_REGISTRY_REQUIRED', 'program registry is required');

    this.connection = init.connection;
    this.wallet = init.wallet;
    this.cluster = init.cluster;
    this.programs = init.programs;
  }

  /** True if client has signing capabilities. */
  public canSign(): boolean {
    return !!this.wallet?.signTransaction;
  }

  /** Require signing capability or throw. */
  public requireSigner(): Required<Pick<ThreeiumWallet, 'signTransaction'>> {
    assert(!!this.wallet?.signTransaction, 'E_SIGNER_REQUIRED', 'Wallet signTransaction is required');
    return { signTransaction: this.wallet.signTransaction };
  }
}

/**
 * Connection manager.
 *
 * - Validates RPC URL explicitly
 * - Enforces commitment (no hidden defaults)
 * - Read-only by default: does not send transactions
 */

import { Connection } from '@solana/web3.js';
import type { ClusterConfig } from '../config/ClusterConfig.js';
import { validateClusterConfig } from '../config/ClusterConfig.js';
import { assertNonEmptyString } from '../utils/assert.js';
import { ThreeiumError } from '../errors/ThreeiumError.js';

export class ConnectionManager {
  private readonly config: ClusterConfig;
  private readonly connection: Connection;

  public constructor(config: ClusterConfig) {
    validateClusterConfig(config);
    this.config = config;

    assertNonEmptyString(config.rpcUrl, 'E_RPC_URL_REQUIRED', 'rpcUrl is required');

    let url: URL;
    try {
      url = new URL(config.rpcUrl);
    } catch (cause) {
      throw new ThreeiumError({
        code: 'E_RPC_URL_INVALID',
        message: 'rpcUrl must be a valid URL',
        details: { rpcUrl: config.rpcUrl },
        cause
      });
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new ThreeiumError({
        code: 'E_RPC_URL_INVALID',
        message: 'rpcUrl must use http or https',
        details: { rpcUrl: config.rpcUrl }
      });
    }

    this.connection = new Connection(config.rpcUrl, {
      commitment: config.commitment
    });
  }

  public getConnection(): Connection {
    return this.connection;
  }

  public getConfig(): ClusterConfig {
    return this.config;
  }
}

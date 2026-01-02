/**
 * Threeium SDK public entrypoint.
 *
 * This module re-exports the SDK's public API. All behavior is explicit, deterministic,
 * and configuration-driven.
 */
export { ThreeiumError } from './errors/ThreeiumError.js';

export type { ClusterConfig, ClusterName } from './config/ClusterConfig.js';
export { validateClusterConfig } from './config/ClusterConfig.js';
export { ProgramRegistry } from './config/ProgramRegistry.js';

export type { ThreeiumWallet } from './types/public.js';

export { ConnectionManager } from './client/ConnectionManager.js';
export { ThreeiumClient } from './client/ThreeiumClient.js';

export { ExecutionRouter } from './execution/ExecutionRouter.js';
export { TransactionComposer } from './execution/TransactionComposer.js';

export { LiquidityEngine } from './liquidity/LiquidityEngine.js';
export { allocateRoutes } from './liquidity/RouteAllocator.js';
export type { RouteMetrics, AllocationWeights, RouteAllocation } from './liquidity/RouteAllocator.js';

export { YieldCalculator } from './yield/YieldCalculator.js';
export type { YieldReport } from './yield/YieldReport.js';

export { loadIdlFromFile, loadIdlFromUrl } from './idl/loadIdl.js';
export type { AnchorIdl } from './idl/loadIdl.js';

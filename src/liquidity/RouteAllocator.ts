/**
 * RouteAllocator
 *
 * Pure deterministic allocation function.
 * No side effects.
 */

import { assertNumber, assert } from '../utils/assert.js';

export type RouteMetrics = Readonly<{
  /** Route identifier (integrator-defined). */
  routeId: string;
  /** Execution cost metric in micro-lamports (integrator-defined). */
  executionCostMicroLamports: number;
  /** Fee efficiency metric in basis points (integrator-defined). */
  feeEfficiencyBps: number;
  /** Liquidity depth metric (integrator-defined). */
  liquidityDepthScore: number;
}>;

export type AllocationWeights = Readonly<{
  /** Weight applied to execution cost term. */
  executionCost: number;
  /** Weight applied to fee efficiency term. */
  feeEfficiency: number;
  /** Weight applied to liquidity depth term. */
  liquidityDepth: number;
}>;

export type RouteAllocation = Readonly<{
  /** Route identifier (integrator-defined). */
  routeId: string;
  /** Allocation weight in [0,1]; weights sum to 1 across all returned routes. */
  weight: number;
}>;

/**
 * Deterministically allocates weights across routes using explicit metrics and explicit weights.
 * No side effects.
 */
export function allocateRoutes(
  routes: ReadonlyArray<RouteMetrics>,
  weights: AllocationWeights
): ReadonlyArray<RouteAllocation> {
  assert(Array.isArray(routes), 'E_ROUTES_REQUIRED', 'routes must be an array');

  assertNumber(weights.executionCost, 'E_WEIGHTS_INVALID', 'weights.executionCost must be a number');
  assertNumber(weights.feeEfficiency, 'E_WEIGHTS_INVALID', 'weights.feeEfficiency must be a number');
  assertNumber(weights.liquidityDepth, 'E_WEIGHTS_INVALID', 'weights.liquidityDepth must be a number');

  const sumWeights = weights.executionCost + weights.feeEfficiency + weights.liquidityDepth;
  assert(sumWeights > 0, 'E_WEIGHTS_INVALID', 'weights must sum to > 0');

  const scored = routes.map((r) => {
    assert(typeof r.routeId === 'string' && r.routeId.length > 0, 'E_ROUTE_ID_REQUIRED', 'routeId is required');
    assertNumber(r.executionCostMicroLamports, 'E_ROUTE_METRIC_INVALID', 'executionCostMicroLamports must be a number');
    assertNumber(r.feeEfficiencyBps, 'E_ROUTE_METRIC_INVALID', 'feeEfficiencyBps must be a number');
    assertNumber(r.liquidityDepthScore, 'E_ROUTE_METRIC_INVALID', 'liquidityDepthScore must be a number');

    // Deterministic normalization strategy:
    // - Lower execution cost is better => invert via 1/(1+cost)
    // - Higher fee efficiency is better
    // - Higher depth score is better
    const costTerm = 1 / (1 + Math.max(0, r.executionCostMicroLamports));
    const feeTerm = Math.max(0, r.feeEfficiencyBps);
    const depthTerm = Math.max(0, r.liquidityDepthScore);

    const score =
      (weights.executionCost * costTerm +
        weights.feeEfficiency * feeTerm +
        weights.liquidityDepth * depthTerm) /
      sumWeights;

    return { routeId: r.routeId, score };
  });

  // Deterministic tie-breaker: routeId lexicographic.
  scored.sort((a, b) => (a.score !== b.score ? (b.score - a.score) : a.routeId.localeCompare(b.routeId)));

  const totalScore = scored.reduce((acc, r) => acc + r.score, 0);
  assert(totalScore > 0, 'E_ALLOCATION_IMPOSSIBLE', 'total score must be > 0');

  return scored.map((r) => ({ routeId: r.routeId, weight: r.score / totalScore }));
}

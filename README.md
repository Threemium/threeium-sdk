# Threeium SDK

Threeium is defined as:

> “A Solana-native system where execution and liquidity evolve into a living source of real, sustainable yield.”

This SDK is infrastructure-level, audit-oriented, and economically real.
It is not experimental, not speculative, and not consumer-facing.

## SDK Philosophy

- Deterministic behavior only
- Fail-fast validation everywhere
- No hidden defaults; configuration is explicit
- Read-only chain access by default
- Wallet abstraction only (no key custody, no secret storage)

## Installation

Requirements:
- Node.js >= 18
- TypeScript >= 5.x

```sh
npm install threeium-sdk
```

## Running Tests

The test suite includes RPC-backed integration tests that are strictly read-only (no transaction submission).
All required inputs must be provided explicitly via environment variables.

Required environment variables:

- `SOLANA_RPC_URL`: An explicit `http(s)` Solana RPC endpoint URL.
- `THREEIUM_TEST_PROGRAM_ID_A`: Base58 program public key used only for instruction construction.
- `THREEIUM_TEST_PROGRAM_ID_B`: Base58 program public key used only for instruction construction.
- `THREEIUM_TEST_FEE_PAYER_PUBKEY`: Base58 public key used as the fee payer when composing a transaction (no signing, no send).
- `THREEIUM_TEST_OBSERVED_ACCOUNTS`: Comma-separated Base58 public keys (at least 2) that exist on-chain; used for `getMultipleAccountsInfo`.
- `THREEIUM_TEST_SIGNATURES`: Comma-separated transaction signatures (at least 2) that resolve on the configured RPC; used to read `meta.fee`.

Run:

```sh
npm test
```

## Initialization (No Secrets)

Initialization requires explicit injection of:
- `Connection` (or a `ConnectionManager` created from a `ClusterConfig`)
- `ClusterConfig`
- `ProgramRegistry` (program IDs must be provided by the integrator)
- Optional `ThreeiumWallet` (only required for signing)

Example initialization without embedding any program IDs:

```ts
import { Connection } from '@solana/web3.js';
import type { ThreeiumWallet } from 'threeium-sdk';
import { ProgramRegistry, ThreeiumClient } from 'threeium-sdk';

const rpcUrl = process.env.SOLANA_RPC_URL;
if (!rpcUrl) throw new Error('SOLANA_RPC_URL is required');

const cluster = {
	cluster: 'custom',
	rpcUrl,
	commitment: 'confirmed'
} as const;

const connection = new Connection(cluster.rpcUrl, { commitment: cluster.commitment });

export function createThreeiumClient(input: {
	programs: ProgramRegistry;
	wallet?: ThreeiumWallet;
}) {
	return new ThreeiumClient({
		connection,
		cluster,
		programs: input.programs,
		wallet: input.wallet
	});
}
```

## Execution Flow

- `ExecutionRouter` deterministically orders instructions using structural fields.
- Priority fee injection is explicit only (caller provides the exact instruction to inject).
- `TransactionComposer` builds versioned transactions with explicit blockhash and fee payer.
- No retries, no heuristics, and no implicit signing.

## Liquidity Routing Overview

- `LiquidityEngine` reads on-chain account state only (no mutation).
- Protocol semantics are not inferred by this SDK. Route metrics are derived by an integrator-supplied function.
- `RouteAllocator` is a pure deterministic function using explicit metrics and explicit weights.

## Yield Reporting

- `YieldCalculator` computes totals from explicit inputs.
- No APR/APY marketing metrics.
- `YieldReport` is serializable, timestamped, and references verifiable on-chain data.

## Security Assumptions

See [SECURITY.md](SECURITY.md).

## Versioning & Governance

- Semantic versioning.
- Breaking changes require a major version bump.
- Security-first review required for changes touching transaction composition, signer boundaries, IDL loading, or RPC interactions.
- No feature additions without protocol alignment.

## Audit Preparation Guide

### Trust assumptions

- RPC responses are treated as external inputs and validated structurally.
- Signing is delegated to an injected wallet boundary.

### Non-goals

- No wallet management, custody, key recovery, or secret storage.
- No claims about on-chain security beyond SDK scope.

### Threat model (SDK-level)

- Malicious or misconfigured RPC endpoints
- Cluster mismatch configuration
- Non-deterministic transaction construction

### Deterministic guarantees

- Instruction ordering is deterministic for a given instruction set.
- Transaction building requires explicit blockhash and explicit fee payer.

### Upgrade and IDL compatibility

- IDLs are loaded at runtime only.
- Structural validation is enforced.
- Program upgrades are supported by changing the IDL source without rebuilding the SDK.

### Known limitations

- Protocol-specific account parsing and scoring semantics are provided by the integrator.

## Investor / Partner Technical Appendix (Factual)

### What the Threeium SDK does

- Deterministic transaction construction utilities
- Read-only on-chain observation plumbing
- Yield accounting primitives based on explicit, verifiable inputs

### What it explicitly does not do

- Key custody or wallet management
- Yield simulation or marketing metrics
- Embedded program IDs or embedded IDLs

### How real yield is measured (data sources only)

- Execution fees: lamports paid, evidenced by on-chain transaction metadata
- Protocol revenue flows: lamports received, evidenced by on-chain transfers/transactions

### Why execution-first, not incentive-first

- The SDK measures and accounts for execution costs and revenue flows via on-chain evidence.

### Integration surface area

- Explicit injection of connection, cluster config, program registry, and optional wallet

### Long-term protocol compatibility philosophy

- Avoid hidden defaults and heuristics
- Keep deterministic behavior stable
- Prefer runtime configuration over compiled-in assumptions

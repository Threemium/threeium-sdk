# Threeium SDK Security

This document describes SDK-level security assumptions, boundaries, and review items.

## SDK-Level

- No key custody: the SDK never generates, stores, or transmits private keys.
- No secret storage: the SDK does not persist secrets to disk, memory caches, or external services.
- Wallet abstraction only: signing is performed via an injected wallet interface.
- Explicit signer boundaries: methods that require signing must fail fast if a signer is not provided.

## Network

- RPC endpoint validation: `rpcUrl` must be explicitly configured and must be a valid `http(s)` URL.
- Cluster mismatch protection: cluster identity is explicit via `ClusterConfig`. The SDK does not infer cluster from RPC.
- Commitment-level enforcement: commitment is explicit; no hidden defaults.

## Execution

- Instruction size limits: callers should ensure instruction sets remain within Solana transaction limits.
- Fee overflow protection: fee values are validated and truncated deterministically where required.
- Deterministic transaction building: explicit ordering, explicit blockhash, explicit fee payer.

## Dependency

- Locked dependency versions: dependencies are pinned to exact versions in `package.json`.
- No unverified crypto libs: the SDK relies on Solana web3.js for protocol primitives and avoids additional cryptographic dependencies.

## Reporting

- Security issues should be reported privately to the maintainers.
- Do not open public issues for suspected vulnerabilities.

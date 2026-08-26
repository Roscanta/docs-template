# Generators

## `generate-evm-specs.ts`

```
yarn generate:evm
```

Reads `specs/rpc/evm/_base-methods.openrpc.json` and `data/network-support.yaml`,
writes one filtered OpenRPC file per network into `specs/rpc/evm/generated/`. Fails
loudly if `network-support.yaml` references a method name that doesn't exist in
`_base-methods.openrpc.json`.

## `generate-pages.ts`

```
yarn generate:pages
```

Scans `specs/rest/*.openapi.json`, `specs/rpc/l1/*.openrpc.json`, and
`specs/rpc/evm/generated/*.openrpc.json`, then for every method:

1. Writes a real file: `pages/api-reference/{category}/{method}.tsx` — a tiny stub
   importing `RpcMethod`/`RestMethod` with that method's data inlined.
2. Writes/overwrites `pages/api-reference/{category}/_meta.json`.
3. Rewrites the parent `pages/api-reference/_meta.json` (index + every category
   marked `display: hidden`, since they're reached through the custom network
   selector, not Nextra's default tree).
4. Rewrites `pages/api-reference/nav.generated.json`, the flat list every custom
   sidebar component reads.

Each `{category}` folder is deleted and rewritten from scratch every run — treat
everything under `pages/api-reference/*-api/` and `pages/api-reference/wallet-api/`
(etc.) as 100% generated, never hand-edit inside them. Run
`yarn generate:all` to run both scripts in the right order.

## `convert-tsx-method.ts` (one-time migration aid)

```
yarn migrate:tsx path/to/EthereumMethod_debug_traceBlockByHash.tsx --kind=evm
yarn migrate:tsx path/to/Solana_getBlock.tsx --kind=l1 --network=solana
yarn migrate:tsx path/to/WalletMethod_getledgergrow.tsx --kind=rest
```

Parses an existing `*Method.tsx` file with the TypeScript compiler API (not regex)
and prints the extracted `REQUEST_PARAMS` / `RESPONSE_PARAMS` / `PATH_PARAMS` /
`USE_CASES` / `CONSTRAINTS` as JSON you can paste into the right spec file. Anything
that isn't a plain literal (template strings with interpolation, arrow functions in
old `CODE_SNIPPETS` arrays) is flagged as `{ "__NEEDS_MANUAL_REVIEW__": "..." }`
instead of guessed at. Not part of the steady-state workflow — run it once per
existing file during migration, spot-check the output, then delete the old file.

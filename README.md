# dRPC Docs — Template Repository

Verified against the real stack: **Nextra 2.13.4 / nextra-theme-docs 2.13.4 / Next.js
13.5.6 / React 18.2.0** — `next build` and `next dev` both run clean on this template
with these exact versions, including every generated page.

## Architecture: we own the whole chrome

`nextra-theme-docs` only wraps `.mdx` pages automatically — plain `.tsx` pages (the
entire API Reference section) never get its Navbar/Sidebar/TOC at all. Rather than
fight that per-route, this template stops depending on `nextra-theme-docs`'s Layout
entirely:

- **`pages/_app.tsx`** wraps *every* page — mdx or tsx — in `components/AppShell.tsx`,
  a small persistent top navbar (logo + Guides + API Reference). This is the one place
  that guarantees the bar never disappears.
- **`theme/index.tsx`** is a custom "bring your own theme" Nextra theme (see
  `next.config.js`: `theme: "./theme/index.tsx"`). Nextra automatically wraps every
  `.mdx` page in whatever this exports — currently that's `GuidesLayout`, which reads
  the real page tree from `pageOpts.pageMap` (a normal prop, not a global/context
  hack) and renders it as an accordion.
- **API Reference pages are plain `.tsx`**, so they're never touched by the theme
  mechanism above — instead, `RpcMethod` / `RestMethod` / `CategoryOverview` each wrap
  themselves in `ApiReferenceLayout` directly.

Both `GuidesLayout` and `ApiReferenceLayout` render the same shared two-column shell
(`.docs-shell` / `.docs-shell__sidebar` / `.docs-shell__content` in
`styles/docs.css`) — same visual frame, different sidebar content.

## API Reference behaviour

- **`/api-reference`** — welcome page. Sidebar shows every network as a plain,
  always-expanded list.
- **`/api-reference/{category}`** — network overview (fixes the 404 that used to
  happen here — see "Generator output" below). Sidebar collapses the network list
  into a dropdown showing the current network; below it, an accordion of that
  network's methods.
- **`/api-reference/{category}/{method}`** — same sidebar, main content is the method.

Sidebar structure, top to bottom: **← All Documentation** (back link) → network
dropdown → methods accordion.

## Guides behaviour

- **`/guides`** — welcome page (`pages/guides/index.mdx`, titled "Welcome" in
  `pages/guides/_meta.json`), shown the moment the Guides tab is clicked.
- Nested folders (see `pages/guides/getting-started/`) become collapsible accordion
  groups automatically — add a folder, add pages, list them in that folder's
  `_meta.json`, nothing else to wire up. The group containing the current page
  auto-expands.

## Generator output — every method is a real file

```
pages/api-reference/
  index.tsx                  <- welcome page (hand-maintained)
  _meta.json                 <- generated: index + every *-api folder marked hidden
  ethereum-api/
    index.tsx                 <- generated: network overview (this was the 404 fix)
    _meta.json                 <- generated: method name -> title
    eth_call.tsx               <- generated stub
    eth_getBalance.tsx
    ...
  polygon-api/
  arbitrum-api/
  solana-api/
  wallet-api/
```

Every method is a **real file**, not a virtual/catch-all route. Each stub is tiny:

```tsx
import { RpcMethod } from "../../../components/RpcMethod";
import type { RpcMethodDef } from "../../../lib/types";

const method: RpcMethodDef = { "name": "eth_call", /* ... */ };

export default function Page() {
  return <RpcMethod method={method} endpoint="https://lb.drpc.org/ogrpc?network=ethereum" />;
}
```

All fields from your original method examples are preserved end-to-end through the
pipeline — `useCases`, `constraints`, `cu`, the full recursive `params`/`result` tree
(including nested `childrenParams`), and `examples.request` / `examples.response` —
as long as the target spec format supports that field. `RpcMethod`/`RestMethod`
render every one of these; nothing is silently dropped between your source data and
the rendered page.

## The three API cases (generation logic unchanged)

1. **REST (`specs/rest/*.openapi.json`)** — TON API, Wallet API. Hand-authored.
2. **L1 RPC (`specs/rpc/l1/*.openrpc.json`)** — Solana and future chain families.
   Hand-authored per chain.
3. **EVM RPC** — `specs/rpc/evm/_base-methods.openrpc.json` (every method dRPC could
   ever expose) × `data/network-support.yaml` (network → supported method names,
   filled in by hand from Grafana) → `generators/generate-evm-specs.ts` produces one
   filtered OpenRPC spec per network in `specs/rpc/evm/generated/`.

## Your workflow

```bash
yarn install
yarn generate:all     # EVM filter step, then every page + _meta.json + nav.generated.json
yarn dev
```

- **New guide** → add an `.mdx` under `pages/guides/`, list it in that folder's `_meta.json`.
- **New EVM network** → add a block to `data/network-support.yaml` and an entry to
  `data/endpoints.yaml`, run `yarn generate:all`.
- **New EVM method (all networks)** → add it once to `_base-methods.openrpc.json`,
  list it under the networks that support it, run `yarn generate:all`.
- **New L1 method** → add one method entry to `specs/rpc/l1/{chain}.openrpc.json`,
  run `yarn generate:pages`.
- **New REST endpoint** → add one `operations` entry to the relevant
  `specs/rest/*.openapi.json`, run `yarn generate:pages`.

See `generators/README.md` for exact commands and `components/README.md` for what
each component does.

## Design system note

Every element in `styles/docs.css` has a stable, semantic class name — no inline
styles anywhere. A designer can reskin the whole site (navbar, both sidebars, method
pages) by editing only that one file.

## Known gap

The old `nextra-theme-docs` navbar used to include a search box (visible as a cut-off
"Search do..." in earlier screenshots). Since `AppShell` replaces that navbar
entirely, there's no search UI right now — worth adding back deliberately (e.g. a
simple input wired to Nextra's flexsearch index, or Algolia) rather than assuming
it's still there.

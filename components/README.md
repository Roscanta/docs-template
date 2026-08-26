# Components

## `RpcMethod` / `RestMethod` — full-page components

Every generated stub under `pages/api-reference/**/*.tsx` renders one of these two.
Both wrap themselves in `ApiReferenceLayout` internally — a generated stub never
needs to think about layout, sidebar state, or routing:

```tsx
<RpcMethod method={method} endpoint="https://lb.drpc.org/ogrpc?network=ethereum" />
```

```tsx
<RestMethod operation={operation} baseUrl="https://lb.drpc.live/lambda" />
```

`method` / `operation` match `RpcMethodDef` / `RestOperationDef` in `lib/types.ts` —
the same `paramName / type / paramDescription / childrenParams` tree shape your
existing `ReqResParam` / `RequestParamProp` types already use.

## `ApiReferenceLayout` — the shared shell

Reads the current URL via `useRouter()` and derives `category` / `method` from
`/api-reference/{category}/{method}` itself — nothing needs to be passed in from the
page. Renders `NetworkSelector` + `MethodSidebarList` in a sticky left column, page
content on the right.

## `NetworkSelector`

Two states:
- No category in the URL (the `/api-reference` welcome page) → renders as a plain,
  always-expanded list of every network.
- Inside a category → collapses into a dropdown button showing that network's name;
  clicking it reopens a searchable list to switch.

## `MethodSidebarList`

The method list for whichever network is currently active, grouped under a
"JSON-RPC API" or "REST API" heading depending on the entries' `kind`.

## `CodeSnippets.tsx` (`buildSnippets`)

The single place that knows how to render a request in curl/js/python (add
go/rust/node here too — the pattern is the same). Replaces the ~6 near-identical
`CODE_SNIPPETS` arrays that used to be hand-written in every method file. `RpcMethod`
and `RestMethod` feed the output straight into Nextra's own `Tabs`/`Tab` components
for syntax-highlighted, tabbed code blocks.

## `ParamsTable`

Renders the recursive param tree. Every element has a class name
(`api-ref-params__*`) in `styles/api-reference.css` — no inline styles anywhere in
this section, specifically so a designer can restyle it later by editing only that
one CSS file.

## Extending

- **New param display need** → edit `ParamsTable.tsx` once.
- **New code example language** → add a branch in `buildSnippets` + an entry in
  `SNIPPET_LANGUAGE_META`.
- **New method metadata field** (e.g. rate limits) → add it to `MethodMeta` in
  `lib/types.ts`, render it in both `RpcMethod.tsx` and `RestMethod.tsx`.

export interface NavEntry {
  kind: "rest" | "rpc-l1" | "rpc-evm";
  category: string; // e.g. "ethereum-api", "wallet-api"
  methodName: string;
  specPath: string;
  slug: string[]; // ["api-reference", category, methodName]
}

export function groupBy<T, K extends string>(items: T[], key: (item: T) => K) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}

/** "ethereum-api" -> "Ethereum", "wallet-api" -> "Wallet", "solana-api" -> "Solana" */
export function categoryToDisplayName(category: string): string {
  const base = category.replace(/-api$/, "");
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/** Human label for the method-list section heading, based on entry kind. */
export function kindToSectionLabel(kind: NavEntry["kind"]): string {
  if (kind === "rest") return "REST API";
  return "JSON-RPC API";
}

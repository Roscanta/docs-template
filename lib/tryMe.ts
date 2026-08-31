import type { ParamNode, RestOperationDef, RpcMethodDef } from "./types";

export interface TryMeField {
  key: string;
  label: string;
  required: boolean;
  /** Object/array params render as a JSON textarea instead of a single-line input. */
  isComplex: boolean;
  defaultValue: string;
}

function isComplexType(type: string): boolean {
  return type === "object" || type.startsWith("array");
}

/**
 * RPC params are positional (a JSON-RPC `params` array), not a named object — so
 * default values come from `examples.request.params[i]`, matched by index to
 * `method.params[i]`. No new spec field needed; the examples were already there.
 */
export function getRpcTryMeFields(method: RpcMethodDef): TryMeField[] {
  const exampleParams = Array.isArray((method.examples?.request as any)?.params)
    ? ((method.examples!.request as any).params as unknown[])
    : [];

  return method.params.map((p, i) => {
    const complex = isComplexType(p.type);
    const exampleValue = exampleParams[i];
    const defaultValue =
      exampleValue === undefined ? "" : complex ? JSON.stringify(exampleValue, null, 2) : String(exampleValue);

    return {
      key: p.paramName,
      label: p.paramName,
      required: p.required !== false, // treat as required unless the spec explicitly marks it optional
      isComplex: complex,
      defaultValue,
    };
  });
}

export function buildRpcRequestBody(method: RpcMethodDef, values: Record<string, string>) {
  const params = method.params.map((p) => coerceValue(p, values[p.paramName] ?? ""));
  return { jsonrpc: "2.0", method: method.name, params, id: 1 };
}

/**
 * REST field derivation. The `key` path param (the dRPC API key placeholder in
 * paths like `/{key}/v1/...`) is deliberately excluded here — it's rendered as its
 * own dedicated "API Key" field in TryMePanel instead, matching how API keys are
 * usually shown separately from other parameters.
 *
 * Note: unlike RPC, our REST specs don't currently carry per-field example values
 * (only descriptions) — see the open question raised when this feature was scoped.
 * Fields default to empty until that's wired up.
 */
export function getRestTryMeFields(operation: RestOperationDef): TryMeField[] {
  const all = [...(operation.pathParams ?? []), ...(operation.queryParams ?? []), ...(operation.requestBody ?? [])];
  return all
    .filter((p) => p.paramName !== "key")
    .map((p) => ({
      key: p.paramName,
      label: p.paramName,
      required: p.required !== false,
      isComplex: isComplexType(p.type),
      defaultValue: "",
    }));
}

export function buildRestRequest(operation: RestOperationDef, baseUrl: string, apiKey: string, values: Record<string, string>) {
  let path = operation.path.replace("{key}", encodeURIComponent(apiKey));
  const query: string[] = [];
  const body: Record<string, unknown> = {};

  for (const p of operation.pathParams ?? []) {
    if (p.paramName === "key") continue; // already substituted above
    path = path.replace(`{${p.paramName}}`, encodeURIComponent(values[p.paramName] ?? ""));
  }
  for (const p of operation.queryParams ?? []) {
    const v = values[p.paramName];
    if (v) query.push(`${encodeURIComponent(p.paramName)}=${encodeURIComponent(v)}`);
  }
  for (const p of operation.requestBody ?? []) {
    body[p.paramName] = coerceValue(p, values[p.paramName] ?? "");
  }

  const url = `${baseUrl}${path}${query.length ? `?${query.join("&")}` : ""}`;
  const hasBody = (operation.requestBody?.length ?? 0) > 0;
  return { url, body: hasBody ? body : undefined };
}

/** Best-effort string -> typed value coercion for sending; falls back to the raw string on any failure. */
function coerceValue(p: ParamNode, raw: string): unknown {
  if (isComplexType(p.type)) {
    if (!raw.trim()) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return raw; // invalid JSON — send as-is rather than silently dropping what the person typed
    }
  }
  if (p.type === "integer" || p.type === "number") {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  if (p.type === "boolean") return raw === "true";
  return raw;
}

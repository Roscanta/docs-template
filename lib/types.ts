/**
 * These types are intentionally close to the existing `ReqResParam` /
 * `RequestParamProp` shape already used in drpc-nextra's GenericMethod/params/types.
 * Migrating existing files is mostly a rename + flattening job, not a rewrite.
 */

export type ParamType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "array_of_objects"
  | "array_of_strings"
  | (string & {});

export interface ParamNode {
  paramName: string;
  type: ParamType;
  paramDescription?: string;
  required?: boolean;
  childrenParamsType?: ParamType;
  childrenParams?: ParamNode[];
}

export type ParamsTree = ParamNode[];

export interface CodeSnippet {
  language: "shell" | "js" | "node" | "go" | "python" | "rust" | (string & {});
  code: string;
}

/** Common fields shared by every method/operation, REST or RPC, L1 or EVM. */
export interface MethodMeta {
  name: string; // e.g. "eth_call", "getBlock", "getLedgerGrow"
  description: string;
  useCases?: string[];
  constraints?: string[];
  cu?: number; // dRPC compute units, kept as a vendor extension when exported to spec files
  examples?: {
    request?: unknown;
    response?: unknown;
  };
}

/** ---------- RPC (OpenRPC-shaped) ---------- */

export interface RpcMethodDef extends MethodMeta {
  params: ParamsTree;
  result: ParamNode;
  /** Networks this method is available on. Populated by the EVM generator, hand-set for L1. */
  networks?: string[];
}

export interface OpenRpcLikeDoc {
  openrpc: string;
  info: { title: string; version: string };
  network?: string; // present on generated per-network EVM files
  methods: RpcMethodDef[];
}

/** ---------- REST (OpenAPI-shaped, simplified) ---------- */

export interface RestOperationDef extends MethodMeta {
  httpMethod: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string; // e.g. "/v1/{protocol}/data/ledger/grow"
  pathParams?: ParamsTree;
  queryParams?: ParamsTree;
  requestBody?: ParamsTree;
  response: ParamsTree;
}

export interface OpenApiLikeDoc {
  openapi: string;
  info: { title: string; version: string };
  servers: { url: string }[];
  operations: RestOperationDef[];
}

/** ---------- network-support.yaml shape ---------- */

export type NetworkSupportMap = Record<string, string[]>;

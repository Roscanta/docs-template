/**
 * Reads:
 *   - specs/rpc/evm/_base-methods.openrpc.json   (source of truth for ALL possible EVM methods)
 *   - data/network-support.yaml                  (which network supports which methods, hand-maintained)
 *
 * Writes:
 *   - specs/rpc/evm/generated/{network}.openrpc.json   (one file per network, filtered methods only)
 *
 * Run with `yarn generate:evm`, normally followed by `yarn generate:pages` (or both
 * together via `yarn generate:all`) — this script only produces the filtered specs;
 * generate-pages.ts is what turns them into real per-method .tsx files under
 * pages/api-reference and rebuilds nav.generated.json.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { OpenRpcLikeDoc, NetworkSupportMap, RpcMethodDef } from "../lib/types";

const ROOT = path.resolve(__dirname, "..");
const BASE_METHODS_PATH = path.join(ROOT, "specs/rpc/evm/_base-methods.openrpc.json");
const NETWORK_SUPPORT_PATH = path.join(ROOT, "data/network-support.yaml");
const OUTPUT_DIR = path.join(ROOT, "specs/rpc/evm/generated");

function loadBaseMethods(): OpenRpcLikeDoc {
  const raw = fs.readFileSync(BASE_METHODS_PATH, "utf-8");
  return JSON.parse(raw) as OpenRpcLikeDoc;
}

function loadNetworkSupport(): NetworkSupportMap {
  const raw = fs.readFileSync(NETWORK_SUPPORT_PATH, "utf-8");
  const parsed = yaml.load(raw) as NetworkSupportMap;
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Could not parse ${NETWORK_SUPPORT_PATH} as a network -> methods map`);
  }
  return parsed;
}

function validateMethodNames(base: OpenRpcLikeDoc, support: NetworkSupportMap) {
  const knownMethods = new Set(base.methods.map((m) => m.name));
  const problems: string[] = [];

  for (const [network, methods] of Object.entries(support)) {
    for (const methodName of methods) {
      if (!knownMethods.has(methodName)) {
        problems.push(
          `Network "${network}" lists method "${methodName}" which does not exist in ` +
            `_base-methods.openrpc.json. Fix the typo or add the method definition first.`
        );
      }
    }
  }

  if (problems.length > 0) {
    console.error("\n❌ network-support.yaml validation failed:\n");
    problems.forEach((p) => console.error(`  - ${p}`));
    console.error("");
    process.exit(1);
  }
}

function generate() {
  const base = loadBaseMethods();
  const support = loadNetworkSupport();

  validateMethodNames(base, support);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const [network, methodNames] of Object.entries(support)) {
    const methods: RpcMethodDef[] = base.methods
      .filter((m) => methodNames.includes(m.name))
      .map((m) => ({ ...m, networks: [network] }));

    const doc: OpenRpcLikeDoc = {
      openrpc: base.openrpc,
      info: { title: `dRPC ${network} JSON-RPC API`, version: base.info.version },
      network,
      methods,
    };

    const outPath = path.join(OUTPUT_DIR, `${network}.openrpc.json`);
    fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + "\n");

    console.log(`✔ ${network}: ${methods.length} method(s) -> ${path.relative(ROOT, outPath)}`);
  }

  const allMethodCount = base.methods.length;
  const usedMethodNames = new Set(Object.values(support).flat());
  const unusedMethods = base.methods.filter((m) => !usedMethodNames.has(m.name)).map((m) => m.name);

  console.log(`\nGenerated ${Object.keys(support).length} network spec(s) from ${allMethodCount} base method(s).`);
  if (unusedMethods.length > 0) {
    console.log(
      `\n⚠ ${unusedMethods.length} method(s) exist in _base-methods.openrpc.json but are not ` +
        `assigned to any network yet (they won't get a page): ${unusedMethods.join(", ")}`
    );
  }
}

generate();

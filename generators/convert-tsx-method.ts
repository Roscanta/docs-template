/**
 * Migration helper — NOT part of the steady-state generator pipeline.
 *
 * Your existing *Method.tsx files (EthereumMethod_*, Solana_*, WalletMethod_*) already
 * declare REQUEST_PARAMS / RESPONSE_PARAMS / USE_CASES / CONSTRAINTS / RESPONSE_JSON as
 * plain JS object literals at module scope. This script extracts those literals with the
 * TypeScript compiler API (no regex on source text) and writes them into the appropriate
 * JSON spec shape.
 *
 * This gets you ~90% of the way for a bulk migration; review the diff of anything
 * containing template-string interpolation (e.g. DRPC_ENDPOINT_URL) or JS expressions
 * that aren't plain literals — those need a one-line manual fix per file, since JSON
 * cannot express arbitrary JS.
 *
 * Usage:
 *   yarn migrate:tsx path/to/EthereumMethod_debug_traceBlockByHash.tsx --kind=evm
 *   yarn migrate:tsx path/to/Solana_getBlock.tsx --kind=l1 --network=solana
 *   yarn migrate:tsx path/to/WalletMethod_getledgergrow.tsx --kind=rest
 *
 * Output is printed to stdout — pipe it into the right spec file, or extend this script
 * to merge automatically once you've validated the output on a handful of files.
 */
import fs from "node:fs";
import ts from "typescript";

type Kind = "evm" | "l1" | "rest";

function parseArgs() {
  const [, , filePath, ...rest] = process.argv;
  if (!filePath) {
    console.error("Usage: yarn migrate:tsx <file.tsx> --kind=evm|l1|rest [--network=solana]");
    process.exit(1);
  }
  const kind = (rest.find((a) => a.startsWith("--kind="))?.split("=")[1] ?? "evm") as Kind;
  const network = rest.find((a) => a.startsWith("--network="))?.split("=")[1];
  return { filePath, kind, network };
}

/** Recursively turn a TS AST literal expression into a plain JS value. */
function literalToValue(node: ts.Node): unknown {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literalToValue);
  if (ts.isObjectLiteralExpression(node)) {
    const obj: Record<string, unknown> = {};
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop) && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name))) {
        obj[prop.name.text] = literalToValue(prop.initializer);
      }
    }
    return obj;
  }
  // Template literals with interpolation (e.g. `${DRPC_ENDPOINT_URL}`), arrow functions
  // (`code: () => \`...\``), and other non-literal expressions can't be losslessly
  // converted — flag them instead of guessing.
  return { __NEEDS_MANUAL_REVIEW__: node.getText() };
}

function extractTopLevelConst(sourceFile: ts.SourceFile, name: string): unknown | undefined {
  let found: unknown;
  sourceFile.forEachChild((node) => {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === name && decl.initializer) {
          found = literalToValue(decl.initializer);
        }
      }
    }
  });
  return found;
}

function main() {
  const { filePath, kind, network } = parseArgs();
  const source = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const requestParams = extractTopLevelConst(sourceFile, "REQUEST_PARAMS") ?? [];
  const responseParams = extractTopLevelConst(sourceFile, "RESPONSE_PARAMS") ?? [];
  const pathParams = extractTopLevelConst(sourceFile, "PATH_PARAMS");
  const useCases = extractTopLevelConst(sourceFile, "USE_CASES") ?? [];
  const constraints = extractTopLevelConst(sourceFile, "CONSTRAINTS") ?? [];

  const base = {
    name: "__FILL_IN__", // the `method` prop value from the component's JSX
    description: "__FILL_IN__", // the `description` prop value
    useCases,
    constraints,
  };

  let output: unknown;
  if (kind === "rest") {
    output = { ...base, httpMethod: "GET", path: "__FILL_IN__", pathParams, response: responseParams };
  } else {
    output = { ...base, params: requestParams, result: { paramName: "result", type: "object" }, __responseParamsRaw: responseParams };
    if (kind === "l1") output = { ...(output as object), network: network ?? "__FILL_IN__" };
  }

  console.log(JSON.stringify(output, null, 2));
  console.error(
    "\n⚠ Review fields marked __FILL_IN__ and any { __NEEDS_MANUAL_REVIEW__: ... } values " +
      "(usually code-snippet template strings) before committing this into a spec file."
  );
}

main();

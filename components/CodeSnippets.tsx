import type { CodeSnippet } from "../lib/types";

interface BuildSnippetsInput {
  endpoint: string;
  requestBodyExample?: unknown;
  httpMethod?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
}

/**
 * Single source of truth for "what a request looks like in every language" — this
 * replaces the ~6 hand-written CODE_SNIPPETS arrays that used to live in every
 * *Method.tsx file. Add a language once here, every method page gets it.
 */
export function buildSnippets({ endpoint, requestBodyExample, httpMethod = "POST" }: BuildSnippetsInput): CodeSnippet[] {
  const body = requestBodyExample ? JSON.stringify(requestBodyExample, null, 2) : undefined;

  return [
    {
      language: "shell",
      code: [
        `curl --request ${httpMethod} \\`,
        `  --url '${endpoint}' \\`,
        `  --header 'Content-Type: application/json'${body ? " \\" : ""}`,
        body ? `  --data '${body}'` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    },
    {
      language: "js",
      code: [
        `const response = await fetch('${endpoint}', {`,
        `  method: '${httpMethod}',`,
        `  headers: { 'Content-Type': 'application/json' },`,
        body ? `  body: JSON.stringify(${body}),` : "",
        `});`,
        `const data = await response.json();`,
        `console.log(data);`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
    {
      language: "python",
      code: [
        `import requests`,
        ``,
        `response = requests.request(`,
        `    "${httpMethod}",`,
        `    "${endpoint}",`,
        `    headers={"Content-Type": "application/json"},`,
        body ? `    json=${body},` : "",
        `)`,
        `print(response.json())`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
}

/** Display label + Nextra `Tabs` language mapping for syntax highlighting. */
export const SNIPPET_LANGUAGE_META: Record<string, { label: string; highlight: string }> = {
  shell: { label: "cURL", highlight: "bash" },
  js: { label: "JavaScript", highlight: "js" },
  python: { label: "Python", highlight: "python" },
  go: { label: "Go", highlight: "go" },
  rust: { label: "Rust", highlight: "rust" },
  node: { label: "Node.js", highlight: "js" },
};

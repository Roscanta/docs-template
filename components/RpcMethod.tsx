import { Tabs, Tab } from "nextra/components";
import { ApiReferenceLayout } from "./ApiReferenceLayout";
import { ParamsTable } from "./ParamsTable";
import { buildSnippets, SNIPPET_LANGUAGE_META } from "./CodeSnippets";
import type { RpcMethodDef } from "../lib/types";

interface RpcMethodProps {
  method: RpcMethodDef;
  /** e.g. "https://lb.drpc.org/ogrpc?network=ethereum" */
  endpoint: string;
}

/**
 * The ONE component every generated EVM/L1 method page renders. Generated stub
 * files (see generators/generate-pages.ts) just import this, pass the method's
 * data, and export it as the page's default export — this component supplies the
 * entire layout, so stubs stay tiny and visually consistent.
 */
export function RpcMethod({ method, endpoint }: RpcMethodProps) {
  const requestExample = method.examples?.request ?? { jsonrpc: "2.0", method: method.name, params: [], id: 1 };
  const snippets = buildSnippets({ endpoint, requestBodyExample: requestExample });

  return (
    <ApiReferenceLayout>
      <article className="api-ref-method">
        <header className="api-ref-method__header">
          <h1>{method.name}</h1>
          <p className="api-ref-method__description">{method.description}</p>
          {method.cu !== undefined ? <span className="api-ref-method__cu">CU: {method.cu}</span> : null}
        </header>

        {method.useCases && method.useCases.length > 0 ? (
          <section>
            <h3>Use cases</h3>
            <ul>
              {method.useCases.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {method.constraints && method.constraints.length > 0 ? (
          <section>
            <h3>Constraints</h3>
            <ul>
              {method.constraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <ParamsTable params={method.params} title="Parameters" />
        <ParamsTable params={method.result.childrenParams ?? []} title="Returns" />

        <section>
          <h3>Request</h3>
          <Tabs items={snippets.map((s) => SNIPPET_LANGUAGE_META[s.language]?.label ?? s.language)}>
            {snippets.map((s) => (
              <Tab key={s.language}>
                <pre>
                  <code>{s.code}</code>
                </pre>
              </Tab>
            ))}
          </Tabs>
        </section>

        {method.examples?.response ? (
          <section>
            <h3>Response</h3>
            <pre>
              <code>{JSON.stringify(method.examples.response, null, 2)}</code>
            </pre>
          </section>
        ) : null}
      </article>
    </ApiReferenceLayout>
  );
}

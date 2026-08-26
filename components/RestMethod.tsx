import { Tabs, Tab } from "nextra/components";
import { ApiReferenceLayout } from "./ApiReferenceLayout";
import { ParamsTable } from "./ParamsTable";
import { buildSnippets, SNIPPET_LANGUAGE_META } from "./CodeSnippets";
import type { RestOperationDef } from "../lib/types";

interface RestMethodProps {
  operation: RestOperationDef;
  baseUrl: string;
}

export function RestMethod({ operation, baseUrl }: RestMethodProps) {
  const fullUrl = `${baseUrl}${operation.path}`;
  const snippets = buildSnippets({ endpoint: fullUrl, httpMethod: operation.httpMethod, requestBodyExample: operation.examples?.request });

  return (
    <ApiReferenceLayout>
      <article className="api-ref-method">
        <header className="api-ref-method__header">
          <h1>{operation.name}</h1>
          <p className="api-ref-method__description">{operation.description}</p>
          <code className="api-ref-method__route">
            {operation.httpMethod} {operation.path}
          </code>
          {operation.cu !== undefined ? <span className="api-ref-method__cu">CU: {operation.cu}</span> : null}
        </header>

        {operation.useCases && operation.useCases.length > 0 ? (
          <section>
            <h3>Use cases</h3>
            <ul>
              {operation.useCases.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {operation.pathParams ? <ParamsTable params={operation.pathParams} title="Path parameters" /> : null}
        {operation.queryParams ? <ParamsTable params={operation.queryParams} title="Query parameters" /> : null}
        {operation.requestBody ? <ParamsTable params={operation.requestBody} title="Request body" /> : null}
        <ParamsTable params={operation.response} title="Response" />

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

        {operation.examples?.response ? (
          <section>
            <h3>Response example</h3>
            <pre>
              <code>{JSON.stringify(operation.examples.response, null, 2)}</code>
            </pre>
          </section>
        ) : null}
      </article>
    </ApiReferenceLayout>
  );
}

interface ResponseExampleProps {
  /** The example response payload already stored in the spec (method.examples.response / operation.examples.response). */
  data: unknown;
  /** Defaults to 200 — none of our current specs carry a status code alongside the example, so this is a display default, not derived data. */
  status?: number;
}

/**
 * Shows the spec's captured example response — the response that corresponds to
 * the same example/test parameters used to seed the Try Me form — as its own
 * labeled block in the side panel, rather than a bare <pre> tag.
 */
export function ResponseExample({ data, status = 200 }: ResponseExampleProps) {
  return (
    <div className="api-ref-response-box">
      <h3>Response</h3>
      <div className="try-me__response">
        <div className="try-me__response-status try-me__response-status--ok">{status}</div>
        <pre className="try-me__code">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}

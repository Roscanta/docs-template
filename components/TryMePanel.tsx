import { useMemo, useState } from "react";
import { Modal } from "./Modal";
import type { TryMeField } from "../lib/tryMe";

interface RequestPreview {
  url: string;
  httpMethod: string;
  body?: unknown;
}

interface TryMePanelProps {
  methodName: string;
  fields: TryMeField[];
  /** Recomputed on every render from current field values — keeps the request preview live. */
  buildRequest: (apiKey: string, values: Record<string, string>) => RequestPreview;
}

interface ResponseState {
  status: number;
  ok: boolean;
  bodyText: string;
}

export function TryMePanel({ methodName, fields, buildRequest }: TryMePanelProps) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.defaultValue]))
  );
  const [errorKeys, setErrorKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseState | null>(null);

  const request = useMemo(() => buildRequest(apiKey, values), [apiKey, values, buildRequest]);

  function setValue(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleRun() {
    const missing = new Set<string>();
    if (!apiKey.trim()) missing.add("__apiKey");
    for (const f of fields) {
      if (f.required && !(values[f.key] ?? "").trim()) missing.add(f.key);
    }
    if (missing.size > 0) {
      setErrorKeys(missing);
      return;
    }
    setErrorKeys(new Set());
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(request.url, {
        method: request.httpMethod,
        headers: request.body !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: request.body !== undefined ? JSON.stringify(request.body) : undefined,
      });
      const text = await res.text();
      setResponse({ status: res.status, ok: res.ok, bodyText: text });
    } catch (err) {
      // Network/CORS failures land here too — see the open question about direct
      // browser calls vs. a proxy raised when this feature was scoped.
      setResponse({ status: 0, ok: false, bodyText: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="try-me__toggle" onClick={() => setOpen(true)}>
        Try Me
      </button>

      {open ? (
        <Modal onClose={() => setOpen(false)}>
          <div className="try-me">
            <div className="try-me__form">
              <h4 className="try-me__form-title">{methodName}</h4>

              <TryMeFieldRow
                label="API Key"
                required
                value={apiKey}
                onChange={(v) => setApiKey(v)}
                error={errorKeys.has("__apiKey")}
              />

              {fields.map((f) => (
                <TryMeFieldRow
                  key={f.key}
                  label={f.label}
                  required={f.required}
                  isComplex={f.isComplex}
                  value={values[f.key] ?? ""}
                  onChange={(v) => setValue(f.key, v)}
                  error={errorKeys.has(f.key)}
                />
              ))}
            </div>

            <div className="try-me__io">
              <div className="try-me__request">
                <div className="try-me__request-bar">
                  <code className="try-me__url">
                    {request.httpMethod} {request.url}
                  </code>
                  <button className="try-me__run" onClick={handleRun} disabled={loading}>
                    {loading ? "Running..." : "Run"}
                  </button>
                </div>
                {request.body !== undefined ? (
                  <pre className="try-me__code">
                    <code>{JSON.stringify(request.body, null, 2)}</code>
                  </pre>
                ) : null}
              </div>

              {response ? (
                <div className="try-me__response">
                  <div
                    className={
                      "try-me__response-status" + (response.ok ? " try-me__response-status--ok" : " try-me__response-status--error")
                    }
                  >
                    {response.status || "Error"}
                  </div>
                  <pre className="try-me__code">
                    <code>{response.bodyText}</code>
                  </pre>
                </div>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function TryMeFieldRow({
  label,
  required,
  isComplex,
  value,
  onChange,
  error,
}: {
  label: string;
  required: boolean;
  isComplex?: boolean;
  value: string;
  onChange: (v: string) => void;
  error: boolean;
}) {
  return (
    <div className="try-me__field">
      <div className="try-me__field-label">
        <span>{label}</span>
        {required ? <span className="try-me__field-required">required</span> : null}
      </div>
      {isComplex ? (
        <textarea
          className={"try-me__input try-me__input--code" + (error ? " try-me__input--error" : "")}
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={"try-me__input" + (error ? " try-me__input--error" : "")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error ? <div className="try-me__field-error">This field is required</div> : null}
    </div>
  );
}

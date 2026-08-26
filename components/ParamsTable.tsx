import type { ParamsTree } from "../lib/types";

export function ParamsTable({ params, title }: { params: ParamsTree; title: string }) {
  return (
    <div className="api-ref-params">
      <h3>{title}</h3>
      {!params || params.length === 0 ? (
        <p className="api-ref-params__empty">This method does not accept any parameters.</p>
      ) : (
        <ParamsList params={params} depth={0} />
      )}
    </div>
  );
}

function ParamsList({ params, depth }: { params: ParamsTree; depth: number }) {
  return (
    <ul className="api-ref-params__list" data-depth={depth}>
      {params.map((p) => (
        <li key={p.paramName} className="api-ref-params__item">
          <div className="api-ref-params__row">
            <code className="api-ref-params__name">{p.paramName}</code>
            <span className="api-ref-params__type">{p.type}</span>
            {p.required ? <span className="api-ref-params__required">required</span> : null}
          </div>
          {p.paramDescription ? <p className="api-ref-params__description">{p.paramDescription}</p> : null}
          {p.childrenParams && p.childrenParams.length > 0 ? (
            <ParamsList params={p.childrenParams} depth={depth + 1} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

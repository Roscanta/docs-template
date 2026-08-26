import { useState } from "react";
import Link from "next/link";
import { kindToSectionLabel, type NavEntry } from "../lib/nav";

interface MethodSidebarListProps {
  entries: NavEntry[]; // already filtered to the current category
  currentMethod?: string;
}

export function MethodSidebarList({ entries, currentMethod }: MethodSidebarListProps) {
  const [open, setOpen] = useState(true);
  if (entries.length === 0) return null;

  const sectionLabel = kindToSectionLabel(entries[0].kind);

  return (
    <div className="api-ref-method-list">
      <button className="api-ref-method-list__heading" onClick={() => setOpen((v) => !v)}>
        <span>{sectionLabel}</span>
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <ul className="api-ref-method-list__items">
          {entries.map((e) => (
            <li key={e.methodName}>
              <Link
                href={`/${e.slug.join("/")}`}
                className={
                  "api-ref-method-list__link" + (e.methodName === currentMethod ? " api-ref-method-list__link--active" : "")
                }
              >
                {e.methodName}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

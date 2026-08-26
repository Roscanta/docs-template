import { useMemo, useState } from "react";
import Link from "next/link";
import { categoryToDisplayName, type NavEntry } from "../lib/nav";

interface NetworkSelectorProps {
  allEntries: NavEntry[];
  /** undefined on the /api-reference welcome page; set once inside a network's pages. */
  currentCategory?: string;
}

/**
 * Two states, matching the requested behaviour:
 * - No network selected yet (welcome page): renders as an always-expanded list.
 * - A network is selected: collapses into a dropdown button showing that network's
 *   name; clicking it reopens the searchable list so the person can switch networks.
 */
export function NetworkSelector({ allEntries, currentCategory }: NetworkSelectorProps) {
  const [open, setOpen] = useState(!currentCategory);
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const unique = Array.from(new Set(allEntries.map((e) => e.category)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [allEntries]);

  const filtered = categories.filter((c) => categoryToDisplayName(c).toLowerCase().includes(query.toLowerCase()));

  // Welcome page: no collapse/expand chrome, just the plain list.
  if (!currentCategory) {
    return (
      <nav className="api-ref-network-list" aria-label="Networks">
        {categories.map((category) => (
          <Link key={category} href={`/api-reference/${category}`} className="api-ref-network-list__item">
            {categoryToDisplayName(category)}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <div className="api-ref-network-selector">
      <Link href="/api-reference" className="api-ref-network-selector__back">
        ← All Documentation
      </Link>

      <button className="api-ref-network-selector__trigger" onClick={() => setOpen((v) => !v)}>
        <span>{categoryToDisplayName(currentCategory)}</span>
        <span aria-hidden>{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="api-ref-network-selector__panel">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search networks..."
            className="api-ref-network-selector__search"
          />
          <div className="api-ref-network-selector__list">
            {filtered.map((category) => (
              <Link
                key={category}
                href={`/api-reference/${category}`}
                onClick={() => setOpen(false)}
                className={
                  "api-ref-network-selector__list-item" +
                  (category === currentCategory ? " api-ref-network-selector__list-item--active" : "")
                }
              >
                {categoryToDisplayName(category)}
              </Link>
            ))}
            {filtered.length === 0 ? <div className="api-ref-network-selector__empty">No matches</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

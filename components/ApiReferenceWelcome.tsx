import Link from "next/link";
import { categoryToDisplayName, groupBy, kindToSectionLabel, type NavEntry } from "../lib/nav";

export function ApiReferenceWelcome({ allEntries }: { allEntries: NavEntry[] }) {
  const byCategory = groupBy(allEntries, (e) => e.category);
  const sections = groupBy(Object.keys(byCategory), (category) => kindToSectionLabel(byCategory[category][0].kind));

  return (
    <div className="api-ref-welcome">
      <h1>API Documentation for Web3</h1>
      <p className="api-ref-welcome__intro">
        Pick a network from the list on the left, or jump straight into one below. Every method
        page is generated from a spec file in <code>/specs</code> — run{" "}
        <code>yarn generate:all</code> after editing specs or <code>data/network-support.yaml</code>{" "}
        to refresh these pages.
      </p>

      {Object.entries(sections).map(([sectionLabel, categories]) => (
        <div className="api-ref-welcome__section" key={sectionLabel}>
          <h2 className="api-ref-welcome__section-heading">{sectionLabel}</h2>
          <div className="api-ref-welcome__grid">
            {categories.sort().map((category) => (
              <Link key={category} href={`/api-reference/${category}`} className="api-ref-welcome__card">
                <span className="api-ref-welcome__card-title">{categoryToDisplayName(category)}</span>
                <span className="api-ref-welcome__card-meta">
                  {byCategory[category].length} method{byCategory[category].length === 1 ? "" : "s"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

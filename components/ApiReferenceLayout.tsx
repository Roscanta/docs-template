import type { ReactNode } from "react";
import { NetworkSelector } from "./NetworkSelector";
import { MethodSidebarList } from "./MethodSidebarList";
import { useApiReferenceRoute } from "../lib/useApiReferenceRoute";
import navData from "../pages/api-reference/nav.generated.json";
import type { NavEntry } from "../lib/nav";

const allEntries = navData as NavEntry[];

interface ApiReferenceLayoutProps {
  children: ReactNode;
}

/**
 * Wraps every /api-reference page (welcome, network overview, and every generated
 * method stub). Reads the current category/method straight from the URL via
 * useApiReferenceRoute, so generated pages never need to pass that info in manually
 * — see generators/generate-pages.ts.
 */
export function ApiReferenceLayout({ children }: ApiReferenceLayoutProps) {
  const { category: currentCategory, method: currentMethod } = useApiReferenceRoute();
  const categoryEntries = currentCategory ? allEntries.filter((e) => e.category === currentCategory) : [];

  return (
    <div className="docs-shell">
      <aside className="docs-shell__sidebar">
        <NetworkSelector allEntries={allEntries} currentCategory={currentCategory} />
        {currentCategory ? <MethodSidebarList entries={categoryEntries} currentMethod={currentMethod} /> : null}
      </aside>

      <main className="docs-shell__content">{children}</main>
    </div>
  );
}

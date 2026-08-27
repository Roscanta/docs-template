import type { ReactNode } from "react";
import { buildPageTree, type PageTreeNode } from "../lib/pageTree";
import { GuidesAccordion } from "./GuidesAccordion";

interface GuidesLayoutProps {
  pageMap: any[];
  route: string;
  children: ReactNode;
}

export function GuidesLayout({ pageMap, route, children }: GuidesLayoutProps) {
  const guidesFolder = pageMap.find((item: any) => item.kind === "Folder" && item.name === "guides");
  const tree: PageTreeNode[] = buildPageTree(guidesFolder?.children ?? []);

  return (
    <div className="docs-shell">
      <aside className="docs-shell__sidebar">
        <GuidesAccordion nodes={tree} currentRoute={route} />
      </aside>
      <main className="docs-shell__content">
        <article className="guides-article">{children}</article>
      </main>
    </div>
  );
}

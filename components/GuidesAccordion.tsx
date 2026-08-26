import { useState } from "react";
import Link from "next/link";
import type { PageTreeNode } from "../lib/pageTree";

function routeContains(node: PageTreeNode, route: string): boolean {
  if (node.route === route) return true;
  return node.children?.some((c) => routeContains(c, route)) ?? false;
}

function AccordionFolder({ node, currentRoute }: { node: PageTreeNode; currentRoute: string }) {
  const [open, setOpen] = useState(() => routeContains(node, currentRoute));

  return (
    <div className="guides-accordion__folder">
      <button className="guides-accordion__folder-toggle" onClick={() => setOpen((v) => !v)}>
        <span>{node.title}</span>
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="guides-accordion__folder-children">
          <GuidesAccordion nodes={node.children ?? []} currentRoute={currentRoute} />
        </div>
      ) : null}
    </div>
  );
}

export function GuidesAccordion({ nodes, currentRoute }: { nodes: PageTreeNode[]; currentRoute: string }) {
  return (
    <nav className="guides-accordion" aria-label="Guides">
      {nodes.map((node) =>
        node.kind === "Folder" ? (
          <AccordionFolder key={node.route} node={node} currentRoute={currentRoute} />
        ) : (
          <Link
            key={node.route}
            href={node.route}
            className={"guides-accordion__link" + (node.route === currentRoute ? " guides-accordion__link--active" : "")}
          >
            {node.title}
          </Link>
        )
      )}
    </nav>
  );
}

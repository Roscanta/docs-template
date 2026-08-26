export interface PageTreeNode {
  name: string;
  route: string;
  title: string;
  kind: "MdxPage" | "Folder";
  children?: PageTreeNode[];
}

interface RawMeta {
  kind: "Meta";
  data: Record<string, string | Record<string, any>>;
}

interface RawMdxFile {
  kind: "MdxPage";
  name: string;
  route: string;
  frontMatter?: { title?: string };
}

interface RawFolder {
  kind: "Folder";
  name: string;
  route: string;
  children: RawPageMapItem[];
}

type RawPageMapItem = RawMeta | RawMdxFile | RawFolder;

function resolveMetaEntry(raw: string | Record<string, any> | undefined): { title?: string; display?: string } {
  if (!raw) return {};
  if (typeof raw === "string") return { title: raw };
  return { title: raw.title, display: raw.display };
}

export function buildPageTree(pageMap: RawPageMapItem[]): PageTreeNode[] {
  const metaItem = pageMap.find((item): item is RawMeta => item.kind === "Meta");
  const metaData = metaItem?.data ?? {};
  const metaKeys = Object.keys(metaData);

  const items = pageMap.filter((item): item is RawMdxFile | RawFolder => item.kind !== "Meta");

  const nodes = items
    .map((item): PageTreeNode | null => {
      const { title, display } = resolveMetaEntry(metaData[item.name]);
      if (display === "hidden") return null;

      if (item.kind === "Folder") {
        return {
          name: item.name,
          route: item.route,
          title: title ?? item.name,
          kind: "Folder" as const,
          children: buildPageTree(item.children),
        };
      }

      return {
        name: item.name,
        route: item.route,
        title: title ?? item.frontMatter?.title ?? item.name,
        kind: "MdxPage" as const,
      };
    })
    .filter((n): n is PageTreeNode => n !== null);

  // Preserve _meta.json's declared order; anything not listed falls back to alphabetical, after the listed items.
  nodes.sort((a, b) => {
    const ai = metaKeys.indexOf(a.name);
    const bi = metaKeys.indexOf(b.name);
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return nodes;
}

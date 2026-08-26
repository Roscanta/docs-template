import type { ReactNode } from "react";
import { GuidesLayout } from "../components/GuidesLayout";

/**
 * The installed nextra@2.13.4's package.json `exports["."]` has no `types` field,
 * so `import type { NextraThemeLayoutProps } from "nextra"` fails to resolve under
 * `moduleResolution: "bundler"`. We only need two fields from it at runtime, so we
 * declare that minimal shape ourselves instead of depending on the package's types.
 */
interface ThemeLayoutProps {
  children: ReactNode;
  pageOpts: { pageMap: any[]; route: string };
}

/**
 * A "bring your own theme" Nextra theme (see next.config.js: `theme: "./theme/index.tsx"`).
 * Nextra automatically wraps every .mdx/.md page in whatever this file default-exports —
 * this is the ONE place that happens, so every guide page gets the accordion sidebar
 * without any per-file boilerplate.
 *
 * Note: this only ever runs for .mdx pages. Plain .tsx pages (the entire api-reference
 * section) bypass Nextra's theme-wrapping mechanism entirely — that's why they wrap
 * themselves in ApiReferenceLayout directly instead. Both sit inside the same AppShell
 * from pages/_app.tsx, which is what keeps the top navbar present everywhere.
 */
export default function Theme({ children, pageOpts }: ThemeLayoutProps) {
  return (
    <GuidesLayout pageMap={pageOpts.pageMap} route={pageOpts.route}>
      {children as ReactNode}
    </GuidesLayout>
  );
}

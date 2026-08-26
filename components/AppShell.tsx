import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isGuides = router.pathname.startsWith("/guides");
  const isApiReference = router.pathname.startsWith("/api-reference");

  return (
    <div className="app-shell">
      <header className="app-shell__topbar">
        <Link href="/api-reference" className="app-shell__logo">
          dRPC Docs
        </Link>
        <nav className="app-shell__nav">
          <Link href="/guides" className={"app-shell__nav-link" + (isGuides ? " app-shell__nav-link--active" : "")}>
            Guides
          </Link>
          <Link
            href="/api-reference"
            className={"app-shell__nav-link" + (isApiReference ? " app-shell__nav-link--active" : "")}
          >
            API Reference
          </Link>
        </nav>
      </header>
      <div className="app-shell__body">{children}</div>
    </div>
  );
}

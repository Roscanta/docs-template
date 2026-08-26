import "nextra-theme-docs/style.css";
import "../styles/docs.css";
import { AppShell } from "../components/AppShell";

export default function App({ Component, pageProps }: any) {
  return (
    <AppShell>
      <Component {...pageProps} />
    </AppShell>
  );
}

import { ApiReferenceLayout } from "../../components/ApiReferenceLayout";
import { ApiReferenceWelcome } from "../../components/ApiReferenceWelcome";
import navData from "./nav.generated.json";
import type { NavEntry } from "../../lib/nav";

export default function ApiReferenceIndexPage() {
  return (
    <ApiReferenceLayout>
      <ApiReferenceWelcome allEntries={navData as NavEntry[]} />
    </ApiReferenceLayout>
  );
}

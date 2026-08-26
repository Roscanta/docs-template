import { ApiReferenceLayout } from "./ApiReferenceLayout";
import { useApiReferenceRoute } from "../lib/useApiReferenceRoute";
import { categoryToDisplayName, kindToSectionLabel, type NavEntry } from "../lib/nav";
import navData from "../pages/api-reference/nav.generated.json";

export function CategoryOverview() {
  const { category } = useApiReferenceRoute();
  const entries = (navData as NavEntry[]).filter((e) => e.category === category);

  return (
    <ApiReferenceLayout>
      {category && entries.length > 0 ? (
        <div className="api-ref-welcome">
          <h1>{categoryToDisplayName(category)}</h1>
          <p className="api-ref-welcome__intro">
            {entries.length} method{entries.length === 1 ? "" : "s"} available under{" "}
            {kindToSectionLabel(entries[0].kind)}. Pick one from the sidebar to see its parameters,
            response shape, and request examples.
          </p>
        </div>
      ) : null}
    </ApiReferenceLayout>
  );
}

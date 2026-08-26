import { useRouter } from "next/router";

/** Parses /api-reference/{category}/{method} straight from the URL. */
export function useApiReferenceRoute() {
  const router = useRouter();
  const segments = router.pathname.replace(/^\/api-reference\/?/, "").split("/").filter(Boolean);
  const [category, method] = segments;
  return { category, method };
}

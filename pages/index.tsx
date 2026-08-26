import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: "/api-reference", permanent: false } };
};

// Never actually rendered — getServerSideProps always redirects first.
export default function IndexRedirect() {
  return null;
}

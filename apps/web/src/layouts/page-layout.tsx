import { useEffect } from "react";
import { Outlet, useMatches } from "react-router-dom";

type PageHandle = {
  title?: string;
};

export function PageLayout() {
  const matches = useMatches();
  const pageTitle = matches
    .map((match) => (match.handle as PageHandle | undefined)?.title)
    .filter(Boolean)
    .at(-1);

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | Mockment` : "Mockment";
  }, [pageTitle]);

  return <Outlet />;
}

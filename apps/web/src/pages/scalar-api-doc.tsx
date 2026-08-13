import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export function ScalarApiDocPage() {
  return (
    <ApiReferenceReact
      configuration={{
        url: "http://localhost:8080/docs/json",
        theme: "default",
        showDeveloperTools: "never",
        agent: {
          disabled: true,
        },
        mcp: {
          disabled: true,
        },
        hideClientButton: true,
      }}
    />
  );
}

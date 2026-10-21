import "@fontsource-variable/ibm-plex-sans/wght.css";
import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./lib/router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);

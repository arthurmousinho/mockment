import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/main-layout";
import { ApiKeysPage } from "@/pages/api-keys";
import { PaymentsPage } from "@/pages/payments";
import { WebhooksPage } from "@/pages/webhooks";
import { CheckoutPage } from "@/pages/checkout";
import { FrontendLayout } from "@/layouts/frontend-layout";
import { CheckoutDefaultSuccessPage } from "@/pages/checkout-default-success";
import { CheckoutDefaultCancelPage } from "@/pages/checkout-default-cancel";
import { SubscriptionsPage } from "@/pages/subscriptions";
import { EventsPage } from "@/pages/events";
import { GuidePage } from "@/pages/guide";

export const router = createBrowserRouter([
  {
    element: <FrontendLayout />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { path: "", element: <GuidePage /> },
          { path: "payments", element: <PaymentsPage /> },
          { path: "subscriptions", element: <SubscriptionsPage /> },
          { path: "events", element: <EventsPage /> },
          { path: "webhooks", element: <WebhooksPage /> },
          { path: "api-keys", element: <ApiKeysPage /> },
        ],
      },
      { path: "checkout/:id", element: <CheckoutPage /> },
      { path: "success-checkout", element: <CheckoutDefaultSuccessPage /> },
      { path: "cancel-checkout", element: <CheckoutDefaultCancelPage /> },
    ],
  },
  {
    path: "scalar-api-doc",
    lazy: async () => {
      const { ScalarApiDocPage } = await import("@/pages/scalar-api-doc");
      return { Component: ScalarApiDocPage };
    },
  },
]);

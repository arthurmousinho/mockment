import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/main-layout";
import { ApiKeysPage } from "@/pages/api-keys";
import { PaymentsPage } from "@/pages/payments";
import { WebhooksPage } from "@/pages/webhooks";
import { CheckoutPage } from "@/pages/checkout";
import { ScalarApiDocPage } from "@/pages/scalar-api-doc";
import { CheckoutDefaultSuccessPage } from "@/pages/checkout-default-success";
import { CheckoutDefaultCancelPage } from "@/pages/checkout-default-cancel";
import { SubscriptionsPage } from "@/pages/subscriptions";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "", element: <h1>dahboard</h1> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "subscriptions", element: <SubscriptionsPage /> },
      { path: "webhooks", element: <WebhooksPage /> },
      { path: "api-keys", element: <ApiKeysPage /> },
    ],
  },
  { path: "scalar-api-doc", element: <ScalarApiDocPage /> },
  { path: "checkout/:id", element: <CheckoutPage /> },
  { path: "success-checkout", element: <CheckoutDefaultSuccessPage /> },
  { path: "cancel-checkout", element: <CheckoutDefaultCancelPage /> },
]);

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
import { NotFoundPage } from "@/pages/not-found";
import { PageLayout } from "@/layouts/page-layout";

export const router = createBrowserRouter([
  {
    element: <PageLayout />,
    children: [
      {
        element: <FrontendLayout />,
        children: [
          {
            path: "/",
            element: <MainLayout />,
            children: [
              { path: "", handle: { title: "Guide" }, element: <GuidePage /> },
              {
                path: "payments",
                handle: { title: "Payments" },
                element: <PaymentsPage />,
              },
              {
                path: "subscriptions",
                handle: { title: "Subscriptions" },
                element: <SubscriptionsPage />,
              },
              {
                path: "events",
                handle: { title: "Events" },
                element: <EventsPage />,
              },
              {
                path: "webhooks",
                handle: { title: "Webhooks" },
                element: <WebhooksPage />,
              },
              {
                path: "api-keys",
                handle: { title: "API Keys" },
                element: <ApiKeysPage />,
              },
            ],
          },
          {
            path: "checkout/:id",
            handle: { title: "Checkout" },
            element: <CheckoutPage />,
          },
          {
            path: "success-checkout",
            handle: { title: "Payment approved" },
            element: <CheckoutDefaultSuccessPage />,
          },
          {
            path: "cancel-checkout",
            handle: { title: "Payment canceled" },
            element: <CheckoutDefaultCancelPage />,
          },
          {
            path: "*",
            handle: { title: "404 — Page not found" },
            element: <NotFoundPage />,
          },
        ],
      },
      {
        path: "scalar-api-doc",
        handle: { title: "API Documentation" },
        lazy: async () => {
          const { ScalarApiDocPage } = await import("@/pages/scalar-api-doc");
          return { Component: ScalarApiDocPage };
        },
      },
    ],
  },
]);

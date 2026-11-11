import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/main-layout";
import { CustomersPage } from "@/pages/customers";
import { ApiKeysPage } from "@/pages/api-keys";
import { CheckoutsPage } from "@/pages/checkouts";
import { PaymentsPage } from "@/pages/payments";
import { InvoicesPage } from "@/pages/invoices";
import { WebhooksPage } from "@/pages/webhooks";
import { CheckoutPage } from "@/pages/checkout";
import { FrontendLayout } from "@/layouts/frontend-layout";
import { CheckoutDefaultSuccessPage } from "@/pages/checkout-default-success";
import { CheckoutDefaultCancelPage } from "@/pages/checkout-default-cancel";
import { SubscriptionsPage } from "@/pages/subscriptions";
import { EventsPage } from "@/pages/events";
import { GuidePage } from "@/pages/guide";
import { SimulationScenariosPage } from "@/pages/simulation-scenarios";
import { SimulationRunPage } from "@/pages/simulation-run";
import { NotFoundPage } from "@/pages/not-found";
import { PageLayout } from "@/layouts/page-layout";
import { AppearancePage } from "@/pages/appearance";

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
                path: "appearance",
                handle: { title: "Appearance" },
                element: <AppearancePage />,
              },
              {
                path: "customers",
                handle: { title: "Customers" },
                element: <CustomersPage />,
              },
              {
                path: "payments",
                handle: { title: "Payments" },
                element: <PaymentsPage />,
              },
              {
                path: "invoices",
                handle: { title: "Invoices" },
                element: <InvoicesPage />,
              },
              {
                path: "checkouts",
                handle: { title: "Checkouts" },
                element: <CheckoutsPage />,
              },
              {
                path: "simulations",
                handle: { title: "Simulation Scenarios" },
                element: <SimulationScenariosPage />,
              },
              {
                path: "simulations/runs/:id",
                handle: { title: "Simulation Run" },
                element: <SimulationRunPage />,
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

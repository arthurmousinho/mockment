import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { Button } from "@/components/ui/button";
import type { PaymentStatus } from "@/http/payments-http";
import {
  ArrowRightIcon,
  BracketsCurlyIcon,
  CheckCircleIcon,
  CreditCardIcon,
  CubeIcon,
  KeyIcon,
  LightningIcon,
  PlugsConnectedIcon,
  RocketLaunchIcon,
  TerminalIcon,
  WebhooksLogoIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export function GuidePage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-12 py-10">
      <section className="space-y-4">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            Build and test payment integrations locally
          </h1>

          <p className="text-lg leading-8 text-muted-foreground">
            Mockment is a local-first payment gateway simulator designed to help
            you develop and test payment integrations without depending on
            external payment providers or sandbox environments.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <Link to="/api-keys">
              <KeyIcon className="size-4" />
              Create API key
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <a href="#first-payment">
              Get started
              <ArrowRightIcon className="size-4" />
            </a>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">How Mockment works</h2>
          <p className="text-muted-foreground">
            Mockment exposes a payment API that behaves like a real payment
            gateway, while keeping everything running locally.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <GuideCard
            icon={<PlugsConnectedIcon />}
            title="Integrate"
            description="Connect your application to the Mockment API using an API key."
          />
          <GuideCard
            icon={<CreditCardIcon />}
            title="Create payments"
            description="Create and manage payments using the same concepts found in real gateways."
          />
          <GuideCard
            icon={<WebhooksLogoIcon />}
            title="Receive events"
            description="Configure webhooks and observe payment and subscription events."
          />
        </div>
      </section>
      <section id="first-payment" className="scroll-mt-24 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <RocketLaunchIcon className="size-5" />
            <h2 className="text-2xl font-semibold">
              Create your first payment
            </h2>
          </div>
          <p className="text-muted-foreground">
            Follow these steps to make your first request to Mockment.
          </p>
        </div>
        <div className="space-y-8">
          <GuideStep
            number="01"
            icon={<KeyIcon />}
            title="Create an API key"
            description="API keys authenticate requests made to the Mockment API."
          />
          <GuideStep
            number="02"
            icon={<TerminalIcon />}
            title="Configure your application"
            description="Add your API key to your application's environment variables."
          >
            <CodeBlock>{`MOCKMENT_API_KEY=mk_test_xxxxxxxxxxxxx`}</CodeBlock>
          </GuideStep>
          <GuideStep
            number="03"
            icon={<BracketsCurlyIcon />}
            title="Create a payment"
            description="Send a request to the payments endpoint."
          >
            <CodeBlock>
              {`curl -X POST http://localhost:8080/payments \\
  -H "Authorization: Bearer $MOCKMENT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amountInCents": 10000
  }'`}
            </CodeBlock>
          </GuideStep>

          <GuideStep
            number="04"
            icon={<CheckCircleIcon />}
            title="Inspect the result"
            description="The API returns the created payment. You can inspect its status and events from the Mockment dashboard."
          />
        </div>
      </section>
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="size-5" />
            <h2 className="text-2xl font-semibold">Payments</h2>
          </div>

          <p className="text-muted-foreground">
            Payments represent individual transactions processed through
            Mockment.
          </p>
        </div>

        <div className="rounded border bg-card p-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {["CREATED", "PROCESSING", "APPROVED", "DECLINED", "CANCELED"].map(
              (status, index) => (
                <div key={status} className="flex items-center gap-3">
                  <PaymentStatusBadge status={status as PaymentStatus} />
                  {index < 4 && (
                    <ArrowRightIcon className="size-4 text-muted-foreground" />
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Subscriptions */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <LightningIcon className="size-5" />
            <h2 className="text-2xl font-semibold">Subscriptions</h2>
          </div>

          <p className="text-muted-foreground">
            Mockment also supports recurring billing. Subscriptions
            automatically generate payments according to their billing interval.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <GuideCard
            icon={<LightningIcon />}
            title="Recurring billing"
            description="Define a billing interval and let Mockment generate recurring payments automatically."
          />

          <GuideCard
            icon={<CubeIcon />}
            title="Virtual clock"
            description="Control simulated time to test billing cycles without waiting for real dates."
          />
        </div>
      </section>

      {/* Webhooks */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <WebhooksLogoIcon className="size-5" />
            <h2 className="text-2xl font-semibold">Webhooks</h2>
          </div>

          <p className="text-muted-foreground">
            Use webhooks to notify your application whenever something important
            happens inside Mockment.
          </p>
        </div>

        <div className="rounded border bg-card p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <InfoItem
              title="Events"
              description="Payment and subscription lifecycle events."
            />

            <InfoItem
              title="Endpoints"
              description="Define where Mockment should send notifications."
            />

            <InfoItem
              title="Deliveries"
              description="Inspect requests, responses and delivery status."
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <LightningIcon className="size-5" />
            <h2 className="text-2xl font-semibold">Events</h2>
          </div>

          <p className="text-muted-foreground">
            Events provide a history of important changes throughout the
            lifecycle of payments and subscriptions.
          </p>
        </div>

        <div className="rounded border bg-muted/30 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded border bg-background p-2">
              <LightningIcon className="size-5" />
            </div>

            <div className="space-y-1">
              <p className="font-medium">One place to inspect what happened</p>

              <p className="text-sm leading-6 text-muted-foreground">
                Use the Events section to understand when payments were created
                or approved, when subscriptions were renewed, and which events
                triggered webhook deliveries.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Recommended workflow</h2>

          <p className="text-muted-foreground">
            A typical development workflow with Mockment looks like this:
          </p>
        </div>

        <div className="grid gap-3">
          {[
            "Create an API key",
            "Connect your application to the local API",
            "Create payments or subscriptions",
            "Configure webhook endpoints",
            "Trigger different payment states",
            "Advance the virtual clock when testing recurring billing",
            "Inspect events and webhook deliveries",
          ].map((item, index) => (
            <div
              key={item}
              className="flex items-center gap-4 rounded border bg-card p-4"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {index + 1}
              </span>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-muted/30 p-8 text-center">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full border bg-background">
            <RocketLaunchIcon className="size-5" />
          </div>

          <h2 className="text-2xl font-semibold">Ready to start testing?</h2>

          <p className="text-muted-foreground">
            Create an API key and make your first request to the Mockment API.
          </p>

          <Button asChild>
            <Link to="/api-keys">
              Create API key
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function GuideCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded border bg-card p-5">
      <div className="mb-4 flex size-9 items-center justify-center rounded border bg-muted">
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function GuideStep({
  number,
  icon,
  title,
  description,
  children,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[56px_1fr]">
      <div className="flex size-8 items-center justify-center rounded border bg-muted">
        {icon}
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium tracking-wider text-muted-foreground">
            STEP {number}
          </p>
          <h3 className="mt-1 text-lg font-medium">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded border bg-muted/50 p-4 text-sm">
      <code>{children}</code>
    </pre>
  );
}

function InfoItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

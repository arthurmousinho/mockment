import { Link } from "react-router-dom";
import { ArrowLeftIcon, WarningOctagonIcon } from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function InvalidCheckout({ notFound }: { notFound: boolean }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-muted/30 px-4">
      <Logo />
      <Card className="w-full max-w-md overflow-hidden">
        <CardContent className="flex flex-col items-center gap-6 p-10 text-center">
          <div className="flex size-16 items-center justify-center bg-rose-100 dark:bg-rose-950">
            <WarningOctagonIcon
              size={40}
              weight="fill"
              className="text-rose-600 dark:text-rose-400"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">
              {notFound ? "Checkout not found" : "Checkout unavailable"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {notFound
                ? "This checkout could not be found."
                : "This checkout is no longer available."}
            </p>
          </div>
          <Link
            to="/"
            className={cn(
              buttonVariants({ size: "lg", className: "w-full gap-2" }),
            )}
          >
            <ArrowLeftIcon size={16} aria-hidden="true" />
            Back to home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

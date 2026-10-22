import { Link } from "react-router-dom";
import { Button, buttonVariants } from "./ui/button";
import { Card } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  ListIcon,
  GithubLogoIcon,
  KeyIcon,
  WebhooksLogoIcon,
  CurrencyCircleDollarIcon,
  BookOpenIcon,
  PathIcon,
  SunIcon,
  MoonIcon,
  DesktopIcon,
  StarIcon,
  ArrowUpRightIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";
import { Logo } from "./logo";

const navigationLinks = [
  { label: "Guide", href: "/", icon: PathIcon },
  { label: "Payments", href: "/payments", icon: CurrencyCircleDollarIcon },
  { label: "Subscriptions", href: "/subscriptions", icon: StarIcon },
  { label: "Events", href: "/events", icon: ReceiptIcon },
  { label: "Webhooks", href: "/webhooks", icon: WebhooksLogoIcon },
  { label: "API Keys", href: "/api-keys", icon: KeyIcon },
] as const;

const apiDocLinks = [
  {
    label: "Scalar",
    href: "/scalar-api-doc",
    external: true,
  },
  {
    label: "Swagger UI",
    href: `${import.meta.env.VITE_API_URL}/docs`,
    external: true,
  },
] as const;

export function Header() {
  const { setTheme } = useTheme();

  return (
    <Card className="@container flex w-full flex-row items-center justify-between gap-3 rounded bg-slate-100 px-3 py-3 sm:px-6 sm:py-4 dark:bg-muted">
      <Logo />

      <nav
        aria-label="Main navigation"
        className="flex shrink-0 items-center gap-2"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="@min-[68rem]:hidden"
              aria-label="Open navigation menu"
            >
              <ListIcon size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <DropdownMenuItem key={link.href} asChild>
                  <Link to={link.href}>
                    <Icon size={18} />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            {apiDocLinks.map((doc) => (
              <DropdownMenuItem key={doc.label} asChild>
                <a href={doc.href} target="_blank" rel="noopener noreferrer">
                  <BookOpenIcon size={18} />
                  {doc.label}
                  <ArrowUpRightIcon size={16} />
                </a>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href="https://github.com/arthurmousinho/mockment"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubLogoIcon size={18} />
                Star on GitHub
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {navigationLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link
              to={link.href}
              key={index}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "hidden @min-[68rem]:inline-flex",
              )}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="hidden @min-[68rem]:inline-flex"
            >
              <BookOpenIcon size={18} />
              API Doc
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {apiDocLinks.map((doc) =>
              doc.external ? (
                <DropdownMenuItem key={doc.label} asChild>
                  <a href={doc.href} target="_blank" rel="noopener noreferrer">
                    <ArrowUpRightIcon size={16} />
                    {doc.label}
                  </a>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem key={doc.label} asChild>
                  <Link to={doc.href}>
                    <ArrowUpRightIcon size={16} />
                    {doc.label}
                  </Link>
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <SunIcon
                size={18}
                className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
              />
              <MoonIcon
                size={18}
                className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
              />
              <span className="sr-only">Alternar tema</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <SunIcon size={16} />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <MoonIcon size={16} />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <DesktopIcon size={16} />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          className="hidden @min-[68rem]:inline-flex"
          asChild
        >
          <a
            href="https://github.com/arthurmousinho/mockment"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubLogoIcon size={32} />
            Star on GitHub
          </a>
        </Button>
      </nav>
    </Card>
  );
}

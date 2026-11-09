import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
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
  LinkSimpleIcon,
  FlaskIcon,
  TicketIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";
import { Logo } from "./logo";

const navigationLinks = [
  { label: "Guide", href: "/", icon: PathIcon },
  { label: "Payments", href: "/payments", icon: CurrencyCircleDollarIcon },
  { label: "Invoices", href: "/invoices", icon: TicketIcon },
  { label: "Checkouts", href: "/checkouts", icon: LinkSimpleIcon },
  { label: "Simulations", href: "/simulations", icon: FlaskIcon },
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

const GITHUB_URL = "https://github.com/arthurmousinho/mockment";

export function Header() {
  const { setTheme } = useTheme();
  const { pathname } = useLocation();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="@container w-full overflow-hidden border bg-slate-50 dark:bg-muted/40">
      <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <Logo />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
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
                  <ArrowUpRightIcon size={16} className="ml-auto" />
                </a>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <SunIcon size={18} />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <MoonIcon size={18} />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <DesktopIcon size={18} />
              System
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <GithubLogoIcon size={18} />
                Star on GitHub
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden shrink-0 items-center gap-1 @min-[68rem]:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label="API documentation">
                <BookOpenIcon size={18} />
                API Docs
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {apiDocLinks.map((doc) =>
                doc.external ? (
                  <DropdownMenuItem key={doc.label} asChild>
                    <a
                      href={doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
              <Button variant="outline" size="icon">
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

          <Button variant="outline" className="ml-1" asChild>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <GithubLogoIcon size={16} />
              Star on GitHub
            </a>
          </Button>
        </div>
      </div>
      <nav
        aria-label="Main navigation"
        className="hidden overflow-x-auto border-t px-2 @min-[68rem]:block sm:px-3"
      >
        <ul className="flex items-center">
          {navigationLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <li key={link.href} className="relative shrink-0 py-1.5">
                <Link
                  to={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-accent",
                    active
                      ? "font-medium text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

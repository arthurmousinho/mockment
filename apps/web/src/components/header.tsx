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
  KeyIcon,
  WebhooksLogoIcon,
  CurrencyCircleDollarIcon,
  BookOpenIcon,
  PathIcon,
  StarIcon,
  ArrowUpRightIcon,
  ReceiptIcon,
  LinkSimpleIcon,
  FlaskIcon,
  TicketIcon,
  UsersIcon,
  PackageIcon,
  PaletteIcon,
  SpeedometerIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { SpotlightSearch } from "./spotlight-search";
import { VirtualClockButton } from "./virtual-clock-button";

const navigationLinks = [
  { label: "Guide", href: "/", icon: PathIcon },
  { label: "Mockboard", href: "/mockboard", icon: SpeedometerIcon },
  { label: "Payments", href: "/payments", icon: CurrencyCircleDollarIcon },
  { label: "Invoices", href: "/invoices", icon: TicketIcon },
  { label: "Products", href: "/products", icon: PackageIcon },
  { label: "Customers", href: "/customers", icon: UsersIcon },
  { label: "Checkouts", href: "/checkouts", icon: LinkSimpleIcon },
  { label: "Simulations", href: "/simulations", icon: FlaskIcon },
  { label: "Subscriptions", href: "/subscriptions", icon: StarIcon },
  { label: "Events", href: "/events", icon: ReceiptIcon },
  { label: "Webhooks", href: "/webhooks", icon: WebhooksLogoIcon },
  { label: "API Keys", href: "/api-keys", icon: KeyIcon },
] as const;

const searchablePages = [
  ...navigationLinks,
  { label: "Appearance", href: "/appearance", icon: PaletteIcon },
] as const;

const apiDocLinks = [
  {
    label: "Scalar",
    href: "/scalar-api-doc",
    icon: BookOpenIcon,
    external: true,
  },
  {
    label: "Swagger UI",
    href: `${import.meta.env.VITE_API_URL}/docs`,
    icon: BookOpenIcon,
    external: true,
  },
] as const;

export function Header() {
  const { pathname } = useLocation();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="@container w-full overflow-hidden border bg-slate-50 dark:bg-muted/40">
      <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <Logo />
        <div className="flex shrink-0 items-center gap-1">
          <SpotlightSearch
            navigationlinks={searchablePages}
            apiDocLinks={apiDocLinks}
          />
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
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link to="/appearance" aria-label="Appearance">
              <PaletteIcon size={18} />
            </Link>
          </Button>
          <VirtualClockButton />
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

import { Link } from "react-router-dom";
import { Button, buttonVariants } from "./ui/button";
import { Card } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  GithubLogoIcon,
  KeyIcon,
  WebhooksLogoIcon,
  CurrencyCircleDollarIcon,
  BookOpenIcon,
  GaugeIcon,
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
  { label: "Dashboard", href: "/", icon: GaugeIcon },
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
    <Card className="flex flex-row items-center justify-between w-full px-6 py-4 bg-slate-100 dark:bg-muted rounded">
      <Logo />

      <nav className="flex items-center space-x-2">
        {navigationLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link
              to={link.href}
              key={index}
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
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

        <Button variant="outline" asChild>
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

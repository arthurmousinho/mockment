import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRightIcon,
  ClockCounterClockwiseIcon,
  MagnifyingGlassIcon,
  type Icon,
} from "@phosphor-icons/react";
import { Button } from "./ui/button";
import { Kbd, KbdGroup } from "./ui/kbd";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "./ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type PageSearchProps = {
  links: readonly { label: string; href: string; icon: Icon }[];
};

const ENTITY_ROUTES: Record<string, { label: string; path: string }> = {
  pay: { label: "payment", path: "/payments" },
  sub: { label: "subscription", path: "/subscriptions" },
  cus: { label: "customer", path: "/customers" },
  inv: { label: "invoice", path: "/invoices" },
  evt: { label: "event", path: "/events" },
  scn: { label: "scenario", path: "/simulations" },
  run: { label: "simulation run", path: "/simulations/runs" },
  chk: { label: "checkout", path: "/checkout" },
};

const RECENT_PAGES_KEY = "mockment:recent-pages";

function readRecentPages(): string[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(RECENT_PAGES_KEY) ?? "[]",
    );
    return Array.isArray(stored)
      ? stored
          .filter((path): path is string => typeof path === "string")
          .slice(0, 3)
      : [];
  } catch {
    return [];
  }
}

function getPageLabel(path: string, links: PageSearchProps["links"]) {
  const link = links.find((item) => item.href === path);
  if (link) return link.label;

  for (const [prefix, entity] of Object.entries(ENTITY_ROUTES)) {
    const start = `${entity.path}/${prefix}_`;
    if (
      path.startsWith(start) &&
      /^[a-zA-Z0-9-]+$/.test(path.slice(start.length))
    ) {
      return `${entity.label[0].toUpperCase()}${entity.label.slice(1)} ${path.slice(entity.path.length + 1)}`;
    }
  }
}

export function PageSearch({ links }: PageSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recentPages, setRecentPages] = useState<string[]>([]);
  const recentPagesRef = useRef<string[] | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const id = search.trim();
  const match = /^([a-z]+)_[a-zA-Z0-9-]+$/.exec(id);
  const entity =
    match && Object.hasOwn(ENTITY_ROUTES, match[1])
      ? ENTITY_ROUTES[match[1]]
      : undefined;

  useEffect(() => {
    if (!getPageLabel(pathname, links)) return;

    const previous = recentPagesRef.current ?? readRecentPages();
    const recent = [
      pathname,
      ...previous.filter((path) => path !== pathname),
    ].slice(0, 3);
    recentPagesRef.current = recent;
    try {
      localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(recent));
    } catch {
      // Keep the history in memory when storage is unavailable.
    }
  }, [pathname, links]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
        setSearch("");
        setRecentPages(recentPagesRef.current ?? readRecentPages());
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen)
          setRecentPages(recentPagesRef.current ?? readRecentPages());
        if (!nextOpen) setSearch("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" aria-label="Search pages">
          <MagnifyingGlassIcon size={18} />
          <span className="hidden sm:inline">Search pages...</span>
          <KbdGroup className="ml-4 hidden @min-[68rem]:inline-flex">
            <Kbd>⌘ / Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="gap-0 overflow-hidden p-2"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search pages</DialogTitle>
          <DialogDescription>
            Search for a page, then press Enter to navigate.
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput
            placeholder="Search pages..."
            aria-label="Search pages"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No pages found.</CommandEmpty>
            {!search && recentPages.length > 0 && (
              <CommandGroup heading="Recent">
                {recentPages.map((path) => {
                  const label = getPageLabel(path, links);
                  if (!label) return null;
                  return (
                    <CommandItem
                      key={path}
                      value={`Recent ${label} ${path}`}
                      onSelect={() => {
                        setOpen(false);
                        setSearch("");
                        navigate(path);
                      }}
                    >
                      <ClockCounterClockwiseIcon size={16} />
                      {label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {entity && (
              <CommandGroup heading="Details">
                <CommandItem
                  value={`Go to ${entity.label} ${id}`}
                  onSelect={() => {
                    setOpen(false);
                    setSearch("");
                    navigate(`${entity.path}/${id}`);
                  }}
                >
                  <ArrowUpRightIcon size={16} />
                  Go to {entity.label} {id}
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading="Pages">
              {links.map((link) => {
                const PageIcon = link.icon;
                return (
                  <CommandItem
                    key={link.href}
                    value={link.label}
                    keywords={[link.href]}
                    onSelect={() => {
                      setOpen(false);
                      setSearch("");
                      navigate(link.href);
                    }}
                  >
                    <PageIcon size={16} />
                    {link.label}
                    <CommandShortcut className="opacity-0 transition-opacity group-hover/command-item:opacity-100">
                      <ArrowUpRightIcon size={16} aria-hidden="true" />
                    </CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

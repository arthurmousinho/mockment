import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getEntityPageLabel,
  useSearchEntityActions,
} from "@/hooks/use-search-entity-actions";
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

type SearchLink = {
  label: string;
  href: string;
  icon: Icon;
  external?: boolean;
};

type PageSearchProps = {
  navigationlinks: readonly SearchLink[];
  apiDocLinks: readonly SearchLink[];
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

function getPageLabel(path: string, links: PageSearchProps["navigationlinks"]) {
  const link = links.find((item) => item.href === path);
  if (link) return link.label;

  return getEntityPageLabel(path);
}

export function PageSearch({ navigationlinks, apiDocLinks }: PageSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recentPages, setRecentPages] = useState<string[]>([]);

  const { pathname } = useLocation();

  const recentPagesRef = useRef<string[] | null>(null);
  const navigate = useNavigate();

  const entity = useSearchEntityActions(search);

  function selectLink(link: SearchLink) {
    setOpen(false);
    setSearch("");
    if (link.external) {
      window.open(link.href, "_blank", "noopener,noreferrer");
    } else {
      navigate(link.href);
    }
  }

  useEffect(() => {
    if (!getPageLabel(pathname, navigationlinks)) return;

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
  }, [pathname, navigationlinks]);

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
                  const label = getPageLabel(path, navigationlinks);
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
                  value={`Go to ${entity.label} ${entity.id}`}
                  onSelect={() => {
                    setOpen(false);
                    setSearch("");
                    navigate(entity.href);
                  }}
                >
                  <ArrowUpRightIcon size={16} />
                  Go to {entity.label} {entity.id}
                </CommandItem>
              </CommandGroup>
            )}
            {entity && entity.actions.length > 0 && (
              <CommandGroup
                heading={`${entity.label[0].toUpperCase()}${entity.label.slice(1)} actions`}
              >
                {entity.actions.map(({ label, icon: ActionIcon, execute }) => (
                  <CommandItem
                    key={label}
                    value={`${label} ${entity.label} ${entity.id}`}
                    disabled={entity.isActionPending}
                    onSelect={() => {
                      execute(entity.id);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <ActionIcon size={16} />
                    {label} {entity.label} {entity.id}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="Pages">
              {navigationlinks.map((link) => {
                const PageIcon = link.icon;
                return (
                  <CommandItem
                    key={link.href}
                    value={link.label}
                    keywords={[link.href]}
                    onSelect={() => selectLink(link)}
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
            <CommandGroup heading="API Docs">
              {apiDocLinks.map((doc) => {
                const DocIcon = doc.icon;
                return (
                  <CommandItem
                    key={doc.href}
                    value={`API Docs ${doc.label}`}
                    keywords={[doc.href, "API documentation"]}
                    onSelect={() => selectLink(doc)}
                  >
                    <DocIcon size={16} />
                    {doc.label}
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

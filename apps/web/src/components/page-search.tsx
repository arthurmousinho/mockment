import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRightIcon,
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

export function PageSearch({ links }: PageSearchProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          />
          <CommandList>
            <CommandEmpty>No pages found.</CommandEmpty>
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

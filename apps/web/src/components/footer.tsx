import { ArrowUpIcon, GithubLogoIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 px-4 py-5 text-sm text-muted-foreground dark:bg-muted/40">
      <div className="mx-auto flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 xl:max-w-[95%] sm:px-6">
        <p>Mockment · Local-first payment gateway simulator</p>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
        >
          <a
            href="https://github.com/arthurmousinho/mockment"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <GithubLogoIcon size={16} />
            Star on GitHub
          </a>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUpIcon size={18} />
          </Button>
        </nav>
      </div>
    </footer>
  );
}

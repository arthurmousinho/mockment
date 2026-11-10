import {
  DesktopIcon,
  GearIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react";
import {
  getThemeColorScheme,
  useTheme,
  type Theme,
} from "@/components/theme-provider";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const THEMES = [
  {
    value: "light",
    label: "Light",
    description: "A bright workspace with crisp, clear details.",
    icon: SunIcon,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Deep neutral surfaces for a classic dark workspace.",
    icon: MoonIcon,
  },
  {
    value: "dimmed",
    label: "Dark Dimmed",
    description: "Soft charcoal surfaces with gentle contrast.",
    icon: MoonIcon,
  },
  {
    value: "midnight",
    label: "Midnight",
    description: "Cool navy surfaces with a soft blue accent.",
    icon: MoonIcon,
  },
  {
    value: "warm",
    label: "Warm Light",
    description: "Paper-toned surfaces with a warm amber accent.",
    icon: SunIcon,
  },
  {
    value: "system",
    label: "Sync with system",
    description: "Automatically follow your device’s appearance.",
    icon: DesktopIcon,
  },
] as const;

function ThemePreview({ theme }: { theme: Exclude<Theme, "system"> }) {
  return (
    <div
      data-app-theme={getThemeColorScheme(theme)}
      data-app-palette={theme}
      className="h-36 overflow-hidden border border-border bg-background p-3 text-foreground"
    >
      <div className="mb-3 flex items-center gap-1 border-b border-border pb-3">
        <div className="size-3 bg-primary" />
        <div className="ml-1 h-1.5 w-12 bg-muted-foreground" />
        <div className="ml-auto h-4 w-8 border border-input" />
      </div>
      <div className="mb-3 h-2 w-16 bg-foreground" />
      <div className="space-y-2 border border-border bg-card p-2">
        {["w-3/4", "w-full", "w-1/2"].map((width) => (
          <div
            key={width}
            className={cn("h-1.5 bg-muted-foreground/40", width)}
          />
        ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-w-0 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <GearIcon size={24} />
          <h1 className="text-xl font-medium tracking-tight">Settings</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Make Mockment feel at home in your workspace.
        </p>
      </header>

      <fieldset>
        <legend className="mb-3 text-sm font-medium">Theme preference</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((option) => {
            const Icon = option.icon;
            return (
              <label key={option.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => setTheme(option.value)}
                  aria-describedby={`theme-${option.value}-description`}
                  className="peer sr-only"
                />
                <Card className="h-full transition-colors hover:ring-muted-foreground/50 peer-checked:ring-2 peer-checked:ring-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ring">
                  <CardContent className="space-y-4">
                    <div aria-hidden="true" className="relative">
                      <ThemePreview
                        theme={
                          option.value === "system" ? "light" : option.value
                        }
                      />
                      {option.value === "system" && (
                        <div className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
                          <ThemePreview theme="dark" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Icon size={18} aria-hidden="true" />
                      {option.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "ml-auto flex size-4 items-center justify-center rounded-full border",
                          theme === option.value
                            ? "border-primary"
                            : "border-muted-foreground",
                        )}
                      >
                        {theme === option.value && (
                          <span className="size-2 rounded-full bg-primary" />
                        )}
                      </span>
                    </div>
                    <p
                      id={`theme-${option.value}-description`}
                      className="text-sm text-muted-foreground"
                    >
                      {option.description}
                    </p>
                  </CardContent>
                </Card>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

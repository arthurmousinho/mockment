/* eslint-disable react-refresh/only-export-components */
import * as React from "react";

export type Theme =
  "dark" | "light" | "dimmed" | "midnight" | "warm" | "system";
type ResolvedTheme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const THEME_VALUES: Theme[] = [
  "dark",
  "light",
  "dimmed",
  "midnight",
  "warm",
  "system",
];

export function getThemeColorScheme(theme: Theme): "light" | "dark" | "system" {
  if (theme === "system") return "system";
  return theme === "light" || theme === "warm" ? "light" : "dark";
}

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined);

function isTheme(value: string | null): value is Theme {
  if (value === null) {
    return false;
  }

  return THEME_VALUES.includes(value as Theme);
}

function getSystemTheme(): ResolvedTheme {
  if (window.matchMedia(COLOR_SCHEME_QUERY).matches) {
    return "dark";
  }

  return "light";
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}",
    ),
  );
  document.head.appendChild(style);

  return () => {
    window.getComputedStyle(document.body);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove();
      });
    });
  };
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const editableParent = target.closest(
    "input, textarea, select, [contenteditable='true']",
  );
  if (editableParent) {
    return true;
  }

  return false;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey: key = "theme",
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  const storageKey = key.startsWith("mockment:") ? key : `mockment:${key}`;
  const [theme, setThemeState] = React.useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey);
    if (isTheme(storedTheme)) {
      return storedTheme;
    }

    if (storageKey === "mockment:theme") {
      const legacyTheme = localStorage.getItem("theme");
      if (isTheme(legacyTheme)) return legacyTheme;
    }

    return defaultTheme;
  });

  React.useEffect(() => {
    if (storageKey !== "mockment:theme") return;

    const legacyTheme = localStorage.getItem("theme");
    if (!isTheme(legacyTheme)) return;

    if (!isTheme(localStorage.getItem(storageKey))) {
      localStorage.setItem(storageKey, legacyTheme);
    }
    localStorage.removeItem("theme");
  }, [storageKey]);

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme);
      setThemeState(nextTheme);
    },
    [storageKey],
  );

  const applyTheme = React.useCallback(
    (nextTheme: Theme) => {
      const root = document.documentElement;
      const resolvedTheme =
        nextTheme === "system"
          ? getSystemTheme()
          : getThemeColorScheme(nextTheme);
      const restoreTransitions = disableTransitionOnChange
        ? disableTransitionsTemporarily()
        : null;

      root.dataset.appTheme = resolvedTheme;
      root.dataset.appPalette =
        nextTheme === "system" ? resolvedTheme : nextTheme;

      if (restoreTransitions) {
        restoreTransitions();
      }
    },
    [disableTransitionOnChange],
  );

  React.useLayoutEffect(() => {
    applyTheme(theme);

    if (theme !== "system") {
      return () => {
        delete document.documentElement.dataset.appTheme;
        delete document.documentElement.dataset.appPalette;
      };
    }

    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
    const handleChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      delete document.documentElement.dataset.appTheme;
      delete document.documentElement.dataset.appPalette;
    };
  }, [theme, applyTheme]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key.toLowerCase() !== "d") {
        return;
      }

      setThemeState((currentTheme) => {
        const colorScheme =
          currentTheme === "system"
            ? getSystemTheme()
            : getThemeColorScheme(currentTheme);
        const nextTheme = colorScheme === "dark" ? "light" : "dark";

        localStorage.setItem(storageKey, nextTheme);
        return nextTheme;
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [storageKey]);

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return;
      }

      if (event.key !== storageKey) {
        return;
      }

      if (isTheme(event.newValue)) {
        setThemeState(event.newValue);
        return;
      }

      setThemeState(defaultTheme);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [defaultTheme, storageKey]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme],
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

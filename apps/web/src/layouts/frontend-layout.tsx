import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export function FrontendLayout() {
  return (
    <ThemeProvider>
      <Outlet />
      <Toaster />
    </ThemeProvider>
  );
}


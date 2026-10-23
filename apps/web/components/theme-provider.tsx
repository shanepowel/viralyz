"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Light by default; dark via data-theme="dark" on <html>. With no stored
 * choice we follow prefers-color-scheme. next-themes persists the choice in
 * localStorage (guarded) and sets it before paint, so there is no flash.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      enableColorScheme={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

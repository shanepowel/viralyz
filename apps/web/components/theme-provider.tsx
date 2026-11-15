"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Light by default; dark via data-theme="dark" on <html>. "Match device" is
 * a choice the visitor makes, not the default. next-themes persists the choice in
 * localStorage (guarded) and sets it before paint, so there is no flash.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      enableColorScheme={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

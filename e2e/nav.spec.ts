import { test, expect } from "@playwright/test";

test("main nav has five links and marks the current page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/pricing");

  const nav = page.getByRole("navigation", { name: "Main" });
  for (const name of ["Platform", "For sellers", "Pricing", "Trust", "Free tools"]) {
    await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(nav.getByRole("link", { name: "Pricing", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("mobile nav wraps without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Free tools", exact: true })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test("theme choice persists across reloads", async ({ page }) => {
  await page.goto("/");
  // Light is the default, whatever the device prefers.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  // The switch in the top bar.
  await page.getByRole("button", { name: "Switch to the dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  // The full control in the footer.
  await page.getByRole("radio", { name: "Light", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

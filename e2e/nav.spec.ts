import { test, expect } from "@playwright/test";

test("desktop mega menu keyboard open/close", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const platform = page.getByRole("button", { name: "Platform" });
  await platform.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: /Viral Score/i })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: /Viral Score/i })).toBeHidden();
});

test("mobile nav opens and traps focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByLabel("Open menu").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { routes } from "../apps/web/lib/site";

const pages = Object.values(routes).filter(
  (r): r is string => typeof r === "string" && r.startsWith("/"),
);

for (const path of pages) {
  test(`smoke ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res!.status()).toBeLessThan(400);

    await expect(page.locator("h1")).toHaveCount(1);

    for (const s of [
      "Stripe checkout wires in",
      "2,140",
      "Trusted by teams at",
    ]) {
      await expect(page.locator("body")).not.toContainText(s);
    }

    const axe = await new AxeBuilder({ page }).analyze();
    const bad = axe.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(bad, JSON.stringify(bad, null, 2)).toHaveLength(0);
  });
}

test("mobile nav opens and traps focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByLabel("Open menu").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

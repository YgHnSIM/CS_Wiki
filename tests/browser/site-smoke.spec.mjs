import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";


test("global search and mobile navigation work in a real browser", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-open-search]").first().click();
  await page.locator("[data-search-input]").fill("튜링 기계");
  await expect(page.locator("[data-search-results] .search-result").first()).toContainText("튜링 기계");
  await page.getByRole("button", { name: "닫기" }).click();
  await expect(page.locator("[data-search-dialog]")).not.toHaveAttribute("open", "");

  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "메뉴" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});


test("interactive knowledge lenses initialize and accept keyboard input", async ({ page }) => {
  await page.goto("/map/graph/");
  await expect(page).toHaveURL(/\/map\/atlas\/$/);
  await expect(page.locator("[data-atlas-controls]")).toBeVisible();
  await page.locator("[data-atlas-search]").fill("EDSAC");
  await expect(page.locator("[data-atlas-search-results] [role=option]").first()).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("[data-atlas-status]")).not.toBeEmpty();

  await page.goto("/map/history/");
  await expect(page.locator("[data-history-controls]")).toBeVisible();
  await page.locator("[data-history-search]").fill("EDSAC");
  await expect(page.locator("[data-history-search-results] [role=option]").first()).toBeVisible();

  await page.goto("/map/evidence/");
  await expect(page.locator("[data-evidence-controls]")).toBeVisible();
  await page.locator("[data-evidence-search]").fill("튜링");
  await expect(page.locator("[data-evidence-search-results] [role=option]").first()).toBeVisible();
});


test("article connections stay compact and keyboard-switchable", async ({ page }) => {
  await page.goto("/concepts/edsac/");
  const explorer = page.locator("[data-relationship-explorer]");
  const map = explorer.locator("[data-relationship-map]");
  const list = explorer.locator("[data-relationship-list]");
  await expect(explorer.getByRole("heading", { name: "문서 연결" })).toBeVisible();
  await expect(map).not.toHaveAttribute("open", "");

  const guide = explorer.getByRole("tab", { name: /읽기/ });
  await guide.click();
  await expect(guide).toHaveAttribute("aria-selected", "true");
  await expect.poll(async () => list.locator(":scope > li").count()).toBeGreaterThan(0);
  expect(await list.locator(":scope > li").count()).toBeLessThanOrEqual(6);

  await guide.focus();
  await page.keyboard.press("ArrowRight");
  await expect(explorer.getByRole("tab", { name: /근거/ })).toHaveAttribute("aria-selected", "true");
  await map.locator("summary").click();
  await expect(map).toHaveAttribute("open", "");
  await expect(list.locator("[data-relationship-select]").first()).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(list).toBeVisible();
  await expect(explorer.locator("[data-relationship-channel]")).toHaveCount(4);
});


test("core pages have no serious automated accessibility violations", async ({ page }) => {
  for (const route of ["/", "/concepts/edsac/", "/map/atlas/", "/map/history/", "/map/evidence/"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
    expect(serious, `${route}: ${serious.map((item) => item.id).join(", ")}`).toEqual([]);
  }
});


test("evidence navigation remains available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/map/evidence/");
  await expect(page.getByRole("heading", { level: 1, name: /근거가 지식 문서로/ })).toBeVisible();
  await expect(page.locator('a[href*="/map/evidence/document/"]').first()).toBeVisible();
  await context.close();
});

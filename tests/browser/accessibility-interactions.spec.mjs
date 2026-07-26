import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("global search keeps focus and combobox state synchronized", async ({ page }) => {
  await page.goto("/");
  const opener = page.locator("[data-open-search]").first();
  await opener.click();

  const dialog = page.locator("[data-search-dialog]");
  const input = page.locator("[data-search-input]");
  await expect(dialog).toBeVisible();
  await expect(input).toHaveAttribute("role", "combobox");
  await expect(input).toHaveAttribute("aria-expanded", "false");

  await input.fill("튜링 기계");
  const firstOption = page.locator("[data-search-results] [role=option]").first();
  await expect(firstOption).toBeVisible();
  await expect(dialog).toHaveAttribute("data-search-state", "results");
  await expect(input).toHaveAttribute("aria-expanded", "true");

  await input.press("ArrowDown");
  const activeId = await input.getAttribute("aria-activedescendant");
  expect(activeId).toBeTruthy();
  await expect(page.locator(`#${activeId}`)).toHaveAttribute("aria-selected", "true");

  await input.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await input.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test("mobile navigation is a modal and restores its trigger focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.locator(".menu-trigger");
  const menu = page.locator("[data-mobile-menu]");

  await trigger.click();
  await expect(menu).toHaveAttribute("open", "");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(await menu.evaluate((element) => element.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});

test("article table of contents moves without duplication and focuses its heading", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/docs/concept-00b55ff0f7a3581b/");
  const toc = page.locator("[data-article-toc], .article-toc");
  await expect(toc).toHaveCount(1);
  await expect.poll(() => toc.evaluate((element) => (
    element.parentElement?.hasAttribute("data-toc-rail-slot")
  ))).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => toc.evaluate((element) => (
    element.parentElement?.hasAttribute("data-toc-inline-slot")
  ))).toBe(true);

  const firstLink = toc.locator('a[href^="#"]').first();
  const targetId = decodeURIComponent((await firstLink.getAttribute("href")).slice(1));
  await firstLink.click();
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe(targetId);
  await expect(toc.locator('[aria-current="location"]')).toHaveCount(1);
});

test("relationship tabs label one panel and expand their full record set", async ({ page }) => {
  await page.goto("/analyses/edsac은-무엇의-최초인가/");
  const explorer = page.locator("[data-relationship-explorer]");
  const guide = explorer.getByRole("tab", { name: /읽기/ });
  const panel = explorer.locator("[data-relationship-panel], #relationship-channel-panel");
  const list = explorer.locator("[data-relationship-list]");
  const toggle = explorer.locator("[data-relationship-toggle]");
  const status = explorer.locator("[data-relationship-status]");

  await guide.click();
  await expect(panel).toHaveAttribute("aria-labelledby", await guide.getAttribute("id"));
  const counts = (await status.textContent()).match(/(\d+)\/(\d+)개/);
  expect(counts).toBeTruthy();
  const previewCount = Number(counts[1]);
  const totalCount = Number(counts[2]);
  expect(totalCount).toBeGreaterThan(previewCount);
  await expect(list.locator(":scope > li")).toHaveCount(previewCount);
  await expect(toggle).toBeVisible();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(list.locator(":scope > li")).toHaveCount(totalCount);
  await expect(status).toContainText(`${totalCount}/${totalCount}개`);

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(list.locator(":scope > li")).toHaveCount(previewCount);
});

test("history events retain exactly one roving tab stop", async ({ page }) => {
  await page.goto("/map/history/");
  const events = page.locator('[data-history-action="event"]');
  await expect(events.first()).toBeVisible();
  await expect(page.locator('[data-history-action="event"][tabindex="0"]')).toHaveCount(1);

  const focusable = page.locator('[data-history-action="event"][tabindex="0"]');
  await focusable.focus();
  await focusable.press("End");
  await expect(page.locator('[data-history-action="event"][tabindex="0"]')).toHaveCount(1);
  await expect(page.locator('[data-history-action="event"][tabindex="0"]')).toBeFocused();

  const transition = page.locator('[data-history-action="transition"]').first();
  if (await transition.isVisible()) {
    await transition.click();
    await expect(page.locator('[data-history-action="event"][tabindex="0"]')).toHaveCount(1);
  }
});

test("evidence search cancels stale results when the query becomes too short", async ({ page }) => {
  await page.goto("/map/evidence/");
  const root = page.locator("[data-evidence-lens]");
  const input = page.locator("[data-evidence-search]");
  const results = page.locator("[data-evidence-search-results]");

  await input.fill("튜링");
  await expect(results.locator("[role=option]").first()).toBeVisible();
  await expect(root).toHaveAttribute("data-evidence-search-state", "results");
  await expect(input).toHaveAttribute("aria-expanded", "true");

  await input.press("ArrowDown");
  const activeId = await input.getAttribute("aria-activedescendant");
  expect(activeId).toBeTruthy();
  await expect(page.locator(`#${activeId}`)).toHaveAttribute("aria-selected", "true");

  await input.fill("튜");
  await expect(root).toHaveAttribute("data-evidence-search-state", "idle");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(input).not.toHaveAttribute("aria-activedescendant", /.+/);
  await expect(results.locator("[role=option]")).toHaveCount(0);
});

test("connection explorer starts neutral and computes examples only on request", async ({ page }) => {
  await page.goto("/map/");
  const form = page.locator("[data-connection-form]");
  const from = page.locator("[data-connection-from]");
  const to = page.locator("[data-connection-to]");
  const results = page.locator("[data-connection-results]");
  const example = page.locator("[data-connection-example]");

  await expect(form).toBeVisible();
  await expect(from).toHaveValue("");
  await expect(to).toHaveValue("");
  await expect(results.getByRole("heading", { name: "두 문서를 선택해 주세요." })).toBeVisible();
  await expect(example).toBeEnabled();
  expect(new URL(page.url()).searchParams.has("from")).toBe(false);
  expect(new URL(page.url()).searchParams.has("to")).toBe(false);

  await example.click();
  await expect(from).not.toHaveValue("");
  await expect(to).not.toHaveValue("");
  await expect(results.locator("[data-connection-route]")).toBeVisible();
  const routeTabs = page.locator("[data-connection-route-tabs]");
  const tabs = routeTabs.getByRole("tab");
  await expect(tabs.first()).toBeVisible();
  expect(await tabs.count()).toBeGreaterThan(1);
  await expect(routeTabs.locator('[role="tab"][aria-selected="true"]')).toHaveCount(1);
  const firstTab = tabs.first();
  await expect(results).toHaveAttribute("role", "tabpanel");
  await expect(results).toHaveAttribute("aria-labelledby", await firstTab.getAttribute("id"));
  await firstTab.focus();
  await firstTab.press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(1)).toHaveAttribute("tabindex", "0");
  await expect(results).toHaveAttribute("aria-labelledby", await tabs.nth(1).getAttribute("id"));
  const fromId = new URL(page.url()).searchParams.get("from");
  expect(fromId).toBeTruthy();

  await page.goto(`/map/?from=${encodeURIComponent(fromId)}`);
  await expect(from).not.toHaveValue("");
  await expect(to).toHaveValue("");
  await expect(results.getByRole("heading", { name: "도착 문서를 선택해 주세요." })).toBeVisible();
  await expect(to).toBeFocused();
});

test("listing filters search the complete dataset and reset to the static page", async ({ page }) => {
  await page.goto("/analyses/page/2/");
  const listing = page.locator("[data-listing]");
  const grid = listing.locator("[data-list-grid]");
  const pagination = listing.locator("[data-list-pagination]");
  const query = listing.locator("[data-list-query]");
  const sort = listing.locator("[data-list-sort]");
  const reset = listing.locator("[data-list-reset]");
  const staticTitles = await grid.locator("[data-document-card] h3").allTextContents();
  const payload = await page.evaluate(async () => {
    const root = document.querySelector("[data-listing]");
    return fetch(root.dataset.listDataUrl).then((response) => response.json());
  });
  const outsideCurrentPage = payload.items.find((item) => !staticTitles.includes(item.title));
  expect(outsideCurrentPage).toBeTruthy();

  await query.fill(outsideCurrentPage.title);
  await expect(grid.getByRole("link", { name: outsideCurrentPage.title, exact: true })).toBeVisible();
  await expect(pagination).toBeHidden();
  await expect(listing.locator("[data-list-count]")).toContainText(`${payload.total}개 중`);
  await expect(reset).toBeVisible();

  await reset.click();
  await expect(pagination).toBeVisible();
  await expect(grid.locator("[data-document-card] h3")).toHaveText(staticTitles);

  await sort.selectOption("title");
  await expect(grid.locator("[data-document-card]")).toHaveCount(payload.total);
  await expect(grid.locator("[data-document-card] h3").first()).toHaveText(
    [...payload.items].sort((left, right) => left.title.localeCompare(right.title, "ko"))[0].title
  );
  await expect(pagination).toBeHidden();
});

test("evidence hub keeps search but disables filters that need a selected focus", async ({ page }) => {
  await page.goto("/map/evidence/");
  const root = page.locator("[data-evidence-lens]");
  const scope = page.locator("[data-evidence-scope]");
  const preservation = page.locator("[data-evidence-preservation]");

  await expect(root).toHaveAttribute("data-evidence-filter-state", "unavailable");
  await expect(scope).toBeDisabled();
  await expect(scope.locator("..")).toBeHidden();
  await expect(preservation).toBeDisabled();
  await expect(preservation.locator("..")).toBeHidden();
  await expect(page.locator("[data-evidence-status]")).toContainText("검색으로 계보를 선택");

  await page.locator("[data-evidence-search]").fill("튜링");
  const option = page.locator("[data-evidence-search-results] [role=option]").first();
  await expect(option).toBeVisible();
  await option.click();
  await expect(page.locator("[data-evidence-lens]")).toHaveAttribute("data-evidence-filter-state", "available");
  await expect(page.locator("[data-evidence-scope]")).toBeEnabled();
  await expect(page.locator("[data-evidence-preservation]")).toBeEnabled();
});

test("JavaScript-only example and relationship controls stay hidden without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/map/");
  await expect(page.locator("[data-connection-example]")).toBeHidden();
  await page.goto("/analyses/edsac은-무엇의-최초인가/");
  await expect(page.locator("[data-relationship-toggle]")).toBeHidden();
  await context.close();
});

test("open global search has no serious automated accessibility violations", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-open-search]").first().click();
  await page.locator("[data-search-input]").fill("튜링 기계");
  await expect(page.locator("[data-search-results] [role=option]").first()).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include("[data-search-dialog]")
    .analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
  expect(serious, serious.map((item) => item.id).join(", ")).toEqual([]);
});

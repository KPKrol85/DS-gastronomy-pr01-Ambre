import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const rootDir = process.cwd();
const host = "127.0.0.1";
const port = Number(process.env.QA_MOBILE_NAV_PORT || 4184);
const baseUrl = `http://${host}:${port}`;
const toggleSelector = ".site-header__nav-toggle";
const drawerSelector = ".site-header__drawer";
const firstControlSelector = `${drawerSelector} .site-header__drawer-inner > ul > li:first-child > a`;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
  [".ico", "image/x-icon"]
]);

const createStaticServer = () => {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", baseUrl);
    const requestedPath = decodeURIComponent(url.pathname);
    const normalizedPath = requestedPath === "/" ? "/index.html" : requestedPath;
    const filePath = path.resolve(rootDir, normalizedPath.replace(/^\/+/, ""));
    const pathFromRoot = path.relative(rootDir, filePath);

    if (pathFromRoot.startsWith("..") || path.isAbsolute(pathFromRoot)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }

    const contentType = mimeTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve(server));
  });
};

const assertFocus = async (control, label) => {
  assert.equal(await control.isVisible(), true, `${label}: expected control must be visible`);
  assert.equal(await control.isEnabled(), true, `${label}: expected control must be enabled`);
  assert.equal(await control.evaluate((element) => document.activeElement === element), true,
    `${label}: focus must be on the expected control`);
};

const assertDrawerState = async (page, open, label) => {
  await page.waitForFunction((expected) =>
    document.body.classList.contains("site-header-nav-open") === expected, open);
  const state = await page.evaluate(() => ({
    bodyOpen: document.body.classList.contains("site-header-nav-open"),
    drawerHidden: document.querySelector(".site-header__drawer").hidden,
    overlayHidden: document.querySelector(".site-header__overlay").hidden,
    drawerAriaHidden: document.querySelector(".site-header__drawer").getAttribute("aria-hidden"),
    toggleExpanded: document.querySelector(".site-header__nav-toggle").getAttribute("aria-expanded")
  }));
  assert.deepEqual(state, {
    bodyOpen: open,
    drawerHidden: !open,
    overlayHidden: !open,
    drawerAriaHidden: String(!open),
    toggleExpanded: String(open)
  }, `${label}: body, hidden and ARIA states must agree`);
  assert.equal(await page.locator(drawerSelector).isVisible(), open, `${label}: drawer visibility`);
  assert.equal(await page.locator(".site-header__overlay").isVisible(), open, `${label}: overlay visibility`);
  assert.equal(await page.locator(".site-header__overlay").evaluate((element) =>
    getComputedStyle(element).pointerEvents), open ? "auto" : "none", `${label}: overlay active state`);
};

const openDrawer = async (page, label) => {
  await page.locator(toggleSelector).focus();
  await assertFocus(page.locator(toggleSelector), `${label}: opener`);
  await page.keyboard.press("Enter");
  await assertDrawerState(page, true, label);
  await assertFocus(page.locator(firstControlSelector), `${label}: initial focus`);
};

// Discover the real drawer controls independently of the application helper.
// CSS-hidden submenu links must never become expected keyboard destinations.
const readDrawerControls = async (page) => {
  const controls = [];
  for (const control of await page.locator(`${drawerSelector} a[href], ${drawerSelector} button`).all()) {
    if (await control.isVisible() && await control.isEnabled() &&
        await control.evaluate((element) => element.tabIndex >= 0 && !element.closest("[inert], [aria-hidden='true']"))) {
      controls.push(control);
    }
  }
  assert.ok(controls.length > 1, "Drawer must expose multiple available controls");
  return controls;
};

const assertTraversal = async (page, label) => {
  const controls = await readDrawerControls(page);
  const startIndex = await Promise.all(controls.map((control) =>
    control.evaluate((element) => element === document.activeElement))).then((matches) => matches.indexOf(true));
  assert.ok(startIndex >= 0, `${label}: traversal must start on an available drawer control`);

  for (const [key, direction] of [["Tab", 1], ["Shift+Tab", -1]]) {
    for (let step = 1; step <= controls.length; step += 1) {
      const index = (startIndex + direction * step + controls.length) % controls.length;
      await page.keyboard.press(key);
      await assertFocus(controls[index], `${label}: ${key}, step ${step}/${controls.length}`);
    }
  }
};

const assertCollapsedSubmenus = async (page, label) => {
  const items = page.locator(`${drawerSelector} .site-header__item--has-submenu`);
  assert.equal(await items.count(), 2, `${label}: both shipped submenus must be tested`);
  for (const item of await items.all()) {
    assert.equal(await item.locator("button").getAttribute("aria-expanded"), "false", `${label}: collapsed ARIA`);
    assert.equal(await item.evaluate((element) => element.classList.contains("site-header__item--accordion-open")),
      false, `${label}: collapsed accordion state`);
    assert.equal(await item.locator("ul").isVisible(), false, `${label}: collapsed submenu visibility`);
    for (const link of await item.locator("ul a").all()) {
      assert.equal(await link.isVisible(), false, `${label}: collapsed links must be unavailable`);
    }
  }
};

const runKeyboardTest = async (page) => {
  await openDrawer(page, "Enter opens drawer");
  await assertCollapsedSubmenus(page, "Initial submenus");
  await assertTraversal(page, "Collapsed drawer traversal and wrapping");

  for (const [index, item] of (await page.locator(`${drawerSelector} .site-header__item--has-submenu`).all()).entries()) {
    const label = `Submenu ${index + 1}`;
    const trigger = item.locator("button");
    const controls = await readDrawerControls(page);
    // Reach the trigger only through ordinary Tab input.
    for (let step = 0; step < controls.length; step += 1) {
      if (await trigger.evaluate((element) => element === document.activeElement)) break;
      await page.keyboard.press("Tab");
    }
    await assertFocus(trigger, `${label}: trigger reached by keyboard`);
    await page.keyboard.press("Enter");
    assert.equal(await trigger.getAttribute("aria-expanded"), "true", `${label}: expanded ARIA`);
    await item.locator("ul").waitFor({ state: "visible" });
    assert.equal(await item.evaluate((element) => element.classList.contains("site-header__item--accordion-open")),
      true, `${label}: expanded accordion state`);
    await page.keyboard.press("Tab");
    await assertFocus(item.locator("ul a").first(), `${label}: expanded link reached by Tab`);
    await page.keyboard.press("Shift+Tab");
    await assertFocus(trigger, `${label}: reverse traversal from link`);
    await assertTraversal(page, `${label}: expanded traversal and wrapping`);
    await page.keyboard.press("Enter");
    await assertCollapsedSubmenus(page, `${label}: keyboard collapse`);
    await assertTraversal(page, `${label}: collapsed links skipped`);
  }

  await page.keyboard.press("Escape");
  await assertDrawerState(page, false, "Escape closes drawer");
  await assertFocus(page.locator(toggleSelector), "Escape returns focus to opener");
};

const runDismissalTest = async (page) => {
  for (let cycle = 1; cycle <= 4; cycle += 1) {
    const label = `Open/close cycle ${cycle}`;
    await openDrawer(page, label);
    await assertCollapsedSubmenus(page, label);
    await assertTraversal(page, `${label}: one keyboard step per control`);
    if (cycle % 2) {
      await page.locator(".site-header__overlay").click({ position: { x: 5, y: 422 } });
    } else {
      await page.keyboard.press("Escape");
    }
    await assertDrawerState(page, false, `${label}: dismissal`);
    await assertFocus(page.locator(toggleSelector), `${label}: focus return`);
    await page.keyboard.press("Shift+Tab");
    await assertFocus(page.locator(".site-header__theme-toggle"), `${label}: closed drawer must release Tab trap`);
  }
};

const runResponsiveTest = async (page) => {
  await openDrawer(page, "Responsive opening at 390px");
  await page.setViewportSize({ width: 938, height: 844 });
  await assertDrawerState(page, true, "938px retains open mobile drawer");
  await page.setViewportSize({ width: 939, height: 844 });
  await assertDrawerState(page, false, "939px JavaScript transition closes drawer");
  await assertFocus(page.locator(toggleSelector), "939px responsive close restores focus");
  const boundary = await page.evaluate(() => ({
    jsDesktop: matchMedia("(min-width: 939px)").matches,
    cssDesktop: matchMedia("(min-width: 940px)").matches,
    toggleDisplay: getComputedStyle(document.querySelector(".site-header__nav-toggle")).display,
    navListDisplay: getComputedStyle(document.querySelector("#site-header-nav > ul")).display
  }));
  assert.deepEqual(boundary, {
    jsDesktop: true, cssDesktop: false, toggleDisplay: "flex", navListDisplay: "none"
  }, "939px must preserve the existing JavaScript/CSS boundary difference");
  console.log("QA MOBILE NAV E2E: NOTE — at 939px JavaScript closes the drawer while CSS still shows the mobile toggle and hides desktop links");

  await page.setViewportSize({ width: 940, height: 844 });
  await assertDrawerState(page, false, "940px desktop drawer state");
  assert.equal(await page.locator(toggleSelector).isVisible(), false, "940px hides mobile toggle");
  assert.equal(await page.locator("#site-header-nav > ul").isVisible(), true, "940px shows desktop navigation");
  await page.locator(".site-header__brand").focus();
  for (const [index, link] of (await page.locator("#site-header-nav a[href]").all()).entries()) {
    // Parent-link focus reveals desktop submenu links through a CSS transition.
    // Wait for that real visibility state before asking Tab to enter the submenu.
    await link.waitFor({ state: "visible" });
    await page.keyboard.press("Tab");
    await assertFocus(link, `940px desktop link ${index + 1}, including focus-within submenus`);
  }
  await page.keyboard.press("Tab");
  await assertFocus(page.locator(".site-header__actions a[href^='tel:']"), "940px Tab leaves desktop navigation normally");
  await page.keyboard.press("Shift+Tab");
  await assertFocus(page.locator("#site-header-nav a[href]").last(), "940px reverse traversal returns to desktop navigation");
};

const scenarios = [
  { label: "keyboard activation, traversal, submenus and Escape", run: runKeyboardTest },
  { label: "overlay dismissal, reopening and repeated keyboard lifecycle", run: runDismissalTest },
  { label: "938/939px responsive close and 940px desktop keyboard navigation", run: runResponsiveTest }
];

const runScenario = async (browser, scenario) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  try {
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.setDefaultTimeout(10000);
    await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
    await page.locator("#demo-legal-modal:not([hidden])").waitFor({ state: "visible" });
    await page.locator("[data-demo-legal-accept]").click();
    await page.locator("#demo-legal-modal").waitFor({ state: "hidden" });
    await page.locator(`${drawerSelector} .site-header__drawer-trigger`).first().waitFor({ state: "attached" });
    await assertDrawerState(page, false, "Accepted demo dialog, initial drawer state");
    await scenario.run(page);
    assert.deepEqual(runtimeErrors, [], "Navigation scenario must not raise runtime errors");
  } catch (error) {
    throw new Error(`${scenario.label}: ${error.message}`, { cause: error });
  } finally {
    await context.close();
  }
};

const run = async () => {
  console.log("QA MOBILE NAV E2E: starting static server...");
  const server = await createStaticServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const scenario of scenarios) {
      console.log(`QA MOBILE NAV E2E: ${scenario.label}`);
      await runScenario(browser, scenario);
    }
    console.log(`QA MOBILE NAV E2E: PASS (${scenarios.length}/${scenarios.length} scenarios)`);
  } finally {
    try {
      if (browser) await browser.close();
    } finally {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
        server.closeAllConnections();
      });
    }
  }
};

run().catch((error) => {
  console.error("QA MOBILE NAV E2E: ERROR");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});

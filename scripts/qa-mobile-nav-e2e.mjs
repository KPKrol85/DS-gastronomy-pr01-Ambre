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
// Ordinary focus targets across the background whenever the drawer is closed.
const backgroundFocusTargets = [
  ".skip-link",
  ".site-header__brand",
  ".site-header__theme-toggle",
  toggleSelector,
  ".site-hero a[href]",
  "#booking-form #name",
  "#footer a[href]"
];
const backgroundBaselines = new WeakMap();
const axSessions = new WeakMap();

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

// Every body child except the drawer and its dismissal overlay is background content.
const readBackgroundInertness = (page) =>
  page.evaluate(() => {
    const drawer = document.getElementById("mobile-drawer");
    const overlay = document.querySelector(".site-header__overlay");
    return Array.from(document.body.children)
      .filter((element) => element !== drawer && element !== overlay)
      .map((element) => ({
        element: element.id ? `${element.localName}#${element.id}` : [element.localName, ...element.classList].slice(0, 2).join("."),
        inert: element.hasAttribute("inert")
      }));
  });

const recordBackgroundBaseline = async (page, label) => {
  const baseline = await readBackgroundInertness(page);
  // The closed demo dialog is already inert, so closing the drawer must restore earlier inertness rather than clear it.
  assert.deepEqual(baseline.filter(({ inert }) => inert).map(({ element }) => element), ["div#demo-legal-modal"],
    `${label}: only the closed demo dialog may be inert before the drawer opens`);
  backgroundBaselines.set(page, baseline);
};

const axValue = (value) => value?.value ?? "";

// Reads Chromium's own accessibility tree, as in the no-JavaScript and gallery status regressions.
const readAccessibilityExposure = async (page) => {
  const session = axSessions.get(page);
  const { root } = await session.send("DOM.getDocument", { depth: 0 });
  const { nodeId } = await session.send("DOM.querySelector", { nodeId: root.nodeId, selector: drawerSelector });
  const { node } = await session.send("DOM.describeNode", { nodeId });
  const { nodes } = await session.send("Accessibility.getFullAXTree");
  const byId = new Map(nodes.map((axNode) => [axNode.nodeId, axNode]));
  const drawerNode = nodes.find((axNode) => axNode.backendDOMNodeId === node.backendNodeId && axNode.ignored !== true);
  const isInsideDrawer = (axNode) => {
    for (let current = axNode; current; current = byId.get(current.parentId)) {
      if (current === drawerNode) return true;
    }
    return false;
  };
  const exposed = nodes.filter((axNode) => axNode.ignored !== true);
  return {
    drawerNode,
    drawerRoles: exposed.filter(isInsideDrawer).map((axNode) => axValue(axNode.role)),
    outside: exposed.filter((axNode) => axValue(axNode.role) !== "RootWebArea" && !isInsideDrawer(axNode))
  };
};

const assertAccessibilityIsolation = async (page, open, label) => {
  const { drawerNode, drawerRoles, outside } = await readAccessibilityExposure(page);
  if (!open) {
    assert.equal(drawerNode, undefined, `${label}: closed drawer must leave the accessibility tree`);
    const roles = new Set(outside.map((axNode) => axValue(axNode.role)));
    for (const role of ["banner", "main", "contentinfo", "link", "button", "textbox"]) {
      assert.ok(roles.has(role), `${label}: background ${role} must be exposed again`);
    }
    return;
  }

  assert.deepEqual({
    role: axValue(drawerNode?.role),
    name: axValue(drawerNode?.name),
    modal: drawerNode?.properties?.find((property) => property.name === "modal")?.value.value
  }, { role: "dialog", name: "Nawigacja mobilna", modal: true }, `${label}: drawer must be exposed as a named modal dialog`);
  assert.ok(drawerRoles.filter((role) => role === "link").length > 1 && drawerRoles.includes("button"),
    `${label}: drawer links and submenu triggers must stay exposed`);
  assert.deepEqual(outside.map((axNode) => [axValue(axNode.role), axValue(axNode.name)]), [["generic", ""]],
    `${label}: background landmarks and controls must leave the accessibility tree`);
  const { node: overlay } = await axSessions.get(page).send("DOM.describeNode", { backendNodeId: outside[0].backendDOMNodeId });
  assert.deepEqual([overlay.localName, overlay.attributes], ["div", ["class", "site-header__overlay"]],
    `${label}: only the unnamed dismissal overlay may remain outside the drawer`);
};

const assertBackgroundFocus = async (page, open, label) => {
  const result = await page.evaluate((selectors) => {
    const before = document.activeElement;
    const attempts = selectors.map((selector) => {
      const element = document.querySelector(selector);
      element.focus({ preventScroll: true });
      return { selector, inert: Boolean(element.closest("[inert]")), focused: document.activeElement === element };
    });
    return {
      attempts,
      focusStayed: document.activeElement === before,
      focusInDrawer: Boolean(document.activeElement.closest(".site-header__drawer"))
    };
  }, backgroundFocusTargets);
  assert.deepEqual(result.attempts, backgroundFocusTargets.map((selector) => ({ selector, inert: open, focused: !open })),
    `${label}: background controls must ${open ? "reject" : "accept"} programmatic focus`);
  if (open) {
    assert.deepEqual([result.focusStayed, result.focusInDrawer], [true, true],
      `${label}: rejected background focus must leave focus on the drawer control`);
  }
};

const assertDrawerState = async (page, open, label) => {
  await page.waitForFunction((expected) =>
    document.body.classList.contains("site-header-nav-open") === expected, open);
  const state = await page.evaluate(() => {
    const toggle = document.querySelector(".site-header__nav-toggle");
    const drawer = document.querySelector(".site-header__drawer");
    const controls = toggle.getAttribute("aria-controls");
    return {
      toggleControls: controls,
      controlsDrawer: document.getElementById(controls) === drawer,
      bodyOpen: document.body.classList.contains("site-header-nav-open"),
      bodyScrollLocked: ["hidden", "clip"].includes(getComputedStyle(document.body).overflowY),
      bodyTouchBlocked: getComputedStyle(document.body).touchAction === "none",
      drawerHidden: drawer.hidden,
      overlayHidden: document.querySelector(".site-header__overlay").hidden,
      drawerAriaHidden: drawer.getAttribute("aria-hidden"),
      drawerRole: drawer.getAttribute("role"),
      drawerAriaModal: drawer.getAttribute("aria-modal"),
      drawerInert: Boolean(drawer.closest("[inert]")),
      overlayInert: Boolean(document.querySelector(".site-header__overlay").closest("[inert]")),
      toggleExpanded: toggle.getAttribute("aria-expanded")
    };
  });
  assert.deepEqual(state, {
    toggleControls: "mobile-drawer",
    controlsDrawer: true,
    bodyOpen: open,
    bodyScrollLocked: open,
    bodyTouchBlocked: open,
    drawerHidden: !open,
    overlayHidden: !open,
    drawerAriaHidden: String(!open),
    drawerRole: "dialog",
    drawerAriaModal: open ? "true" : null,
    drawerInert: false,
    overlayInert: false,
    toggleExpanded: String(open)
  }, `${label}: controlled drawer, body, scroll lock, hidden, modal and ARIA states must agree`);
  const baseline = backgroundBaselines.get(page);
  assert.deepEqual(await readBackgroundInertness(page), open ? baseline.map(({ element }) => ({ element, inert: true })) : baseline,
    `${label}: ${open ? "the whole background must be inert" : "closing must restore the original background inertness"}`);
  await assertAccessibilityIsolation(page, open, label);
  assert.equal(await page.locator(drawerSelector).isVisible(), open, `${label}: drawer visibility`);
  assert.equal(await page.locator(".site-header__overlay").isVisible(), open, `${label}: overlay visibility`);
  assert.equal(await page.locator(".site-header__overlay").evaluate((element) =>
    getComputedStyle(element).pointerEvents), open ? "auto" : "none", `${label}: overlay active state`);
};

const openDrawer = async (page, label, { pointer = false } = {}) => {
  if (pointer) {
    await page.locator(toggleSelector).click();
  } else {
    await page.locator(toggleSelector).focus();
    await assertFocus(page.locator(toggleSelector), `${label}: opener`);
    await page.keyboard.press("Enter");
  }
  await assertDrawerState(page, true, label);
  await assertFocus(page.locator(firstControlSelector), `${label}: initial focus`);
  await assertBackgroundFocus(page, true, label);
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
    await openDrawer(page, label, { pointer: cycle > 2 });
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
    await assertBackgroundFocus(page, false, `${label}: released background`);
  }

  await openDrawer(page, "Navigation-link activation");
  const expectedHash = await page.locator(firstControlSelector).evaluate((element) => new URL(element.href).hash);
  await page.keyboard.press("Enter");
  await assertDrawerState(page, false, "Navigation-link activation closes the drawer");
  await page.waitForFunction((hash) => location.hash === hash, expectedHash);
  assert.equal(await page.locator(drawerSelector).evaluate((element) => element.contains(document.activeElement)), false,
    "Navigation-link activation must move focus out of the closed drawer");
  await assertBackgroundFocus(page, false, "Navigation-link activation releases the background");
};

const runResponsiveTest = async (page) => {
  await page.setViewportSize({ width: 939, height: 844 });
  assert.equal(await page.locator(toggleSelector).isVisible(), true, "939px shows mobile toggle");
  assert.equal(await page.locator("#site-header-nav > ul").isVisible(), false, "939px hides desktop navigation");
  await openDrawer(page, "Opening at the 939px mobile boundary");
  await assertTraversal(page, "939px mobile keyboard containment");

  await page.setViewportSize({ width: 940, height: 844 });
  await assertDrawerState(page, false, "939px to 940px closes the drawer completely");
  assert.equal(await page.locator(toggleSelector).isVisible(), false, "940px hides mobile toggle");
  assert.equal(await page.locator("#site-header-nav > ul").isVisible(), true, "940px shows desktop navigation");
  await assertFocus(page.locator(".site-header__brand"), "Desktop entry moves focus to the visible header logo link");
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
  const scrollY = await page.evaluate(() => window.scrollY);
  await page.mouse.move(10, 600);
  await page.mouse.wheel(0, 300);
  await page.waitForFunction((previous) => window.scrollY > previous, scrollY);

  await page.setViewportSize({ width: 939, height: 844 });
  await assertDrawerState(page, false, "Returning to 939px keeps the drawer closed");
  assert.equal(await page.locator(toggleSelector).isVisible(), true, "Returning to 939px restores the mobile toggle");
  assert.equal(await page.locator("#site-header-nav > ul").isVisible(), false, "Returning to 939px hides desktop navigation");
  await openDrawer(page, "Reopening at 939px after desktop closure");
  await assertTraversal(page, "Reopened 939px drawer retains keyboard containment");
  await page.keyboard.press("Escape");
  await assertDrawerState(page, false, "Escape closes reopened mobile drawer");
  await assertFocus(page.locator(toggleSelector), "Reopened mobile drawer restores focus to its opener");

  await page.setViewportSize({ width: 390, height: 844 });
  await openDrawer(page, "Responsive opening at 390px");
  await page.setViewportSize({ width: 938, height: 844 });
  await assertDrawerState(page, true, "938px retains open mobile drawer");
  await page.setViewportSize({ width: 939, height: 844 });
  await assertDrawerState(page, true, "939px retains open mobile drawer");
  await assertFocus(page.locator(firstControlSelector), "Mobile resizing preserves drawer focus");
  await page.setViewportSize({ width: 940, height: 844 });
  await assertDrawerState(page, false, "Repeated desktop entry clears drawer state");
  await assertFocus(page.locator(".site-header__brand"), "Repeated desktop entry restores visible focus");
  await page.keyboard.press("Tab");
  await assertFocus(page.locator("#site-header-nav a[href]").first(), "Repeated desktop entry releases the Tab trap");

  // The open modal drawer makes header controls inert, so focusing one must leave focus in the drawer.
  await page.setViewportSize({ width: 939, height: 844 });
  await openDrawer(page, "Responsive closure after a rejected header focus");
  await page.locator(".site-header__theme-toggle").focus();
  await assertFocus(page.locator(firstControlSelector), "Inert header control cannot take focus from the open drawer");
  await page.setViewportSize({ width: 940, height: 844 });
  await assertDrawerState(page, false, "Desktop entry from the modal drawer clears drawer state");
  await assertFocus(page.locator(".site-header__brand"), "Desktop entry from the modal drawer restores visible header focus");

  // A visible header control can hold focus only while the drawer is closed; desktop entry must keep it.
  await page.setViewportSize({ width: 939, height: 844 });
  await assertDrawerState(page, false, "Returning to 939px after modal release");
  await page.locator(".site-header__theme-toggle").focus();
  await assertFocus(page.locator(".site-header__theme-toggle"), "Released header control accepts focus at 939px");
  await page.setViewportSize({ width: 940, height: 844 });
  await assertDrawerState(page, false, "Desktop entry with visible focus keeps drawer state clear");
  await assertFocus(page.locator(".site-header__theme-toggle"), "Desktop entry preserves an already visible header focus");
  await page.keyboard.press("Shift+Tab");
  await assertFocus(page.locator(".site-header__actions a[href^='tel:']"), "Visible header focus traverses normally after desktop closure");

  for (let cycle = 1; cycle <= 3; cycle += 1) {
    const label = `Repeated 939/940px transition ${cycle}`;
    await page.setViewportSize({ width: 939, height: 844 });
    await openDrawer(page, label);
    await page.setViewportSize({ width: 940, height: 844 });
    await assertDrawerState(page, false, `${label}: desktop entry releases modal state`);
    await assertFocus(page.locator(".site-header__brand"), `${label}: desktop entry restores visible header focus`);
  }
  await page.setViewportSize({ width: 939, height: 844 });
  await assertDrawerState(page, false, "Returning to mobile after repeated transitions");
  await assertBackgroundFocus(page, false, "Repeated transitions leave no stale background isolation");
};

const runDemoDialogCoexistenceTest = async (page) => {
  const readNoticeIsolation = () => page.evaluate(() => {
    const notice = document.getElementById("demo-legal-modal");
    const drawer = document.getElementById("mobile-drawer");
    return {
      noticeOpen: !notice.hidden && !notice.hasAttribute("inert"),
      focusOnNoticePanel: document.activeElement === notice.querySelector(".demo-legal-modal__panel"),
      backgroundInert: Array.from(document.body.children).filter((element) => element !== notice)
        .every((element) => element.hasAttribute("inert")),
      drawerOpen: document.body.classList.contains("site-header-nav-open") || !drawer.hidden || drawer.hasAttribute("aria-modal"),
      toggleExpanded: document.querySelector(".site-header__nav-toggle").getAttribute("aria-expanded")
    };
  });
  const noticeOwnsIsolation = {
    noticeOpen: true,
    focusOnNoticePanel: true,
    backgroundInert: true,
    drawerOpen: false,
    toggleExpanded: "false"
  };
  assert.deepEqual(await readNoticeIsolation(), noticeOwnsIsolation,
    "Initialization: the demo dialog opens after the drawer and isolates it with the rest of the background");

  // A programmatic click still reaches the inert toggle's handler, so the drawer itself must decline to open.
  await page.locator(toggleSelector).evaluate((element) => element.click());
  assert.deepEqual(await readNoticeIsolation(), noticeOwnsIsolation,
    "Toggle activation during the demo dialog must not take over its isolation or focus");
  await page.keyboard.press("Tab");
  assert.equal(await page.locator("#demo-legal-modal").evaluate((element) => element.contains(document.activeElement)), true,
    "The demo dialog keeps its own keyboard containment");

  await page.keyboard.press("Escape");
  await page.locator("#demo-legal-modal").waitFor({ state: "hidden" });
  await assertFocus(page.locator("#main"), "Demo dialog dismissal keeps its own focus restoration");
  await recordBackgroundBaseline(page, "Dismissed demo dialog");
  await assertDrawerState(page, false, "Dismissed demo dialog releases the closed drawer");

  await openDrawer(page, "Drawer after demo dialog dismissal");
  await assertTraversal(page, "Drawer after demo dialog dismissal keeps keyboard containment");
  await page.keyboard.press("Escape");
  await assertDrawerState(page, false, "Escape after demo dialog dismissal restores the background");
  await assertFocus(page.locator(toggleSelector), "Drawer after demo dialog dismissal restores focus to its opener");
  assert.deepEqual(await page.locator("#demo-legal-modal").evaluate((element) => [element.hidden, element.getAttribute("aria-hidden")]),
    [true, "true"], "The dismissed demo dialog stays closed after the drawer lifecycle");
};

const scenarios = [
  { label: "keyboard activation, traversal, submenus and Escape", run: runKeyboardTest },
  { label: "overlay dismissal, reopening and repeated keyboard lifecycle", run: runDismissalTest },
  { label: "939/940px drawer lifecycle, mobile reopening and desktop keyboard navigation", run: runResponsiveTest },
  { label: "missing aria-controls fallback and drawer keyboard lifecycle", omitControls: true, run: runKeyboardTest },
  { label: "demo-information dialog isolation during initialization and drawer coexistence", keepNotice: true, run: runDemoDialogCoexistenceTest }
];

const runScenario = async (browser, scenario) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  try {
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.setDefaultTimeout(10000);
    const axSession = await context.newCDPSession(page);
    await axSession.send("DOM.enable");
    await axSession.send("Accessibility.enable");
    axSessions.set(page, axSession);
    if (scenario.omitControls) {
      await page.route(`${baseUrl}/index.html`, async (route) => {
        const response = await route.fetch();
        const html = await response.text();
        assert.match(html, /aria-controls="mobile-drawer"/, "Fallback fixture must remove the shipped relationship");
        await route.fulfill({ response, body: html.replace('aria-controls="mobile-drawer"', "") });
      });
    }
    await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
    await page.locator("#demo-legal-modal:not([hidden])").waitFor({ state: "visible" });
    await page.locator(`${drawerSelector} .site-header__drawer-trigger`).first().waitFor({ state: "attached" });
    if (!scenario.keepNotice) {
      await page.locator("[data-demo-legal-accept]").click();
      await page.locator("#demo-legal-modal").waitFor({ state: "hidden" });
      await recordBackgroundBaseline(page, "Accepted demo dialog");
      await assertDrawerState(page, false, "Accepted demo dialog, initial drawer state");
    }
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

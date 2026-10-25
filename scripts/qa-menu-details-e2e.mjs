import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const rootDir = process.cwd();
const host = "127.0.0.1";
const port = Number(process.env.QA_MENU_DETAILS_PORT || 4186);
const baseUrl = `http://${host}:${port}`;
const panelSelector = "main.page-menu .dish-more";

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

const panel = (page, index) => page.locator(panelSelector).nth(index);
const summary = (page, index) => panel(page, index).locator("summary");

const assertPanels = async (page, expected) => {
  await page.waitForFunction(({ selector, expected }) =>
    Array.from(document.querySelectorAll(selector)).every((item, index) => item.open === expected[index]),
  { selector: panelSelector, expected });
  assert.deepEqual(await page.locator(panelSelector).evaluateAll((items) => items.map((item) => item.open)),
    expected, "Only the expected menu panels may remain open");
};

const observeToggles = (page) => page.evaluate(() => {
  const root = document.querySelector("main.page-menu");
  window.__qaMenuToggles = [];
  window.__qaMenuBubbleCount = 0;
  root.addEventListener("toggle", (event) => {
    if (!event.target.matches(".dish-more")) return;
    window.__qaMenuToggles.push({
      index: Array.from(root.querySelectorAll(".dish-more")).indexOf(event.target),
      open: event.target.open,
      trusted: event.isTrusted,
      bubbles: event.bubbles,
      phase: event.eventPhase
    });
  }, { capture: true });
  root.addEventListener("toggle", () => { window.__qaMenuBubbleCount += 1; });
});

const waitForToggle = (page, index, open) => page.waitForFunction(({ index, open }) =>
  window.__qaMenuToggles.some((event) => event.index === index && event.open === open),
{ index, open });

const scenarios = [
  {
    label: "real initialization and native toggle capture without an outside click",
    run: async (page) => {
      assert.equal(await page.locator("main.page-menu").count(), 1);
      assert.equal(await page.locator("body.page-menu").count(), 0);
      await observeToggles(page);
      await summary(page, 0).click();
      await waitForToggle(page, 0, true);
      await assertPanels(page, [true, false, false, false]);

      // No click is sent: only a real native toggle can enforce exclusivity here.
      await panel(page, 1).evaluate((element) => { element.open = true; });
      await waitForToggle(page, 1, true);
      await waitForToggle(page, 0, false);
      await assertPanels(page, [false, true, false, false]);
      const events = await page.evaluate(() => window.__qaMenuToggles);
      assert.ok(events.length >= 3, "Opening the second panel must also deliver the first panel's close event");
      for (const event of events) {
        assert.equal(event.trusted, true, "Events must originate from the browser, not dispatchEvent");
        assert.equal(event.bubbles, false, "Native details toggle must remain non-bubbling");
        assert.equal(event.phase, 1, "The menu root must receive native toggle during capture");
      }
      assert.equal(await page.evaluate(() => window.__qaMenuBubbleCount), 0);
    }
  },
  {
    label: "mouse activation opens the second panel and retains native closing",
    run: async (page) => {
      await summary(page, 0).click();
      await assertPanels(page, [true, false, false, false]);
      await summary(page, 1).click();
      await assertPanels(page, [false, true, false, false]);
      await summary(page, 1).click();
      await assertPanels(page, [false, false, false, false]);
    }
  },
  {
    label: "Escape, inside clicks and outside clicks within and beyond main",
    run: async (page) => {
      await summary(page, 0).click();
      await panel(page, 0).locator(".dish-more__content").click();
      await assertPanels(page, [true, false, false, false]);
      await summary(page, 0).focus();
      await page.keyboard.press("Escape");
      await assertPanels(page, [false, false, false, false]);
      assert.equal(await summary(page, 0).evaluate((element) => element === document.activeElement), true,
        "Escape must retain summary focus");

      await summary(page, 0).click();
      await page.locator("#menu-title").click();
      await assertPanels(page, [false, false, false, false]);
      await summary(page, 0).click();
      await page.locator("#footer").click({ position: { x: 8, y: 8 } });
      await assertPanels(page, [false, false, false, false]);
    }
  },
  {
    label: "native summary keyboard activation with Enter, Space and Tab",
    run: async (page) => {
      await summary(page, 0).focus();
      await page.keyboard.press("Enter");
      await assertPanels(page, [true, false, false, false]);
      await page.keyboard.press("Space");
      await assertPanels(page, [false, false, false, false]);
      await page.keyboard.press("Space");
      await assertPanels(page, [true, false, false, false]);
      await page.keyboard.press("Tab");
      assert.equal(await page.locator("main.page-menu .dish__thumb").nth(1)
        .evaluate((element) => element === document.activeElement), true,
      "Tab must leave the summary through the native tab order");
      await page.keyboard.press("Tab");
      assert.equal(await summary(page, 1).evaluate((element) => element === document.activeElement), true);
      await page.keyboard.press("Enter");
      await assertPanels(page, [false, true, false, false]);
    }
  },
  {
    label: "filtering and single-image lightbox remain compatible",
    run: async (page) => {
      for (const filter of ["dania-glowne", "desery", "przystawki", "all"]) {
        await page.locator("main.page-menu .dish:not([hidden]) .dish-more summary").first().click();
        await page.locator('.menu__tabs [data-filter="' + filter + '"]').click();
        await assertPanels(page, [false, false, false, false]);
        const state = await page.locator("main.page-menu").evaluate((root) => ({
          pressed: Array.from(root.querySelectorAll(".tabs__tab[aria-pressed='true']")).map((tab) => tab.dataset.filter),
          visible: Array.from(root.querySelectorAll(".dish")).filter((dish) => !dish.hidden).map((dish) => dish.dataset.cat),
          all: Array.from(root.querySelectorAll(".dish")).map((dish) => dish.dataset.cat)
        }));
        assert.deepEqual(state.pressed, [filter]);
        assert.deepEqual(state.visible, state.all.filter((category) => filter === "all" || category === filter));
        assert.ok(state.visible.length > 0);
      }

      await summary(page, 0).click();
      const thumb = page.locator("main.page-menu .dish__thumb").first();
      await thumb.click();
      await page.waitForFunction(() => document.getElementById("lb").open);
      await assertPanels(page, [false, false, false, false]);
      const dialog = page.locator("#lb");
      assert.equal(await dialog.getAttribute("data-lightbox-mode"), "single");
      await page.waitForFunction(() => document.getElementById("lb-img").naturalWidth > 0);
      assert.equal(await dialog.locator(".site-lightbox__counter").isVisible(), false);
      assert.equal(await dialog.locator(".site-lightbox__nav-button--prev").isVisible(), false);
      assert.equal(await dialog.locator(".site-lightbox__nav-button--next").isVisible(), false);
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.getElementById("lb").open && document.body.style.position !== "fixed");
      assert.equal(await thumb.evaluate((element) => element === document.activeElement), true);
      await summary(page, 0).focus();
      await page.keyboard.press("Enter");
      await assertPanels(page, [true, false, false, false]);
    }
  },
  {
    label: "unrelated details and panels outside the menu root stay independent",
    run: async (page) => {
      // Test-only fixtures never modify the source markup.
      await page.evaluate(async () => {
        const outside = document.createElement("details");
        outside.id = "qa-outside-menu";
        outside.className = "dish-more";
        outside.innerHTML = "<summary>Outside fixture</summary><p>Details</p>";
        document.body.append(outside);
        const unrelated = document.createElement("details");
        unrelated.id = "qa-unrelated-details";
        unrelated.innerHTML = "<summary>Unrelated fixture</summary><p>Details</p>";
        document.querySelector("main.page-menu").append(unrelated);
        await Promise.all([outside, unrelated].map((element) => new Promise((resolve) => {
          element.addEventListener("toggle", resolve, { once: true });
          element.open = true;
        })));
      });
      await summary(page, 0).click();
      await assertPanels(page, [true, false, false, false]);
      await page.keyboard.press("Escape");
      await assertPanels(page, [false, false, false, false]);
      assert.equal(await page.locator("#qa-outside-menu").evaluate((element) => element.open), true);
      assert.equal(await page.locator("#qa-unrelated-details").evaluate((element) => element.open), true);

      await summary(page, 0).click();
      await page.locator("#menu-title").click();
      await assertPanels(page, [false, false, false, false]);
      assert.equal(await page.locator("#qa-outside-menu").evaluate((element) => element.open), true);
      assert.equal(await page.locator("#qa-unrelated-details").evaluate((element) => element.open), true);
    }
  },
  {
    label: "native details remain usable with JavaScript disabled",
    javaScriptEnabled: false,
    run: async (page) => {
      assert.equal(await page.locator("body").evaluate((element) => element.classList.contains("no-js")), true);
      await summary(page, 0).click();
      await assertPanels(page, [true, false, false, false]);
      assert.equal(await panel(page, 0).locator(".dish-more__content").isVisible(), true);
      await summary(page, 1).focus();
      await page.keyboard.press("Enter");
      await assertPanels(page, [true, true, false, false]);
      await page.keyboard.press("Space");
      await assertPanels(page, [true, false, false, false]);
      await summary(page, 0).click();
      await assertPanels(page, [false, false, false, false]);
    }
  }
];

const run = async () => {
  console.log("QA MENU DETAILS E2E: starting static server...");
  const server = await createStaticServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const scenario of scenarios) {
      const javaScriptEnabled = scenario.javaScriptEnabled !== false;
      const context = await browser.newContext({
        javaScriptEnabled, serviceWorkers: "block", reducedMotion: "reduce",
        viewport: { width: 1280, height: 900 }
      });
      const runtimeErrors = [];
      try {
        if (javaScriptEnabled) {
          await context.addInitScript(() => { localStorage.setItem("demoLegalAccepted", "true"); });
        }
        const page = await context.newPage();
        page.setDefaultTimeout(10000);
        page.on("pageerror", (error) => runtimeErrors.push(error.message));
        await page.goto(baseUrl + "/menu.html", { waitUntil: "load" });
        await summary(page, 0).waitFor({ state: "visible" });
        assert.equal(await page.locator(panelSelector).count(), 4, "Use the actual menu's native panels");
        if (javaScriptEnabled) {
          await page.locator("html[data-theme-ready]").waitFor({ state: "attached" });
          await page.locator("#demo-legal-modal").waitFor({ state: "hidden" });
        }
        await scenario.run(page);
        assert.deepEqual(runtimeErrors, [], "The page must not produce uncaught runtime errors");
        console.log("QA MENU DETAILS E2E: PASS — " + scenario.label);
      } finally {
        await context.close();
      }
    }
    console.log("QA MENU DETAILS E2E: PASS (" + scenarios.length + "/" + scenarios.length + " scenarios)");
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
};

run().catch((error) => {
  console.error("QA MENU DETAILS E2E: ERROR");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});

import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const rootDir = process.cwd();
const host = "127.0.0.1";
const port = Number(process.env.QA_THEME_PORT || 4185);
const baseUrl = `http://${host}:${port}`;
const toggleSelector = '[data-testid="site-header__theme-toggle"]';

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

const readThemeState = (page) => page.evaluate((selector) => ({
  theme: document.documentElement.getAttribute("data-theme"),
  pressed: document.querySelector(selector)?.getAttribute("aria-pressed"),
  stored: localStorage.getItem("theme")
}), toggleSelector);

const assertThemeState = async (page, theme, stored, label) => {
  const expected = { theme, pressed: String(theme === "dark"), stored };
  try {
    await page.waitForFunction(({ selector, expected }) =>
      document.documentElement.getAttribute("data-theme") === expected.theme &&
      document.querySelector(selector)?.getAttribute("aria-pressed") === expected.pressed &&
      localStorage.getItem("theme") === expected.stored, { selector: toggleSelector, expected });
  } catch (error) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, actual ${JSON.stringify(await readThemeState(page))}`, { cause: error });
  }
  assert.deepEqual(await readThemeState(page), expected, `${label}: data-theme, aria-pressed and storage must agree`);
  console.log(`QA THEME E2E: PASS — ${label}`);
};

const waitForInitialization = async (page) => {
  // This marker is set by the real theme initializer, after its listeners are installed.
  await page.locator("html[data-theme-ready]").waitFor({ state: "attached" });
  await page.locator("#demo-legal-modal").waitFor({ state: "hidden" });
};

const changeSystemPreference = async (page, colorScheme) => {
  // Observe the actual media event before checking an unchanged persisted theme.
  // Otherwise the assertion could pass before the application's listener runs.
  await page.evaluate(() => {
    window.__qaThemeMediaChanged = false;
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      window.__qaThemeMediaChanged = true;
    }, { once: true });
  });
  await page.emulateMedia({ colorScheme });
  await page.waitForFunction((dark) => window.__qaThemeMediaChanged &&
    window.matchMedia("(prefers-color-scheme: dark)").matches === dark, colorScheme === "dark");
  await page.evaluate(() => { delete window.__qaThemeMediaChanged; });
};

const selectWithKeyboard = async (page, theme, label) => {
  const toggle = page.locator(toggleSelector);
  assert.equal(await toggle.isVisible(), true, `${label}: toggle must be visible`);
  assert.equal(await toggle.isEnabled(), true, `${label}: toggle must be enabled`);
  await toggle.focus();
  assert.equal(await toggle.evaluate((element) => document.activeElement === element), true,
    `${label}: keyboard focus must reach the real toggle after dialog acceptance`);
  await page.keyboard.press("Enter");
  await assertThemeState(page, theme, theme, label);
};

const assertPersistence = async (page, theme, label) => {
  await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
  await waitForInitialization(page);
  await assertThemeState(page, theme, theme, `${label}: homepage initializer`);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForInitialization(page);
  await assertThemeState(page, theme, theme, `${label}: homepage reload`);
  await page.goto(`${baseUrl}/menu.html`, { waitUntil: "domcontentloaded" });
  await waitForInitialization(page);
  await assertThemeState(page, theme, theme, `${label}: menu initializer on the same origin`);
};

const runScenario = async (browser, initialScheme) => {
  const label = `fresh ${initialScheme} system preference`;
  const opposite = initialScheme === "light" ? "dark" : "light";
  const context = await browser.newContext({ colorScheme: initialScheme, serviceWorkers: "block" });
  try {
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(`${page.url()}: ${error.message}`));
    page.setDefaultTimeout(10000);

    await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
    await page.locator("html[data-theme-ready]").waitFor({ state: "attached" });
    await page.locator("#demo-legal-modal:not([hidden])").waitFor({ state: "visible" });
    await page.locator("[data-demo-legal-accept]").click();
    await waitForInitialization(page);
    await assertThemeState(page, initialScheme, null, `${label}: initialization without stored theme`);

    await changeSystemPreference(page, opposite);
    await assertThemeState(page, opposite, null, `${label}: system changes to ${opposite}`);
    await changeSystemPreference(page, initialScheme);
    await assertThemeState(page, initialScheme, null, `${label}: system returns to ${initialScheme}`);

    await selectWithKeyboard(page, opposite, `${label}: Enter selects ${opposite}`);
    await assertPersistence(page, opposite, `${label}: saved ${opposite} overrides system ${initialScheme}`);
    await changeSystemPreference(page, opposite);
    await assertThemeState(page, opposite, opposite, `${label}: system agrees with saved ${opposite}`);
    await changeSystemPreference(page, initialScheme);
    await assertThemeState(page, opposite, opposite, `${label}: conflicting system keeps saved ${opposite}`);

    await selectWithKeyboard(page, initialScheme, `${label}: Enter selects opposite saved theme ${initialScheme}`);
    await changeSystemPreference(page, opposite);
    await assertThemeState(page, initialScheme, initialScheme, `${label}: conflicting system keeps saved ${initialScheme}`);
    await assertPersistence(page, initialScheme, `${label}: saved ${initialScheme} overrides system ${opposite}`);

    assert.deepEqual(runtimeErrors, [], `${label}: pages must not raise uncaught runtime exceptions`);
    console.log(`QA THEME E2E: PASS — ${label}: no uncaught runtime errors`);
  } catch (error) {
    throw new Error(`${label}: ${error.message}`, { cause: error });
  } finally {
    await context.close();
  }
};

const run = async () => {
  console.log("QA THEME E2E: starting static server...");
  const server = await createStaticServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const scheme of ["light", "dark"]) {
      console.log(`QA THEME E2E: fresh ${scheme} system preference and persistence lifecycle`);
      await runScenario(browser, scheme);
    }
    console.log("QA THEME E2E: PASS (2/2 isolated scenarios)");
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
  console.error("QA THEME E2E: ERROR");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});

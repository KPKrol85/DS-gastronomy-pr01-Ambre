import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const rootDir = process.cwd();
const host = "127.0.0.1";
const port = Number(process.env.QA_DEMO_LEGAL_PORT || 4177);
const baseUrl = `http://${host}:${port}`;

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
    const relativePath = normalizedPath.replace(/^\/+/, "");
    const filePath = path.resolve(rootDir, relativePath);

    if (!filePath.startsWith(rootDir)) {
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

const createFreshPage = async (browser) => {
  const context = await browser.newContext({ serviceWorkers: "block" });
  await context.addInitScript(() => {
    const initializedKey = "qaDemoLegalInitialized";
    if (sessionStorage.getItem(initializedKey) === "true") return;
    localStorage.removeItem("demoLegalAccepted");
    sessionStorage.setItem(initializedKey, "true");
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
  await page.locator("#demo-legal-modal:not([hidden])").waitFor();
  return { context, page };
};

const readActiveElement = (page) =>
  page.evaluate(() => {
    const active = document.activeElement;
    return {
      id: active?.id || "",
      className: typeof active?.className === "string" ? active.className : "",
      text: active?.textContent?.trim() || ""
    };
  });

const readDialogFocusableLabels = (page) =>
  page.locator("#demo-legal-modal a[href], #demo-legal-modal button:not([disabled])").evaluateAll((elements) => elements.map((element) => element.textContent.trim()));

const runKeyboardModalTest = async (browser) => {
  const { context, page } = await createFreshPage(browser);
  const modal = page.locator("#demo-legal-modal");
  const panel = page.locator(".demo-legal-modal__panel");

  try {
    assert.equal(await panel.evaluate((element) => document.activeElement === element), true, "Initial focus should be on the dialog panel");

    const focusableLabels = await readDialogFocusableLabels(page);
    assert.ok(focusableLabels.length > 1, "The fixture should expose multiple dialog controls");

    await page.keyboard.press("Tab");
    assert.equal((await readActiveElement(page)).text, focusableLabels[0], "Tab from the panel should enter the first dialog control");

    await page.locator("#demo-legal-modal a[href], #demo-legal-modal button:not([disabled])").last().focus();
    await page.keyboard.press("Tab");
    assert.equal((await readActiveElement(page)).text, focusableLabels[0], "Tab should wrap from the last to the first dialog control");

    await page.locator("#demo-legal-modal a[href], #demo-legal-modal button:not([disabled])").first().focus();
    await page.keyboard.press("Shift+Tab");
    assert.equal((await readActiveElement(page)).text, focusableLabels.at(-1), "Shift+Tab should wrap from the first to the last dialog control");

    const isolation = await page.evaluate(() => {
      const modalElement = document.getElementById("demo-legal-modal");
      const siblings = Array.from(document.body.children).filter((element) => element !== modalElement);
      const backgroundControl = document.querySelector(".site-header__theme-toggle");
      const dialogControl = modalElement.querySelector("[data-demo-legal-accept]");
      dialogControl.focus();
      backgroundControl.focus();
      const hitTarget = document.elementFromPoint(10, 10);

      return {
        allSiblingsInert: siblings.every((element) => element.hasAttribute("inert")),
        focusStayedInside: modalElement.contains(document.activeElement),
        pointerHitStayedInside: modalElement.contains(hitTarget)
      };
    });
    assert.deepEqual(isolation, {
      allSiblingsInert: true,
      focusStayedInside: true,
      pointerHitStayedInside: true
    });

    const links = page.locator("#demo-legal-modal a[href]");
    await links.evaluateAll((elements) => elements.forEach((element) => element.setAttribute("tabindex", "-1")));
    const acceptButton = page.locator("[data-demo-legal-accept]");
    await acceptButton.focus();
    await page.keyboard.press("Tab");
    assert.equal(await acceptButton.evaluate((element) => document.activeElement === element), true, "A single dialog control should retain focus on Tab");
    await page.keyboard.press("Shift+Tab");
    assert.equal(await acceptButton.evaluate((element) => document.activeElement === element), true, "A single dialog control should retain focus on Shift+Tab");

    await page.keyboard.press("Escape");
    assert.equal(await modal.getAttribute("hidden"), "", "Escape should close the dialog");
    assert.equal((await readActiveElement(page)).id, "main", "Escape dismissal should focus the existing main content target");
    assert.equal(await page.evaluate(() => localStorage.getItem("demoLegalAccepted")), null, "Escape should not persist acceptance");
    assert.equal(await page.evaluate(() => Array.from(document.body.children).some((element) => element.id !== "demo-legal-modal" && element.hasAttribute("inert"))), false);
  } finally {
    await context.close();
  }
};

const runPersistenceTest = async (browser) => {
  const { context, page } = await createFreshPage(browser);
  const modal = page.locator("#demo-legal-modal");

  try {
    await page.locator("[data-demo-legal-accept]").click();
    assert.equal(await modal.getAttribute("hidden"), "", "Acceptance should close the dialog");
    assert.equal(await page.evaluate(() => localStorage.getItem("demoLegalAccepted")), "true");
    assert.equal((await readActiveElement(page)).id, "main", "Acceptance should focus the existing main content target");

    await page.reload({ waitUntil: "domcontentloaded" });
    assert.equal(await modal.getAttribute("hidden"), "", "Persisted acceptance should keep the dialog closed on reload");
    assert.equal(await modal.getAttribute("aria-hidden"), "true");
  } finally {
    await context.close();
  }
};

const assertNoticeClosed = async (page, label) => {
  const modal = page.locator("#demo-legal-modal");
  assert.equal(await modal.getAttribute("hidden"), "", `${label}: notice must be hidden`);
  assert.equal(await modal.getAttribute("aria-hidden"), "true", `${label}: notice must be hidden from assistive technology`);
  assert.equal(await modal.getAttribute("inert"), "", `${label}: closed notice must be inert`);
  assert.equal(await page.evaluate(() => Array.from(document.body.children).some(
    (element) => element.id !== "demo-legal-modal" && element.hasAttribute("inert")
  )), false, `${label}: background inertness must be released`);
  assert.equal((await readActiveElement(page)).id, "main", `${label}: focus must return to main content`);
  assert.equal(await page.locator("#main").isVisible(), true, `${label}: restored focus target must be visible`);

  const toggle = page.locator(".site-header__theme-toggle");
  await toggle.focus();
  assert.equal(await toggle.evaluate((element) => document.activeElement === element), true,
    `${label}: background control must accept focus`);
  await page.keyboard.press("Tab");
  assert.equal(await modal.evaluate((element) => element.contains(document.activeElement)), false,
    `${label}: closed notice must release keyboard containment`);
};

const runStorageFailureTest = async (browser, operation) => {
  const label = `denied ${operation}`;
  const context = await browser.newContext({ serviceWorkers: "block" });
  try {
    await context.addInitScript((operation) => {
      const original = Storage.prototype[operation];
      Storage.prototype[operation] = function (...args) {
        if (this === window.localStorage) {
          throw new DOMException(`Denied localStorage.${operation}`, operation === "getItem" ? "SecurityError" : "QuotaExceededError");
        }
        return original.apply(this, args);
      };
    }, operation);
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(`${page.url()}: ${error.message}`));
    page.setDefaultTimeout(10000);
    const modal = page.locator("#demo-legal-modal");
    const openModal = page.locator("#demo-legal-modal:not([hidden])");
    const panel = page.locator(".demo-legal-modal__panel");

    await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
    await openModal.waitFor({ state: "visible" });
    assert.equal(await modal.getAttribute("aria-hidden"), "false", `${label}: first visit must open the notice`);
    assert.equal(await modal.getAttribute("inert"), null, `${label}: open notice must be interactive`);
    assert.equal(await panel.evaluate((element) => document.activeElement === element), true,
      `${label}: initial focus must be inside the dialog`);
    assert.equal(await page.evaluate(() => Array.from(document.body.children).filter(
      (element) => element.id !== "demo-legal-modal"
    ).every((element) => element.hasAttribute("inert"))), true, `${label}: open notice must isolate the background`);

    const focusableLabels = await readDialogFocusableLabels(page);
    await page.keyboard.press("Tab");
    assert.equal((await readActiveElement(page)).text, focusableLabels[0], `${label}: Tab must enter the dialog controls`);
    await page.locator("[data-demo-legal-accept]").focus();
    await page.keyboard.press("Enter");
    await assertNoticeClosed(page, `${label}: keyboard acceptance`);
    if (operation === "setItem") {
      assert.equal(await page.evaluate(() => localStorage.getItem("demoLegalAccepted")), null,
        `${label}: failed write must leave acceptance unpersisted`);
    }

    await page.reload({ waitUntil: "domcontentloaded" });
    await openModal.waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    await assertNoticeClosed(page, `${label}: Escape after reload`);

    await page.reload({ waitUntil: "domcontentloaded" });
    await openModal.waitFor({ state: "visible" });
    await page.locator("[data-demo-legal-close]").click({ position: { x: 10, y: 10 } });
    await assertNoticeClosed(page, `${label}: backdrop dismissal after reload`);

    assert.deepEqual(runtimeErrors, [], `${label}: no uncaught runtime errors`);
    console.log(`QA DEMO LEGAL E2E: PASS — ${label}: acceptance, reload, Escape, backdrop, focus and inertness; no uncaught runtime errors`);
  } catch (error) {
    throw new Error(`${label}: ${error.message}`, { cause: error });
  } finally {
    await context.close();
  }
};

const run = async () => {
  console.log("QA DEMO LEGAL E2E: starting static server...");
  const server = await createStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });

    console.log("QA DEMO LEGAL E2E: keyboard modal behavior");
    await runKeyboardModalTest(browser);

    console.log("QA DEMO LEGAL E2E: acceptance persistence");
    await runPersistenceTest(browser);

    for (const operation of ["getItem", "setItem"]) {
      console.log(`QA DEMO LEGAL E2E: denied ${operation}`);
      await runStorageFailureTest(browser, operation);
    }

    console.log("QA DEMO LEGAL E2E: PASS (4/4 isolated scenarios)");
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
  console.error("QA DEMO LEGAL E2E: ERROR");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});

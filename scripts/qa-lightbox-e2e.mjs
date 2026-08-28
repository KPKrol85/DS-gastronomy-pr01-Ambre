import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const rootDir = process.cwd();
const host = "127.0.0.1";
const port = Number(process.env.QA_LIGHTBOX_PORT || 4181);
const baseUrl = `http://${host}:${port}`;
const galleryPage = "galeria.html";

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

const createFreshPage = async (browser, reducedMotion = "no-preference") => {
  const context = await browser.newContext({ reducedMotion, serviceWorkers: "block" });
  await context.addInitScript(() => {
    localStorage.setItem("demoLegalAccepted", "true");
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/${galleryPage}`, { waitUntil: "domcontentloaded" });
  await page.locator(".gallery__grid .gallery__item").first().waitFor({ state: "visible" });
  return { context, page };
};

const galleryItem = (page, index) => page.locator(".gallery__grid .gallery__item").nth(index);

const readState = (page, itemIndex) =>
  page.evaluate((index) => {
    const dialog = document.getElementById("lb");
    const items = Array.from(document.querySelectorAll(".gallery__grid .gallery__item")).filter(
      (item) => !item.hidden && item.offsetParent !== null
    );

    return {
      inlineScrollBehavior: document.documentElement.style.scrollBehavior,
      computedScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      rootStyleAttribute: document.documentElement.getAttribute("style") || "",
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyWidth: document.body.style.width,
      dialogOpen: dialog.open,
      scrollY: window.scrollY,
      counterText: document.getElementById("lb-counter")?.textContent || "",
      visibleItemCount: items.length,
      focusOnItem: document.activeElement === items[index],
      focusOnCloseButton: document.activeElement === dialog.querySelector(".site-lightbox__close")
    };
  }, itemIndex);

const setInlineScrollBehavior = (page, value) =>
  page.evaluate((nextValue) => {
    document.documentElement.style.scrollBehavior = nextValue;
  }, value);

const scrollItemIntoView = async (page, index) => {
  const target = await page.evaluate((itemIndex) => {
    const item = document.querySelectorAll(".gallery__grid .gallery__item")[itemIndex];
    const rect = item.getBoundingClientRect();
    const maxScroll = Math.max(0, Math.round(document.documentElement.scrollHeight - window.innerHeight));
    const desired = Math.round(window.scrollY + rect.top - (window.innerHeight - rect.height) / 2);
    const clamped = Math.min(Math.max(desired, 0), maxScroll);
    window.scrollTo({ top: clamped, behavior: "auto" });
    return clamped;
  }, index);

  await page.waitForFunction((expected) => Math.round(window.scrollY) === expected, target);
  return page.evaluate(() => window.scrollY);
};

const openLightbox = async (page, index) => {
  await galleryItem(page, index).click();
  await page.waitForFunction(() => document.getElementById("lb").open === true);
};

const waitForClosed = (page, expectedScrollY) =>
  page.waitForFunction(
    (expected) =>
      document.getElementById("lb").open === false &&
      document.body.style.position !== "fixed" &&
      Math.round(window.scrollY) === Math.round(expected),
    expectedScrollY
  );

const closePaths = [
  {
    name: "close button",
    run: (page) => page.locator("#lb .site-lightbox__close").click()
  },
  {
    name: "Escape key",
    run: (page) => page.keyboard.press("Escape")
  },
  {
    name: "backdrop click",
    run: async (page) => {
      await page.waitForFunction(() => {
        const rect = document.getElementById("lb").getBoundingClientRect();
        return rect.width > 100 && rect.left > 8 && rect.top > 8;
      });
      await page.mouse.click(4, 4);
    }
  },
  {
    name: "native dialog close",
    run: (page) => page.evaluate(() => document.getElementById("lb").close())
  }
];

const assertOpenState = async (page, itemIndex, scrollTop) => {
  const state = await readState(page, itemIndex);

  assert.equal(state.dialogOpen, true, "The gallery item should open the lightbox dialog");
  assert.equal(state.inlineScrollBehavior, "auto", "The lightbox should apply its temporary root override while open");
  assert.equal(state.computedScrollBehavior, "auto", "The temporary override should win over the stylesheet while open");
  assert.equal(state.bodyPosition, "fixed", "Opening should lock body scrolling");
  assert.equal(state.bodyTop, `-${scrollTop}px`, "The locked body should preserve the current scroll offset");
  assert.equal(state.bodyWidth, "100%");
  assert.equal(state.focusOnCloseButton, true, "Opening should move focus into the dialog");
  assert.equal(
    state.counterText,
    `${itemIndex + 1} / ${state.visibleItemCount}`,
    "The counter should report the selected gallery item"
  );

  return state;
};

const assertRestoredState = async (page, options) => {
  const { itemIndex, scrollTop, priorInlineValue, priorStyleAttribute, expectedComputed, label } = options;
  const state = await readState(page, itemIndex);

  assert.equal(state.dialogOpen, false, `${label}: the dialog should be closed`);
  assert.equal(
    state.inlineScrollBehavior,
    priorInlineValue,
    `${label}: the previous inline root scroll-behavior must be restored exactly`
  );
  assert.equal(
    state.rootStyleAttribute,
    priorStyleAttribute,
    `${label}: the root style attribute must match its pre-open value`
  );
  assert.equal(
    state.computedScrollBehavior,
    expectedComputed,
    `${label}: the effective scroll behavior must fall back to the stylesheet or the restored inline value`
  );
  assert.equal(state.bodyPosition, "", `${label}: body scroll locking must be released`);
  assert.equal(state.bodyTop, "", `${label}: the locked body offset must be released`);
  assert.equal(state.bodyWidth, "", `${label}: the locked body width must be released`);
  assert.equal(state.scrollY, scrollTop, `${label}: the saved scroll position must be restored`);
  assert.equal(state.focusOnItem, true, `${label}: focus must return to the triggering gallery item`);
  assert.equal(state.counterText, "", `${label}: the counter must be cleared`);

  return state;
};

const runCloseScenario = async (browser, scenario) => {
  const { label, priorInlineValue, itemIndex, closePath, reducedMotion = "no-preference" } = scenario;
  const { context, page } = await createFreshPage(browser, reducedMotion);
  const expectedComputed = priorInlineValue || (reducedMotion === "reduce" ? "auto" : "smooth");

  try {
    if (priorInlineValue) await setInlineScrollBehavior(page, priorInlineValue);

    const beforeOpen = await readState(page, itemIndex);
    assert.equal(beforeOpen.inlineScrollBehavior, priorInlineValue, `${label}: unexpected inline value before opening`);
    assert.equal(beforeOpen.computedScrollBehavior, expectedComputed, `${label}: unexpected effective value before opening`);
    assert.equal(beforeOpen.dialogOpen, false);

    const scrollTop = await scrollItemIntoView(page, itemIndex);
    assert.ok(scrollTop > 0, `${label}: the scenario should start from a non-zero scroll position`);

    await openLightbox(page, itemIndex);
    await assertOpenState(page, itemIndex, scrollTop);

    await closePath.run(page);
    await waitForClosed(page, scrollTop);

    await assertRestoredState(page, {
      itemIndex,
      scrollTop,
      priorInlineValue,
      priorStyleAttribute: beforeOpen.rootStyleAttribute,
      expectedComputed,
      label
    });
  } finally {
    await context.close();
  }
};

const runRepeatedSessionsTest = async (browser) => {
  const { context, page } = await createFreshPage(browser);

  try {
    await setInlineScrollBehavior(page, "smooth");
    const beforeOpen = await readState(page, 0);

    for (const [step, closePath] of closePaths.entries()) {
      const itemIndex = step + 1;
      const label = `repeated sessions — item ${itemIndex + 1} closed by ${closePath.name}`;
      const scrollTop = await scrollItemIntoView(page, itemIndex);
      assert.ok(scrollTop > 0, `${label}: the session should start from a non-zero scroll position`);

      await openLightbox(page, itemIndex);
      await assertOpenState(page, itemIndex, scrollTop);

      await closePath.run(page);
      await waitForClosed(page, scrollTop);

      await assertRestoredState(page, {
        itemIndex,
        scrollTop,
        priorInlineValue: "smooth",
        priorStyleAttribute: beforeOpen.rootStyleAttribute,
        expectedComputed: "smooth",
        label
      });
    }
  } finally {
    await context.close();
  }
};

const run = async () => {
  console.log("QA LIGHTBOX E2E: starting static server...");
  const server = await createStaticServer();
  let browser;

  const scenarios = [
    { label: "empty prior inline value — close button", priorInlineValue: "", itemIndex: 0, closePath: closePaths[0] },
    { label: "pre-existing smooth inline value — Escape key", priorInlineValue: "smooth", itemIndex: 1, closePath: closePaths[1] },
    { label: "empty prior inline value — backdrop click", priorInlineValue: "", itemIndex: 2, closePath: closePaths[2] },
    { label: "empty prior inline value — native dialog close", priorInlineValue: "", itemIndex: 3, closePath: closePaths[3] },
    {
      label: "reduced motion, empty prior inline value — close button",
      priorInlineValue: "",
      itemIndex: 4,
      closePath: closePaths[0],
      reducedMotion: "reduce"
    }
  ];

  try {
    browser = await chromium.launch({ headless: true });

    for (const scenario of scenarios) {
      console.log(`QA LIGHTBOX E2E: ${scenario.label}`);
      await runCloseScenario(browser, scenario);
    }

    console.log("QA LIGHTBOX E2E: repeated sessions across every close path");
    await runRepeatedSessionsTest(browser);

    console.log(`QA LIGHTBOX E2E: PASS (${scenarios.length + 1}/${scenarios.length + 1} scenarios)`);
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
  console.error("QA LIGHTBOX E2E: ERROR");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});

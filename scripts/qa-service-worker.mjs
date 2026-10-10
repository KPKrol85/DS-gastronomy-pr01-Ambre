import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const rootDir = process.cwd();
const host = "127.0.0.1";
const harnessPath = "/__sw-cache-ownership-test__.html";
const documentPath = "/menu.html";
const offlinePath = "/offline.html";
const documentMarker = "AMBRE_QA_PRECACHED_DOCUMENT";
const offlineMarker = "AMBRE_QA_OFFLINE_DOCUMENT";
const documentFixtures = new Map([
  [documentPath, { marker: documentMarker }],
  [offlinePath, { marker: offlineMarker }]
].map(([url, { marker }]) => [url, {
  marker,
  html: `<!doctype html><html lang="en"><title>Service Worker document test</title><body>${marker}</body></html>`
}]));

const cacheNames = {
  currentAppShell: "ambre-app-shell-v1.8",
  currentRuntimeImages: "ambre-runtime-img-v1.8",
  legacyAppShell: "app-shell-v1.8",
  legacyRuntimeImages: "runtime-img-v1.8",
  obsoleteAppShell: "ambre-app-shell-v1.7",
  obsoleteRuntimeImages: "ambre-runtime-img-v1.7",
  unknownGeneric: "app-shell-v1.7",
  unrelatedSentinel: "audit-unrelated-cache"
};

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"]
]);

const createStaticServer = () => {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://${host}`);

    const fixture = documentFixtures.get(url.pathname);
    if (fixture) {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end(fixture.html);
      return;
    }

    if (url.pathname === harnessPath) {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end("<!doctype html><html lang=\"en\"><title>Service Worker cache test</title></html>");
      return;
    }

    const requestedPath = decodeURIComponent(url.pathname);
    const normalizedPath = requestedPath === "/" ? "/index.html" : requestedPath;
    const filePath = path.resolve(rootDir, normalizedPath.replace(/^\/+/, ""));
    const rootPrefix = `${rootDir}${path.sep}`;

    if (!filePath.startsWith(rootPrefix) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }

    const contentType = mimeTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store"
    });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, host, () => resolve(server));
  });
};

const closeServer = (server) => {
  if (!server.listening) return Promise.resolve();
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
    server.closeAllConnections();
  });
};

const retrieveFromServer = (url) => new Promise((resolve, reject) => {
  const request = http.get(url, { agent: false }, (response) => {
    response.resume();
    resolve(response.statusCode);
  });
  request.once("error", reject);
  request.setTimeout(5000, () => request.destroy(new Error("Network probe timed out")));
});

const assertWorkerControl = async (page, baseUrl, label) => {
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 15000 });
  const controller = await page.evaluate(() => ({
    url: navigator.serviceWorker.controller.scriptURL,
    state: navigator.serviceWorker.controller.state
  }));
  assert.equal(controller.url, `${baseUrl}/sw.js`, `${label}: expected canonical worker control`);
  assert.equal(controller.state, "activated", `${label}: controller must be activated`);
};

const assertDocumentDelivery = async (page, url, fixture, label) => {
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  assert.ok(response, `${label}: navigation must return a response`);
  assert.equal(response.status(), 200, `${label}: response status`);
  assert.equal(response.fromServiceWorker(), true, `${label}: response must come from the worker`);
  assert.equal(response.url(), url, `${label}: response URL`);
  assert.equal(page.url(), url, `${label}: requested URL must be retained`);
  assert.equal(await response.text(), fixture.html, `${label}: response body identity`);
  assert.equal(await page.locator("body").innerText(), fixture.marker, `${label}: rendered document body`);
  await assertWorkerControl(page, new URL(url).origin, label);
};

const run = async () => {
  console.log("QA SERVICE WORKER: starting isolated activation test...");
  const server = await createStaticServer();
  let browser;
  let context;

  try {
    const address = server.address();
    assert.ok(address && typeof address === "object", "The test server must expose a local port");

    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    const page = await context.newPage();
    const baseUrl = `http://${host}:${address.port}`;
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.clearBrowserCache");

    await page.goto(`${baseUrl}${harnessPath}`, { waitUntil: "domcontentloaded" });

    await page.evaluate(async (names) => {
      for (const name of Object.values(names)) {
        const cache = await caches.open(name);
        const markerPath = `/__cache-marker__/${encodeURIComponent(name)}`;
        await cache.put(markerPath, new Response(name));
      }
    }, cacheNames);

    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const worker = registration.installing || registration.waiting || registration.active;

      if (!worker) throw new Error("Service Worker registration did not expose a worker");

      if (worker.state !== "activated") {
        await new Promise((resolve, reject) => {
          let timeoutId;
          const finish = (callback) => {
            clearTimeout(timeoutId);
            worker.removeEventListener("statechange", handleStateChange);
            callback();
          };
          const handleStateChange = () => {
            if (worker.state === "activated") finish(resolve);
            if (worker.state === "redundant") {
              finish(() => reject(new Error("Service Worker became redundant")));
            }
          };

          timeoutId = setTimeout(
            () => finish(() => reject(new Error(`Service Worker activation timed out in state ${worker.state}`))),
            15000,
          );
          worker.addEventListener("statechange", handleStateChange);
          handleStateChange();
        });
      }

      await navigator.serviceWorker.ready;
    });
    await assertWorkerControl(page, baseUrl, "Before disconnection");

    const state = await page.evaluate(async ({ names, paths }) => {
      const survivingNames = [
        names.currentAppShell,
        names.currentRuntimeImages,
        names.unknownGeneric,
        names.unrelatedSentinel
      ];
      const markers = {};

      for (const name of survivingNames) {
        const cache = await caches.open(name);
        const markerPath = `/__cache-marker__/${encodeURIComponent(name)}`;
        const response = await cache.match(markerPath);
        markers[name] = response ? await response.text() : null;
      }

      const appShell = await caches.open(names.currentAppShell);
      const documents = {};
      for (const url of paths) {
        const response = await appShell.match(url);
        documents[url] = response ? { status: response.status, body: await response.text() } : null;
      }

      return {
        keys: (await caches.keys()).sort(),
        markers,
        offlinePagePrecached: Boolean(await appShell.match("/offline.html")),
        documents
      };
    }, { names: cacheNames, paths: [documentPath, offlinePath] });

    const expectedKeys = [
      cacheNames.currentAppShell,
      cacheNames.currentRuntimeImages,
      cacheNames.unknownGeneric,
      cacheNames.unrelatedSentinel
    ].sort();

    assert.deepEqual(state.keys, expectedKeys, "Activation must delete only obsolete Ambre-owned caches");
    assert.equal(state.offlinePagePrecached, true, "The current app-shell cache must remain usable");

    for (const name of expectedKeys) {
      assert.equal(state.markers[name], name, `Activation must preserve cache contents for ${name}`);
    }
    for (const [url, fixture] of documentFixtures) {
      assert.deepEqual(state.documents[url], { status: 200, body: fixture.html }, `Precache fixture: ${url}`);
    }
    console.log("QA SERVICE WORKER: activation, cache ownership, controller and fixture bodies PASS");

    await closeServer(server);
    assert.equal(server.listening, false, "Disconnection: test server must be stopped");
    await assert.rejects(retrieveFromServer(`${baseUrl}${documentPath}`), { code: "ECONNREFUSED" },
      "Disconnection: direct HTTP retrieval must fail with connection refused");
    console.log("QA SERVICE WORKER: stopped server and unavailable HTTP retrieval PASS (HTTP cache disabled)");

    await assertDocumentDelivery(page, `${baseUrl}${documentPath}`, documentFixtures.get(documentPath),
      "Offline precached navigation");
    console.log("QA SERVICE WORKER: offline precached document delivery PASS");

    const uncachedUrl = `${baseUrl}/__sw-uncached-${randomUUID()}.html`;
    assert.equal(await page.evaluate(async (url) => Boolean(await caches.match(url)), uncachedUrl), false,
      "Offline uncached navigation: unique URL must be absent from all caches");
    await assertDocumentDelivery(page, uncachedUrl, documentFixtures.get(offlinePath), "Offline uncached navigation");
    console.log("QA SERVICE WORKER: offline fallback at the uncached requested URL PASS");

    const documentRemoved = await page.evaluate(async ({ name, url }) => {
      const cache = await caches.open(name);
      return await cache.delete(url) && !(await caches.match(url));
    }, { name: cacheNames.currentAppShell, url: documentPath });
    assert.equal(documentRemoved, true, "Negative document control: remove response from Cache Storage");
    await assertDocumentDelivery(page, `${baseUrl}${documentPath}`, documentFixtures.get(offlinePath),
      "Negative document control fallback");
    const renderedBody = await page.locator("body").innerText();
    assert.throws(() => assert.equal(renderedBody, documentMarker), { code: "ERR_ASSERTION" },
      "Negative document control: original document delivery assertion must fail");
    console.log("QA SERVICE WORKER: removed document cannot deliver its original body PASS");

    const missingUrl = `${baseUrl}/__sw-no-fallback-${randomUUID()}.html`;
    const fallbackRemoved = await page.evaluate(async ({ name, url, missingUrl }) => {
      const cache = await caches.open(name);
      return await cache.delete(url) && !(await caches.match(url)) && !(await caches.match(missingUrl));
    }, { name: cacheNames.currentAppShell, url: offlinePath, missingUrl });
    assert.equal(fallbackRemoved, true, "Negative fallback control: both requested URL and fallback must be absent");
    await assertWorkerControl(page, baseUrl, "Negative fallback control");
    await assert.rejects(page.goto(missingUrl, { waitUntil: "domcontentloaded", timeout: 15000 }),
      /page\.goto: net::ERR_FAILED at /,
      "Negative fallback control: offline document delivery must fail without its cached response");
    console.log("QA SERVICE WORKER: removed offline fallback causes expected navigation failure PASS");

    console.log("QA SERVICE WORKER: PASS");
  } finally {
    try {
      if (context) await context.close();
    } finally {
      try {
        if (browser) await browser.close();
      } finally {
        await closeServer(server);
      }
    }
  }
};

run().catch((error) => {
  console.error("QA SERVICE WORKER: FAIL");
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});

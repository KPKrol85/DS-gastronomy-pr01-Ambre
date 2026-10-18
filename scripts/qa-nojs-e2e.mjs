import assert from "node:assert/strict";
import fs from "fs";
import http from "http";
import path from "path";
import { chromium } from "playwright";

const rootDir = process.cwd();
const host = "127.0.0.1";
const port = Number(process.env.QA_NOJS_PORT || 4175);
const reportsDir = path.resolve(rootDir, "reports", "nojs");

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
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"]
]);

const createStaticServer = () => {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://${host}:${port}`);
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

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes.get(ext) || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve(server));
  });
};

const ensureDir = (directoryPath) => {
  fs.mkdirSync(directoryPath, { recursive: true });
};

const sanitizeStepName = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* Bez JavaScriptu obowiązują statyczne atrybuty min/max z index.html, dlatego daty
   testowe wyliczane są z nich, a nie z dnia uruchomienia testu ani z wartości na stałe.
   Arytmetyka pracuje na lokalnych komponentach kalendarza, bez konwersji przez UTC. */
const MONDAY = 1;

const padTwo = (value) => String(value).padStart(2, "0");
const toIsoDate = (date) => `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`;

const shiftIsoDate = (isoDate, days) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return toIsoDate(new Date(year, month - 1, day + days, 12, 0, 0, 0));
};

const isoWeekday = (isoDate) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0).getDay();
};

const firstMatchingDate = (isoDate, matches) => {
  let candidate = isoDate;
  for (let step = 0; step < 7; step += 1) {
    if (matches(candidate)) return candidate;
    candidate = shiftIsoDate(candidate, 1);
  }

  throw new Error(`No matching reservation date found from ${isoDate}`);
};

const run = async () => {
  console.log("QA NO-JS E2E: starting static server...");
  const server = await createStaticServer();

  let browser;
  let context;
  let page;
  let dateBounds;
  const interceptedPosts = [];

  const fillNativeForm = async (form, { date, time }) => {
    await form.locator("#name").fill("Jan Kowalski");
    await form.locator("#phone").fill("123456789");
    await form.locator("#date").fill(date);
    await form.locator("#time").fill(time);
    await form.locator("#guests").selectOption("2");
    await form.locator("#notes").fill("Stolik przy oknie");
    await form.locator("#consent").check();
  };

  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({ javaScriptEnabled: false });
    await context.route("**/*", async (route) => {
      const request = route.request();
      if (request.method() !== "POST") {
        await route.continue();
        return;
      }

      interceptedPosts.push(request);
      await route.fulfill({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: "<!doctype html><title>Intercepted</title>"
      });
    });
    page = await context.newPage();

    const baseUrl = `http://${host}:${port}`;

    const runStep = async (stepName, callback) => {
      try {
        console.log(`QA NO-JS E2E: ${stepName}`);
        await callback();
      } catch (error) {
        ensureDir(reportsDir);
        const screenshotPath = path.join(reportsDir, `${sanitizeStepName(stepName)}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`QA NO-JS E2E: FAIL at step "${stepName}"`);
        console.error(`Page: ${page.url()}`);
        console.error(`Screenshot: ${path.relative(rootDir, screenshotPath)}`);
        console.error(errorMessage);
        process.exitCode = 1;
        throw error;
      }
    };

    await runStep("open home page", async () => {
      await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.getByRole("heading", { level: 1, name: "Sezonowe menu degustacyjne" }).waitFor();
    });

    await runStep("verify header navigation in no-js mode", async () => {
      const nav = page.locator('header nav[aria-label="Główna nawigacja"]');
      await nav.waitFor();
      await nav.getByRole("link", { name: "O nas" }).waitFor();
      await nav.getByRole("link", { name: "Menu" }).first().waitFor();
      await nav.getByRole("link", { name: "Galeria" }).first().waitFor();
      await nav.getByRole("link", { name: "Rezerwacja" }).waitFor();
    });

    await runStep("navigate through header link", async () => {
      await page.getByTestId("site-header-nav").getByRole("link", { name: "Rezerwacja" }).click();
      await page.waitForURL("**/index.html#rezerwacja", { timeout: 10000 });
      await page.getByRole("heading", { level: 2, name: "Rezerwacja" }).waitFor();
    });

    await runStep("open contact section and validate booking form", async () => {
      await page.goto(`${baseUrl}/index.html#rezerwacja`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.getByRole("heading", { level: 2, name: "Rezerwacja" }).waitFor();

      const form = page.locator("#booking-form");
      await form.waitFor();
      await form.locator('input[name="name"][required]').waitFor();
      await form.locator('input[name="phone"][required]').waitFor();
      await form.locator('input[name="date"][required]').waitFor();
      await form.locator('input[name="time"][required]').waitFor();
      await form.locator('select[name="guests"][required]').waitFor();
      await form.locator('input[name="consent"][required]').waitFor();

      dateBounds = await form.locator("#date").evaluate((element) => ({ min: element.min, max: element.max }));
      assert.match(dateBounds.min, /^\d{4}-\d{2}-\d{2}$/, "The date field must carry a static native lower boundary");
      assert.match(dateBounds.max, /^\d{4}-\d{2}-\d{2}$/, "The date field must carry a static native upper boundary");
      assert.equal(dateBounds.min < dateBounds.max, true, "The native date boundaries must span a window");
      assert.equal(
        shiftIsoDate(dateBounds.min, 90),
        dateBounds.max,
        "The static native window must span today through 90 days ahead as configured"
      );
      assert.deepEqual(
        await form.locator("#time").evaluate((element) => ({ min: element.min, max: element.max, step: element.step })),
        { min: "17:00", max: "22:00", step: "900" },
        "The time field must carry the accepted native hours and the 15-minute step"
      );
    });

    await runStep("block an invalid empty booking submission natively", async () => {
      const form = page.locator("#booking-form");
      const nameInput = form.locator("#name");
      const pageUrl = page.url();
      const nativeValidationEnabled = await form.evaluate((element) => !element.noValidate);

      await form.locator('button[type="submit"]').focus();
      await page.keyboard.press("Enter");

      assert.equal(interceptedPosts.length, 0, "An invalid empty form must not initiate a POST request");
      assert.equal(nativeValidationEnabled, true, "The no-JavaScript form must retain native validation");
      assert.equal(page.url(), pageUrl, "An invalid empty form must not navigate away");
      assert.equal(await form.evaluate((element) => element.checkValidity()), false, "The empty form must expose an invalid native state");
      assert.deepEqual(
        await nameInput.evaluate((element) => ({
          focused: document.activeElement === element,
          invalid: element.matches(":invalid"),
          valid: element.validity.valid,
          valueMissing: element.validity.valueMissing,
          willValidate: element.willValidate
        })),
        {
          focused: true,
          invalid: true,
          valid: false,
          valueMissing: true,
          willValidate: true
        },
        "Native validation must focus and expose the first missing required field"
      );
    });

    await runStep("reject out-of-window dates and times natively", async () => {
      const rejections = [
        { field: "date", value: shiftIsoDate(dateBounds.min, -1), flag: "rangeUnderflow" },
        { field: "date", value: shiftIsoDate(dateBounds.max, 1), flag: "rangeOverflow" },
        { field: "time", value: "16:45", flag: "rangeUnderflow" },
        { field: "time", value: "22:15", flag: "rangeOverflow" },
        { field: "time", value: "18:10", flag: "stepMismatch" }
      ];

      for (const rejection of rejections) {
        await page.goto(`${baseUrl}/index.html#rezerwacja`, { waitUntil: "domcontentloaded", timeout: 15000 });
        const form = page.locator("#booking-form");
        await fillNativeForm(form, {
          date: firstMatchingDate(dateBounds.min, (candidate) => isoWeekday(candidate) !== MONDAY),
          time: "18:00"
        });
        await form.locator(`#${rejection.field}`).fill(rejection.value);

        const postsBefore = interceptedPosts.length;
        // Jak w kroku pustego formularza: natywna walidacja przewija do błędnego pola,
        // więc wysyłka uruchamiana jest z klawiatury, bez oczekiwania na stabilny przycisk.
        await form.locator('button[type="submit"]').focus();
        await page.keyboard.press("Enter");

        assert.equal(
          await form.locator(`#${rejection.field}`).evaluate((element, flag) => element.validity[flag], rejection.flag),
          true,
          `Native validation must report ${rejection.flag} for ${rejection.field}=${rejection.value}`
        );
        assert.equal(
          await form.evaluate((element) => element.checkValidity()),
          false,
          `${rejection.field}=${rejection.value} must keep the script-less form natively invalid`
        );
        assert.equal(
          interceptedPosts.length,
          postsBefore,
          `${rejection.field}=${rejection.value} must not initiate a POST request`
        );
      }
    });

    await runStep("document the unsupported native Monday restriction", async () => {
      /* Natywne atrybuty HTML nie wyrażają wykluczenia dnia tygodnia: poniedziałek w oknie
         min/max przechodzi walidację natywną i jest odrzucany wyłącznie przez JavaScript.
         Krok utrwala to ograniczenie, zamiast przedstawiać je jako pełne wymuszenie reguły. */
      await page.goto(`${baseUrl}/index.html#rezerwacja`, { waitUntil: "domcontentloaded", timeout: 15000 });
      const form = page.locator("#booking-form");
      const monday = firstMatchingDate(dateBounds.min, (candidate) => isoWeekday(candidate) === MONDAY);
      assert.equal(monday <= dateBounds.max, true, "The sampled Monday must fall inside the native window");

      await fillNativeForm(form, { date: monday, time: "18:00" });

      assert.deepEqual(
        await form.locator("#date").evaluate((element) => ({
          valid: element.validity.valid,
          rangeUnderflow: element.validity.rangeUnderflow,
          rangeOverflow: element.validity.rangeOverflow
        })),
        { valid: true, rangeUnderflow: false, rangeOverflow: false },
        "A Monday inside the native window stays natively valid - the weekday rule needs JavaScript"
      );
      assert.equal(
        await form.evaluate((element) => element.checkValidity()),
        true,
        "Native validation alone cannot reject a Monday inside the configured date window"
      );
    });

    await runStep("validate footer legal links", async () => {
      const footer = page.locator("footer.site-footer");
      await footer.waitFor();

      const legalLinks = [
        {
          linkName: "Polityka prywatności",
          expectedPath: "/polityka-prywatnosci.html",
          expectedHeading: "Polityka prywatności"
        },
        {
          linkName: "Regulamin",
          expectedPath: "/regulamin.html",
          expectedHeading: "Regulamin serwisu"
        },
        {
          linkName: "Cookies",
          expectedPath: "/cookies.html",
          expectedHeading: "Polityka cookies"
        }
      ];

      for (const legalLink of legalLinks) {
        await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded", timeout: 15000 });
        const link = page.locator(".site-footer__legal").getByRole("link", { name: legalLink.linkName });
        await link.waitFor();
        await link.click();
        await page.waitForURL(`**${legalLink.expectedPath}`, { timeout: 10000 });
        await page.getByRole("heading", { level: 1, name: legalLink.expectedHeading }).waitFor();
      }
    });

    await runStep("intercept a valid native booking submission", async () => {
      await page.goto(`${baseUrl}/index.html#rezerwacja`, { waitUntil: "domcontentloaded", timeout: 15000 });
      const form = page.locator("#booking-form");
      const reservationDate = firstMatchingDate(dateBounds.min, (candidate) => isoWeekday(candidate) !== MONDAY);
      await fillNativeForm(form, { date: reservationDate, time: "18:00" });

      assert.equal(await form.evaluate((element) => element.checkValidity()), true, "The completed no-JavaScript form must be natively valid");

      const [request] = await Promise.all([
        page.waitForRequest((candidate) => candidate.method() === "POST"),
        form.locator('button[type="submit"]').click()
      ]);

      assert.equal(interceptedPosts.length, 1, "The valid native submission must be intercepted exactly once");
      assert.equal(new URL(request.url()).pathname, "/index.html");
      assert.match((await request.headerValue("content-type")) || "", /^application\/x-www-form-urlencoded/);

      const submission = new URLSearchParams(request.postData() || "");
      assert.equal(submission.get("form-name"), "reservation");
      assert.equal(submission.get("name"), "Jan Kowalski");
      assert.equal(submission.get("phone"), "123456789");
      assert.equal(submission.get("date"), reservationDate);
      assert.equal(submission.get("time"), "18:00");
      assert.equal(submission.get("guests"), "2");
      assert.equal(submission.get("notes"), "Stolik przy oknie");
      assert.equal(submission.get("consent"), "on");
    });

    console.log("QA NO-JS E2E: PASS");
  } finally {
    if (page) {
      await page.close();
    }

    if (context) {
      await context.close();
    }

    if (browser) {
      await browser.close();
    }

    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
};

run().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error("QA NO-JS E2E: ERROR");
  console.error(message);
  process.exit(1);
});

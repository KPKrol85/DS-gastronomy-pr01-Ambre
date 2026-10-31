import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const rootDir = process.cwd();
const host = "127.0.0.1";
const port = Number(process.env.QA_RESERVATION_PORT || 4176);
const baseUrl = `http://${host}:${port}`;
const successMessage = "Dziękujemy! Zapytanie zostało wysłane do KP_Code Digital Studio.";
const failureMessage = "Nie udało się wysłać formularza. Sprawdź połączenie i spróbuj ponownie.";
const requiredFieldsMessage = "Uzupełnij wymagane pola.";
const invalidFieldsMessage = "Popraw zaznaczone pola.";
const submitLabel = "Wyślij zapytanie";

const validEntry = {
  name: "Jan Kowalski",
  email: "jan.kowalski@example.com",
  phone: "123 456 789",
  subject: "Strona dla restauracji",
  message: "Chcę zamówić podobną stronę dla mojej restauracji."
};

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

const openFormPage = async (browser, options = {}) => {
  const context = await browser.newContext({ serviceWorkers: "block" });
  await context.addInitScript(() => {
    localStorage.setItem("demoLegalAccepted", "true");
  });

  if (options.disableFetch) {
    await context.addInitScript(() => {
      Object.defineProperty(window, "fetch", { configurable: true, value: undefined });
    });
  }

  const page = await context.newPage();
  await page.goto(`${baseUrl}/index.html#rezerwacja`, { waitUntil: "domcontentloaded" });
  await page.locator("#booking-form").waitFor();
  await page.waitForFunction(() => document.querySelector("#booking-form")?.noValidate === true);
  return { context, page };
};

const fillValidForm = async (page, overrides = {}) => {
  const entry = { ...validEntry, ...overrides };
  await page.locator("#name").fill(entry.name);
  await page.locator("#email").fill(entry.email);
  await page.locator("#phone").fill(entry.phone);
  await page.locator("#subject").selectOption(entry.subject);
  await page.locator("#message").fill(entry.message);
};

const readFormState = (page) =>
  page.locator("#booking-form").evaluate((form) => ({
    name: form.elements.namedItem("name").value,
    email: form.elements.namedItem("email").value,
    phone: form.elements.namedItem("phone").value,
    subject: form.elements.namedItem("subject").value,
    message: form.elements.namedItem("message").value
  }));

const assertFailureState = async (page, expectedState) => {
  await page.locator("#form-msg").filter({ hasText: failureMessage }).waitFor();
  assert.deepEqual(await readFormState(page), expectedState);
  await assertButtonUsable(page);
  assert.equal(await page.locator("#form-msg").textContent(), failureMessage);
  assert.notEqual(await page.locator("#form-msg").textContent(), successMessage);
};

const assertButtonUsable = async (page) => {
  const submitButton = page.locator('.site-button--form[type="submit"]');
  assert.equal(await submitButton.isEnabled(), true);
  assert.equal(await submitButton.getAttribute("aria-busy"), null);
  assert.equal(await submitButton.textContent(), submitLabel);
};

const interceptPosts = async (context) => {
  const posts = [];
  context.on("request", (request) => {
    if (request.method() === "POST") posts.push(request);
  });
  await context.route("**/*", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    await route.fulfill({ status: 204, body: "" });
  });
  return posts;
};

const assertInvalidSubmission = async (page, posts, expectedState, expectedStatus = requiredFieldsMessage) => {
  const prevented = await page.locator("#booking-form").evaluate((form) => {
    let submissionEvent;
    form.addEventListener("submit", (event) => {
      submissionEvent = event;
    }, { once: true });
    form.requestSubmit();
    return submissionEvent?.defaultPrevented === true;
  });

  assert.equal(prevented, true, "Enhanced validation must prevent the invalid submission");
  assert.equal(await page.locator("#form-msg").textContent(), expectedStatus);
  assert.equal(await page.locator("#booking-form").evaluate((form) => form.checkValidity()), false);
  assert.deepEqual(await readFormState(page), expectedState, "Invalid submission must retain entered values");
  await assertButtonUsable(page);
  assert.equal(posts.length, 0, "Invalid submission must send zero POST requests");
};

const assertFieldError = async (page, field, validityMessage, errorMessage) => {
  assert.deepEqual(await page.locator(`#${field}`).evaluate((input) => ({
    customError: input.validity.customError,
    valid: input.validity.valid,
    validationMessage: input.validationMessage,
    ariaInvalid: input.getAttribute("aria-invalid")
  })), {
    customError: Boolean(validityMessage),
    valid: !validityMessage,
    validationMessage: validityMessage,
    ariaInvalid: validityMessage ? "true" : null
  }, `${field} must expose the expected validity and ARIA state`);
  assert.equal(await page.locator(`#${field}-error`).textContent(), errorMessage);
};

const assertCorrectedSubmission = async (page, posts, { phone = validEntry.phone } = {}) => {
  assert.equal(await page.locator("#booking-form").evaluate((form) => form.checkValidity()), true);
  await page.locator('.site-button--form[type="submit"]').click();
  await page.locator("#form-msg").filter({ hasText: successMessage }).waitFor();
  await assertButtonUsable(page);

  assert.equal(posts.length, 1, "Corrected submission must send exactly one POST request");
  const [request] = posts;
  assert.equal(request.url(), `${baseUrl}/`);
  assert.match((await request.headerValue("content-type")) || "", /^application\/x-www-form-urlencoded/);
  const payload = new URLSearchParams(request.postData() || "");
  assert.equal([...payload].length, 7, "The Netlify payload must retain all fields without duplicates");
  assert.deepEqual(Object.fromEntries(payload), {
    "form-name": "contact",
    company: "",
    name: validEntry.name,
    email: validEntry.email,
    phone,
    subject: validEntry.subject,
    message: validEntry.message
  });
};

const runEmptyFormTest = async (browser) => {
  const { context, page } = await openFormPage(browser);
  try {
    const posts = await interceptPosts(context);
    const expectedState = await readFormState(page);
    await assertInvalidSubmission(page, posts, expectedState);
    for (const field of ["name", "email", "subject", "message"]) {
      assert.equal(await page.locator(`#${field}`).evaluate((input) => input.validity.valueMissing), true,
        `The required ${field} field must report a missing value`);
    }
    assert.equal(await page.locator("#phone").evaluate((input) => input.required), false, "The phone field must stay optional");
    await assertFieldError(page, "phone", "", "");
    // An empty email is reported natively as missing, never as a format error.
    assert.deepEqual(await page.locator("#email").evaluate((input) => ({
      customError: input.validity.customError,
      ariaInvalid: input.getAttribute("aria-invalid")
    })), { customError: false, ariaInvalid: null });
    assert.equal(await page.locator("#email-error").textContent(), "");
  } finally {
    await context.close();
  }
};

/* The privacy notice replaces the former consent checkbox: it names the data controller,
   links the policy from the keyboard order and adds no field or validation of its own. */
const runPrivacyNoticeTest = async (browser) => {
  const { context, page } = await openFormPage(browser);
  try {
    assert.equal(await page.locator('#booking-form [name="consent"], #consent, #consent-error').count(), 0,
      "The contact form must not render a consent checkbox or its error lane");
    const notice = page.locator("#booking-form #form-notice");
    assert.match((await notice.textContent()) || "", /KP_Code Digital Studio/);
    const policyLink = notice.getByRole("link", { name: "Polityce prywatności" });
    assert.equal(await policyLink.getAttribute("href"), "/polityka-prywatnosci.html");
    const submitButton = page.locator('.site-button--form[type="submit"]');
    assert.equal(await submitButton.getAttribute("aria-describedby"), "form-notice");

    await page.locator("#message").focus();
    await page.keyboard.press("Tab");
    assert.equal(await policyLink.evaluate((element) => document.activeElement === element), true,
      "Tab from the message must reach the privacy policy link");
    await page.keyboard.press("Tab");
    assert.equal(await submitButton.evaluate((element) => document.activeElement === element), true,
      "Tab from the privacy policy link must reach the submit button");
  } finally {
    await context.close();
  }
};

const correctionScenarios = {
  phone: {
    validityMessage: "Podaj poprawny numer telefonu.",
    errorMessage: "Podaj poprawny numer telefonu (np. +48 123 456 789) lub pozostaw pole puste.",
    status: invalidFieldsMessage
  },
  email: {
    validityMessage: "Podaj poprawny adres e-mail.",
    errorMessage: "Podaj poprawny adres e-mail (np. jan.kowalski@example.com).",
    status: invalidFieldsMessage
  }
};

const runCorrectionTest = async (browser, field, { invalidValue, correctedValue }) => {
  const scenario = correctionScenarios[field];
  const { context, page } = await openFormPage(browser);
  try {
    const posts = await interceptPosts(context);
    await fillValidForm(page);
    await page.locator(`#${field}`).fill(invalidValue);

    const expectedState = await readFormState(page);
    assert.equal(expectedState[field], invalidValue, "Typing must not alter the entered value");
    await assertInvalidSubmission(page, posts, expectedState, scenario.status);
    await assertFieldError(page, field, scenario.validityMessage, scenario.errorMessage);

    await page.locator(`#${field}`).fill(correctedValue);

    await assertFieldError(page, field, "", "");
    assert.deepEqual(await readFormState(page), { ...expectedState, [field]: correctedValue },
      "Correction must keep the corrected value as typed and preserve the remaining entered values");
    assert.equal(posts.length, 0, "Correcting a field must not submit the form");
    await assertButtonUsable(page);
    await assertCorrectedSubmission(page, posts, field === "phone" ? { phone: correctedValue } : {});
  } finally {
    await context.close();
  }
};

const runOptionalPhoneTest = async (browser) => {
  const { context, page } = await openFormPage(browser);
  try {
    const posts = await interceptPosts(context);
    await fillValidForm(page, { phone: "" });
    await assertFieldError(page, "phone", "", "");
    await assertCorrectedSubmission(page, posts, { phone: "" });
  } finally {
    await context.close();
  }
};

const runAcceptedResponseTest = async (browser) => {
  const { context, page } = await openFormPage(browser);
  let releaseResponse;
  const responseGate = new Promise((resolve) => {
    releaseResponse = resolve;
  });
  let deliveredPosts = 0;

  await context.route(`${baseUrl}/`, async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    deliveredPosts += 1;
    await responseGate;
    await route.fulfill({ status: 204, body: "" });
  });

  try {
    await fillValidForm(page);
    const submission = page.locator("#booking-form").evaluate((form) => form.requestSubmit());
    const submitButton = page.locator('.site-button--form[type="submit"]');
    await submitButton.waitFor({ state: "attached" });
    await page.waitForFunction(() => document.querySelector('.site-button--form[type="submit"]')?.disabled === true);
    assert.equal(await submitButton.getAttribute("aria-busy"), "true");
    assert.equal(await submitButton.textContent(), "Wysyłanie…");

    // A repeated submission while the first request is pending must be swallowed.
    assert.equal(await page.locator("#booking-form").evaluate((form) => {
      let repeatEvent;
      form.addEventListener("submit", (event) => {
        repeatEvent = event;
      }, { once: true });
      form.requestSubmit();
      return repeatEvent?.defaultPrevented === true;
    }), true, "A repeated submission during loading must be prevented");

    releaseResponse();
    await submission;

    await page.locator("#form-msg").filter({ hasText: successMessage }).waitFor();
    assert.equal(deliveredPosts, 1, "Duplicate-submission protection must send exactly one POST request");
    assert.deepEqual(await readFormState(page), {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
    await assertButtonUsable(page);
  } finally {
    releaseResponse();
    await context.close();
  }
};

const runFailureTest = async (browser, kind) => {
  const { context, page } = await openFormPage(browser);

  await context.route(`${baseUrl}/`, async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    if (kind === "http") {
      await route.fulfill({ status: 503, body: "Service Unavailable" });
      return;
    }

    await route.abort("failed");
  });

  try {
    await fillValidForm(page);
    const expectedState = await readFormState(page);
    await page.locator("#booking-form").evaluate((form) => form.requestSubmit());
    await assertFailureState(page, expectedState);
  } finally {
    await context.close();
  }
};

const runNativeFallbackTest = async (browser) => {
  const { context, page } = await openFormPage(browser, { disableFetch: true });
  let interceptedPosts = 0;

  await context.route("**/*", async (route) => {
    const request = route.request();
    if (request.method() !== "POST") {
      await route.continue();
      return;
    }

    interceptedPosts += 1;
    await route.fulfill({
      status: 200,
      contentType: "text/html; charset=utf-8",
      body: "<!doctype html><title>Intercepted</title>"
    });
  });

  try {
    await fillValidForm(page);
    const [request] = await Promise.all([
      page.waitForRequest((candidate) => candidate.method() === "POST"),
      page.locator('.site-button--form[type="submit"]').click()
    ]);

    assert.equal(interceptedPosts, 1);
    assert.equal(new URL(request.url()).pathname, "/index.html");
    assert.match((await request.headerValue("content-type")) || "", /^application\/x-www-form-urlencoded/);
    const payload = new URLSearchParams(request.postData() || "");
    assert.equal(payload.get("form-name"), "contact");
    assert.equal(payload.get("company"), "");
    assert.equal(payload.get("name"), validEntry.name);
    assert.equal(payload.get("email"), validEntry.email);
    assert.equal(payload.get("phone"), validEntry.phone);
    assert.equal(payload.has("consent"), false);
  } finally {
    await context.close();
  }
};

const run = async () => {
  console.log("QA RESERVATION E2E: starting static server...");
  const server = await createStaticServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });

    const scenarios = [
      ["accepted HTTP response with duplicate-submission protection", () => runAcceptedResponseTest(browser)],
      ["rejected HTTP response", () => runFailureTest(browser, "http")],
      ["network failure", () => runFailureTest(browser, "network")],
      ["native fallback without fetch", () => runNativeFallbackTest(browser)],
      ["empty form sends no POST and retains values", () => runEmptyFormTest(browser)],
      ["privacy notice replaces the consent checkbox", () => runPrivacyNoticeTest(browser)],
      ["optional phone left empty", () => runOptionalPhoneTest(browser)],
      ...[
        ["123", "123 456 789"],
        ["tel. 123 456 789", "+48 123 456 789"],
        ["+48 123 456 789 012 345 67", "0048 123 456 789"],
        ["123+456789", "+44 20 7946 0958"],
        ["abc", "+1 (555) 123-4567"]
      ].map(([invalidValue, correctedValue]) => [
        `invalid phone "${invalidValue}" rejected, then "${correctedValue}" submitted unchanged`,
        () => runCorrectionTest(browser, "phone", { invalidValue, correctedValue })
      ]),
      ["invalid email rejection and correction", () => runCorrectionTest(browser, "email", {
        invalidValue: "jan.kowalski",
        correctedValue: validEntry.email
      })]
    ];
    for (const [label, scenario] of scenarios) {
      console.log(`QA RESERVATION E2E: ${label}`);
      await scenario();
    }

    console.log(`QA RESERVATION E2E: PASS (${scenarios.length}/${scenarios.length})`);
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
  console.error("QA RESERVATION E2E: ERROR");
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});

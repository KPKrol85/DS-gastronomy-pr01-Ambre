import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const rootDir = process.cwd();
const host = "127.0.0.1";
const port = Number(process.env.QA_MENU_DETAILS_PORT || 4186);
const baseUrl = `http://${host}:${port}`;
const dishSelector = "main.page-menu .dish";
const panelSelector = "main.page-menu .dish-more";
const actionSelector = "main.page-menu .dish__action";

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
const action = (page, index) => page.locator(actionSelector).nth(index);
const isFocused = (locator) => locator.evaluate((element) => element === document.activeElement);

const assertPanels = async (page, expected) => {
  await page.waitForFunction(({ selector, expected }) =>
    Array.from(document.querySelectorAll(selector)).every((item, index) => item.open === expected[index]),
  { selector: panelSelector, expected });
  assert.deepEqual(await page.locator(panelSelector).evaluateAll((items) => items.map((item) => item.open)),
    expected, "Only the expected menu panels may remain open");
};

const waitForDialog = (page, open) => page.waitForFunction((open) => document.getElementById("dish-dialog").open === open, open);

// The card is the oracle: the dialog must show exactly the copy the card ships.
const readCard = (page, index) => page.locator(dishSelector).nth(index).evaluate((dish) => {
  const text = (selector) => (dish.querySelector(selector)?.textContent || "").replace(/\s+/g, " ").trim();
  return {
    title: text(".dish__title"),
    price: text(".dish__price"),
    text: text(".dish-more__text"),
    allergens: text(".dish-more__allergen-list"),
    alt: dish.querySelector(".dish__thumb img")?.alt || "",
    full: dish.querySelector(".dish__thumb")?.dataset.full || ""
  };
});

const readDialog = (page) => page.evaluate(() => {
  const dialog = document.getElementById("dish-dialog");
  const text = (node) => (node?.textContent || "").replace(/\s+/g, " ").trim();
  const resolve = (attribute) => (dialog.getAttribute(attribute) || "").split(/\s+/).filter(Boolean)
    .map((id) => text(document.getElementById(id))).join(" ");
  const image = dialog.querySelector(".dish-dialog__image");
  return {
    open: dialog.open,
    modal: dialog.matches(":modal"),
    name: resolve("aria-labelledby"),
    description: resolve("aria-describedby"),
    price: text(dialog.querySelector(".dish-dialog__price")),
    allergens: text(dialog.querySelector(".dish-dialog__allergens")),
    factsHidden: dialog.querySelector(".dish-dialog__facts").hidden,
    imageCount: dialog.querySelectorAll("img").length,
    imageAlt: image?.alt || "",
    imageSrc: image?.currentSrc || "",
    focusOnClose: document.activeElement === dialog.querySelector(".dish-dialog__close"),
    htmlOverflow: getComputedStyle(document.documentElement).overflowY
  };
});

const readCardBoxes = (page) => page.locator(dishSelector).evaluateAll((dishes) => dishes.map((dish) => {
  const rect = dish.getBoundingClientRect();
  return [rect.left, rect.top, rect.width, rect.height].map((value) => Math.round(value * 10) / 10);
}));

const assertDialogMirrors = async (page, index, label) => {
  const card = await readCard(page, index);
  const dialog = await readDialog(page);
  assert.ok(card.title && card.price && card.text && card.allergens, `${label}: the card must ship complete details`);
  assert.equal(dialog.open && dialog.modal, true, `${label}: the dish details must open as a modal dialog`);
  assert.equal(dialog.name, card.title, `${label}: the dialog must be named by the dish`);
  assert.equal(dialog.price, card.price, `${label}: the dialog must show the card's price`);
  assert.equal(dialog.description, card.text, `${label}: the dialog must describe the dish with its extended description`);
  assert.equal(dialog.allergens, card.allergens, `${label}: the dialog must list the card's allergens`);
  assert.equal(dialog.factsHidden, false, `${label}: the allergens must be shown`);
  assert.equal(dialog.imageCount, 1, `${label}: the dialog must hold a single photograph`);
  assert.equal(dialog.imageAlt, card.alt, `${label}: the photograph must reuse the card's alternative text`);
  await page.waitForFunction(() => document.querySelector("#dish-dialog .dish-dialog__image").naturalWidth > 0);
  const { imageSrc } = await readDialog(page);
  const photo = card.full.split("/").pop().replace(/-1200$/, "");
  assert.ok(imageSrc.includes(`/dishes/${photo}-`), `${label}: the photograph must be the dish's own (${imageSrc})`);
  return dialog;
};

const openWithMouse = async (page, index) => {
  await action(page, index).click();
  await waitForDialog(page, true);
};

const scenarios = [
  {
    label: "initialization replaces the native disclosures with the dish-details action",
    run: async (page) => {
      assert.equal(await page.locator("main.page-menu").count(), 1);
      assert.equal(await page.locator("body.page-menu").count(), 0);
      assert.equal(await page.locator("#dish-dialog").count(), 1, "One dialog must serve every dish");
      const state = await page.locator(dishSelector).evaluateAll((dishes) => dishes.map((dish) => {
        const button = dish.querySelector(".dish__action");
        return {
          panelHidden: dish.querySelector(".dish-more").hidden,
          actionHidden: button.hidden,
          name: button.getAttribute("aria-label"),
          title: dish.querySelector(".dish__title").textContent.trim(),
          popup: button.getAttribute("aria-haspopup"),
          controls: button.getAttribute("aria-controls"),
          text: button.textContent.replace(/\s+/g, " ").trim()
        };
      }));
      for (const dish of state) {
        assert.equal(dish.panelHidden, true, `${dish.title}: the inline disclosure must give way to the action`);
        assert.equal(dish.actionHidden, false, `${dish.title}: the action must be offered once the dialog works`);
        assert.equal(dish.text, "Poznaj danie", `${dish.title}: the action must read "Poznaj danie"`);
        assert.equal(dish.name, `Poznaj danie: ${dish.title}`, `${dish.title}: the action name must start with its visible label`);
        assert.equal(dish.popup, "dialog");
        assert.equal(dish.controls, "dish-dialog");
      }
      for (const locator of await page.locator(panelSelector).all()) {
        assert.equal(await locator.isVisible(), false, "No duplicate disclosure control may stay visible");
      }
      const dialog = await readDialog(page);
      assert.equal(dialog.open, false, "The dialog must start closed");
      assert.equal(await page.locator("#dish-dialog").isVisible(), false);
    }
  },
  {
    label: "mouse opening mirrors the card, keeps the page still and closes with the X button",
    run: async (page) => {
      await page.evaluate(() => window.scrollTo({ top: document.getElementById("menu").offsetTop - 40, behavior: "instant" }));
      const scrollY = await page.evaluate(() => window.scrollY);
      const boxes = await readCardBoxes(page);
      const header = await page.locator(".site-header").evaluate((element) => element.getBoundingClientRect().width);

      await openWithMouse(page, 1);
      const dialog = await assertDialogMirrors(page, 1, "second dish");
      assert.equal(dialog.focusOnClose, true, "Focus must move to the close button");
      assert.equal(dialog.htmlOverflow, "hidden", "The page behind the dialog must not scroll");
      assert.deepEqual(await readCardBoxes(page), boxes, "Opening details must not resize or move any card");
      assert.equal(await page.locator(".site-header").evaluate((element) => element.getBoundingClientRect().width), header,
        "Locking the page must not shift the layout");
      assert.equal(await page.evaluate(() => window.scrollY), scrollY);

      const layout = await page.locator("#dish-dialog").evaluate((element) => {
        const media = element.querySelector(".dish-dialog__media").getBoundingClientRect();
        const body = element.querySelector(".dish-dialog__body").getBoundingClientRect();
        const close = element.querySelector(".dish-dialog__close").getBoundingClientRect();
        const box = element.getBoundingClientRect();
        return { mediaRight: media.right, bodyLeft: body.left, closeRight: close.right, closeTop: close.top, boxRight: box.right, boxTop: box.top };
      });
      assert.ok(layout.mediaRight <= layout.bodyLeft + 1, "Desktop: the photograph must sit left of the copy");
      assert.ok(layout.boxRight - layout.closeRight < 40 && layout.closeTop - layout.boxTop < 40,
        "The close button must sit in the upper-right corner");

      // The rest of the page is blocked: no focus, no pointer hit, no wheel scrolling.
      const blocked = await page.evaluate(() => {
        const thumb = document.querySelector("main.page-menu .dish__thumb");
        thumb.focus();
        const card = document.querySelector("main.page-menu .dish").getBoundingClientRect();
        const hit = document.elementFromPoint(card.left + 8, card.top + 8);
        return { thumbFocused: document.activeElement === thumb, hitDialog: hit === document.getElementById("dish-dialog") };
      });
      assert.deepEqual(blocked, { thumbFocused: false, hitDialog: true }, "Background controls must stay unreachable");
      await page.mouse.move(24, 450);
      await page.mouse.wheel(0, 800);
      await page.waitForTimeout(250);
      assert.equal(await page.evaluate(() => window.scrollY), scrollY, "Wheel input must not scroll the page behind the dialog");

      await page.locator("#dish-dialog .dish-dialog__close").click();
      await waitForDialog(page, false);
      assert.equal(await isFocused(action(page, 1)), true, "Focus must return to the originating action");
      assert.equal(await page.evaluate(() => window.scrollY), scrollY, "Closing must keep the page position");
      assert.notEqual((await readDialog(page)).htmlOverflow, "hidden", "Closing must release the page");
      assert.deepEqual(await readCardBoxes(page), boxes);
    }
  },
  {
    label: "keyboard opening, contained Tab order and Escape restore focus",
    run: async (page) => {
      for (const key of ["Enter", "Space"]) {
        await action(page, 0).focus();
        await page.keyboard.press(key);
        await waitForDialog(page, true);
        await assertDialogMirrors(page, 0, `${key} activation`);
        assert.equal((await readDialog(page)).focusOnClose, true, `${key}: focus must start on the close button`);

        for (const step of ["Tab", "Tab", "Shift+Tab", "Shift+Tab"]) {
          await page.keyboard.press(step);
          const position = await page.evaluate(() => {
            const active = document.activeElement;
            if (!active || active === document.body) return "document";
            return document.getElementById("dish-dialog").contains(active) ? "dialog" : active.outerHTML.slice(0, 80);
          });
          assert.ok(position === "dialog" || position === "document", `${key}: ${step} must not reach the background (${position})`);
        }

        await page.keyboard.press("Escape");
        await waitForDialog(page, false);
        assert.equal(await isFocused(action(page, 0)), true, `${key}: Escape must restore focus to the action`);
        assert.equal(await page.locator("#lb").evaluate((element) => element.open), false,
          "Escape must not involve the image lightbox");
      }
    }
  },
  {
    label: "repeated opening and switching between dishes stay reliable",
    run: async (page) => {
      const order = [0, 3, 3, 1, 2, 0];
      for (const index of order) {
        await openWithMouse(page, index);
        await assertDialogMirrors(page, index, `dish ${index + 1}`);
        await page.keyboard.press("Escape");
        await waitForDialog(page, false);
        assert.equal(await isFocused(action(page, index)), true, `dish ${index + 1}: focus must return to its own action`);
      }

      // Text inside the panel never dismisses; a press on the backdrop does.
      await openWithMouse(page, 2);
      await page.locator("#dish-dialog .dish-dialog__text").click();
      await page.locator("#dish-dialog .dish-dialog__title").click();
      assert.equal((await readDialog(page)).open, true, "Clicks inside the dialog must keep it open");
      await page.mouse.click(12, 450);
      await waitForDialog(page, false);
      assert.equal(await isFocused(action(page, 2)), true, "A backdrop dismissal must also restore focus");
    }
  },
  {
    label: "filtering and the single-image lightbox remain compatible",
    run: async (page) => {
      for (const filter of ["dania-glowne", "desery", "przystawki", "all"]) {
        await page.locator('.menu__tabs [data-filter="' + filter + '"]').click();
        const state = await page.locator("main.page-menu").evaluate((root) => ({
          pressed: Array.from(root.querySelectorAll(".tabs__tab[aria-pressed='true']")).map((tab) => tab.dataset.filter),
          visible: Array.from(root.querySelectorAll(".dish")).filter((dish) => !dish.hidden).map((dish) => dish.dataset.cat),
          all: Array.from(root.querySelectorAll(".dish")).map((dish) => dish.dataset.cat),
          actions: Array.from(root.querySelectorAll(".dish__action")).filter((button) => button.offsetParent !== null).length
        }));
        assert.deepEqual(state.pressed, [filter]);
        assert.deepEqual(state.visible, state.all.filter((category) => filter === "all" || category === filter));
        assert.ok(state.visible.length > 0);
        assert.equal(state.actions, state.visible.length, `${filter}: every visible dish must offer its action`);

        const first = page.locator(`${dishSelector}:not([hidden]) .dish__action`).first();
        const index = await first.evaluate((button) =>
          Array.from(document.querySelectorAll("main.page-menu .dish__action")).indexOf(button));
        await first.click();
        await waitForDialog(page, true);
        await assertDialogMirrors(page, index, `${filter} filter`);
        await page.keyboard.press("Escape");
        await waitForDialog(page, false);
        assert.equal(await isFocused(first), true);
      }

      const thumb = page.locator("main.page-menu .dish__thumb").first();
      await thumb.click();
      await page.waitForFunction(() => document.getElementById("lb").open);
      assert.equal((await readDialog(page)).open, false, "The photograph must open the lightbox, not the details");
      const lightbox = page.locator("#lb");
      assert.equal(await lightbox.getAttribute("data-lightbox-mode"), "single");
      await page.waitForFunction(() => document.getElementById("lb-img").naturalWidth > 0);
      assert.equal(await lightbox.locator(".site-lightbox__counter").isVisible(), false);
      assert.equal(await lightbox.locator(".site-lightbox__nav-button--prev").isVisible(), false);
      assert.equal(await lightbox.locator(".site-lightbox__nav-button--next").isVisible(), false);
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.getElementById("lb").open && document.body.style.position !== "fixed");
      assert.equal(await isFocused(thumb), true);

      await openWithMouse(page, 0);
      assert.equal(await lightbox.evaluate((element) => element.open), false, "The action must open the details, not the lightbox");
      await page.keyboard.press("Escape");
      await waitForDialog(page, false);
    }
  },
  {
    label: "the demonstration-information dialog keeps priority on a first visit",
    acceptDemoLegal: false,
    run: async (page) => {
      await page.locator("#demo-legal-modal").waitFor({ state: "visible" });
      assert.equal(await action(page, 0).evaluate((element) => !!element.closest("[inert]")), true,
        "The demo-information dialog must isolate the menu");
      // click() still dispatches on inert controls, so the module itself must refuse.
      await action(page, 0).evaluate((element) => element.click());
      assert.equal((await readDialog(page)).open, false, "Dish details must not open over the demo-information dialog");
      await page.locator("[data-demo-legal-accept]").click();
      await page.locator("#demo-legal-modal").waitFor({ state: "hidden" });
      await openWithMouse(page, 0);
      await assertDialogMirrors(page, 0, "after acceptance");
      await page.keyboard.press("Escape");
      await waitForDialog(page, false);
      assert.equal(await page.locator("#demo-legal-modal").isVisible(), false);
    }
  },
  {
    label: "mobile stacks the photograph above the copy without overflow",
    viewport: { width: 390, height: 844 },
    run: async (page) => {
      await action(page, 2).scrollIntoViewIfNeeded();
      const boxes = await readCardBoxes(page);
      await openWithMouse(page, 2);
      await assertDialogMirrors(page, 2, "mobile");
      const layout = await page.locator("#dish-dialog").evaluate((element) => {
        const box = element.getBoundingClientRect();
        const media = element.querySelector(".dish-dialog__media").getBoundingClientRect();
        const body = element.querySelector(".dish-dialog__body").getBoundingClientRect();
        return {
          inside: box.left >= 0 && box.top >= 0 && box.right <= window.innerWidth && box.bottom <= window.innerHeight,
          stacked: media.bottom <= body.top + 1,
          dialogOverflow: element.scrollWidth - element.clientWidth,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
      assert.deepEqual(layout, { inside: true, stacked: true, dialogOverflow: 0, pageOverflow: 0 });
      assert.deepEqual(await readCardBoxes(page), boxes, "Opening details must not resize or move any card");
      await page.locator("#dish-dialog .dish-dialog__close").click();
      await waitForDialog(page, false);
      assert.equal(await isFocused(action(page, 2)), true);
    }
  },
  {
    label: "short viewports scroll inside the dialog and keep the close button in reach",
    viewport: { width: 740, height: 360 },
    run: async (page) => {
      await openWithMouse(page, 3);
      await assertDialogMirrors(page, 3, "short viewport");
      const scrolled = await page.locator("#dish-dialog").evaluate(async (element) => {
        const box = element.getBoundingClientRect();
        const scrollable = element.scrollHeight > element.clientHeight;
        const pageScroll = window.scrollY;
        element.scrollTop = element.scrollHeight;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const close = element.querySelector(".dish-dialog__close").getBoundingClientRect();
        return {
          fits: box.top >= 0 && box.bottom <= window.innerHeight,
          scrollable,
          scrolled: element.scrollTop > 0,
          closeInView: close.top >= box.top && close.bottom <= box.bottom,
          pageStill: window.scrollY === pageScroll
        };
      });
      assert.deepEqual(scrolled, { fits: true, scrollable: true, scrolled: true, closeInView: true, pageStill: true });
      await page.locator("#dish-dialog .dish-dialog__close").click();
      await waitForDialog(page, false);
    }
  },
  {
    label: "native details remain usable with JavaScript disabled",
    javaScriptEnabled: false,
    run: async (page) => {
      assert.equal(await page.locator("body").evaluate((element) => element.classList.contains("no-js")), true);
      assert.equal(await page.locator(actionSelector).count(), 4, "Each card must ship its action markup");
      for (const locator of await page.locator(actionSelector).all()) {
        assert.equal(await locator.isVisible(), false, "The JavaScript-only action must stay hidden");
      }
      assert.equal(await page.locator("#dish-dialog").isVisible(), false, "The dialog must stay closed without JavaScript");

      const boxes = await readCardBoxes(page);
      await summary(page, 0).click();
      await assertPanels(page, [true, false, false, false]);
      assert.equal(await panel(page, 0).locator(".dish-more__content").isVisible(), true);
      assert.match(await panel(page, 0).locator(".dish-more__content").innerText(), /Alergeny:/);
      assert.deepEqual((await readCardBoxes(page))[1], boxes[1], "An open disclosure must not stretch its neighbour");
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
      const acceptDemoLegal = javaScriptEnabled && scenario.acceptDemoLegal !== false;
      const context = await browser.newContext({
        javaScriptEnabled, serviceWorkers: "block", reducedMotion: "reduce",
        viewport: scenario.viewport || { width: 1280, height: 900 }
      });
      const runtimeErrors = [];
      try {
        if (acceptDemoLegal) {
          await context.addInitScript(() => { localStorage.setItem("demoLegalAccepted", "true"); });
        }
        const page = await context.newPage();
        page.setDefaultTimeout(10000);
        page.on("pageerror", (error) => runtimeErrors.push(error.message));
        await page.goto(baseUrl + "/menu.html", { waitUntil: "load" });
        assert.equal(await page.locator(panelSelector).count(), 4, "Use the actual menu's native panels");
        if (javaScriptEnabled) {
          await page.locator("html[data-theme-ready]").waitFor({ state: "attached" });
          await action(page, 0).waitFor({ state: "visible" });
          if (acceptDemoLegal) await page.locator("#demo-legal-modal").waitFor({ state: "hidden" });
        } else {
          await summary(page, 0).waitFor({ state: "visible" });
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

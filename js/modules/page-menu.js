import { log } from "./utils.js";

// Dish photographs ship as square -600/-1200 JPEGs with AVIF/WebP twins under
// `_optimized/`, the same convention the lightbox resolves from `data-full`.
// From 720px the dialog shows the photograph in a half-width column of about
// 28rem (see `css/pages/menu.css`); below that it spans the dialog.
const PHOTO_WIDTHS = [600, 1200];
const PHOTO_SIZES = "(min-width: 720px) 28rem, 100vw";

export function initPageMenuPanel() {
  const page = document.querySelector("main.page-menu");
  const dialog = page?.querySelector(".dish-dialog");
  // Without native modal dialogs the cards keep their inline disclosures.
  if (!dialog || typeof dialog.showModal !== "function") return;

  const closeButton = dialog.querySelector(".dish-dialog__close");
  const sourceAvif = dialog.querySelector('source[type="image/avif"]');
  const sourceWebp = dialog.querySelector('source[type="image/webp"]');
  const title = dialog.querySelector(".dish-dialog__title");
  const price = dialog.querySelector(".dish-dialog__price");
  const text = dialog.querySelector(".dish-dialog__text");
  const facts = dialog.querySelector(".dish-dialog__facts");
  const allergens = dialog.querySelector(".dish-dialog__allergens");
  let image = dialog.querySelector(".dish-dialog__image");
  const parts = [closeButton, sourceAvif, sourceWebp, image, title, price, text, facts, allergens];
  if (!parts.every(Boolean)) return;

  // A fresh, still-empty <img> per dish: an updated src keeps painting the
  // previous photograph until the next one loads, a new element does not.
  const imageTemplate = image.cloneNode(false);
  const root = document.documentElement;
  let opener = null;
  let pressedBackdrop = false;
  let lockedRootStyle = null;

  // The page stays where it was while a dish is open. A classic scrollbar
  // keeps its gutter so the layout behind the backdrop does not shift; overlay
  // and hidden scrollbars take no space, so none is reserved for them.
  const lockPage = () => {
    if (lockedRootStyle) return;
    const scrollbar = window.innerWidth - root.clientWidth;
    lockedRootStyle = { overflow: root.style.overflow, scrollbarGutter: root.style.scrollbarGutter };
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.scrollbarGutter = "stable";
  };

  const unlockPage = () => {
    if (!lockedRootStyle) return;
    root.style.overflow = lockedRootStyle.overflow;
    root.style.scrollbarGutter = lockedRootStyle.scrollbarGutter;
    lockedRootStyle = null;
  };

  const readText = (root, selector) => (root.querySelector(selector)?.textContent || "").replace(/\s+/g, " ").trim();

  const photoSet = (base, extension) => PHOTO_WIDTHS.map((width) => `${base}-${width}.${extension} ${width}w`).join(", ");

  const showPhoto = (dish) => {
    const thumb = dish.querySelector(".dish__thumb");
    const base = (thumb?.dataset.full || "").replace(/-1200$/, "");
    const optimizedBase = base.replace("/assets/img/", "/assets/img/_optimized/");
    const next = imageTemplate.cloneNode(false);

    if (base) {
      sourceAvif.srcset = photoSet(optimizedBase, "avif");
      sourceWebp.srcset = photoSet(optimizedBase, "webp");
      [sourceAvif, sourceWebp, next].forEach((node) => {
        node.sizes = PHOTO_SIZES;
      });
      next.srcset = photoSet(base, "jpg");
      next.src = `${base}-1200.jpg`;
      next.alt = thumb.querySelector("img")?.alt || "";
    } else {
      sourceAvif.removeAttribute("srcset");
      sourceWebp.removeAttribute("srcset");
    }

    image.replaceWith(next);
    image = next;
  };

  // The card stays the single source of its copy: the dialog only mirrors it.
  const fill = (dish) => {
    title.textContent = readText(dish, ".dish__title");
    price.textContent = readText(dish, ".dish__price");
    text.textContent = readText(dish, ".dish-more__text");
    allergens.textContent = readText(dish, ".dish-more__allergen-list");
    facts.hidden = !allergens.textContent;
    showPhoto(dish);
  };

  const open = (button) => {
    const dish = button.closest(".dish");
    // The demo-information dialog and the mobile drawer make the page inert; never open over them.
    if (!dish || button.closest("[inert]")) return;

    fill(dish);
    opener = button;
    if (!dialog.open) {
      lockPage();
      try {
        dialog.showModal();
      } catch (error) {
        unlockPage();
        opener = null;
        log(error);
        return;
      }
    }
    dialog.scrollTop = 0;
    closeButton.focus();
  };

  // Escape (the native cancel), the close button and a backdrop click all end
  // here, so the page is released and focus returns to the card the dish was
  // opened from.
  dialog.addEventListener("close", () => {
    const target = opener;
    opener = null;
    unlockPage();
    if (target?.isConnected && !target.hidden) target.focus({ preventScroll: true });
  });

  closeButton.addEventListener("click", () => dialog.close());

  // Only a press that starts and ends on the backdrop dismisses: selecting
  // text and releasing outside the panel, or using its scrollbar, does not.
  const isOnBackdrop = (event) => {
    if (event.target !== dialog) return false;
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };

  dialog.addEventListener("pointerdown", (event) => {
    pressedBackdrop = isOnBackdrop(event);
  });

  dialog.addEventListener("click", (event) => {
    if (pressedBackdrop && isOnBackdrop(event)) dialog.close();
    pressedBackdrop = false;
  });

  // The action replaces the native disclosure only now that the dialog can
  // open; without this module the disclosure stays the card's fallback.
  page.querySelectorAll(".dish").forEach((dish) => {
    const action = dish.querySelector(".dish__action");
    const details = dish.querySelector(".dish-more");
    if (!action || !details) return;

    action.addEventListener("click", () => open(action));
    details.open = false;
    details.hidden = true;
    action.hidden = false;
  });

  log();
}

import { log } from "./utils.js";

export function initPageMenuPanel() {
  const page = document.querySelector("main.page-menu");
  if (!page) return;

  document.addEventListener(
    "click",
    (event) => {
      if (page.contains(event.target.closest(".dish-more"))) return;
      const openPanels = page.querySelectorAll(".dish-more[open]");
      if (!openPanels.length) return;
      openPanels.forEach((panel) => panel.removeAttribute("open"));
    },
    { passive: true }
  );

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    page.querySelectorAll(".dish-more[open]").forEach((panel) => panel.removeAttribute("open"));
  });

  // Native details toggle events do not bubble; observe them during capture.
  page.addEventListener(
    "toggle",
    (event) => {
      const target = event.target;
      if (!target.matches?.(".dish-more") || !target.open) return;
      page.querySelectorAll(".dish-more[open]").forEach((panel) => {
        if (panel !== target) panel.removeAttribute("open");
      });
    },
    { capture: true }
  );

  log();
}

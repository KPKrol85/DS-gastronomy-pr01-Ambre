import { log } from "./modules/utils.js";

/**
 * Central SVG icon registry.
 *
 * Icons are declared once here and rendered into `[data-icon="<name>"]` hosts
 * during boot, so markup stays free of inline path data and presentation stays
 * in CSS. Every icon paints with `currentColor` and is decorative by default;
 * set `data-icon-title` when an icon has to carry its own accessible name.
 */

const ICONS = {
  google: {
    viewBox: "0 0 640 640",
    path: "M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z"
  }
};

const escapeAttribute = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function iconMarkup(name, { className = "icon", title = "" } = {}) {
  const icon = ICONS[name];
  if (!icon) return "";

  const classAttr = className ? ` class="${escapeAttribute(className)}"` : "";
  const labelAttrs = title ? ` role="img" aria-label="${escapeAttribute(title)}"` : ' aria-hidden="true"';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}" fill="currentColor" focusable="false"${classAttr}${labelAttrs}><path d="${icon.path}" /></svg>`;
}

export function initIcons(root = document) {
  const hosts = root.querySelectorAll("[data-icon]:not([data-icon-ready])");
  if (!hosts.length) return;

  hosts.forEach((host) => {
    const markup = iconMarkup(host.dataset.icon, {
      className: host.dataset.iconClass ?? "icon",
      title: host.dataset.iconTitle ?? ""
    });
    if (!markup) return;

    host.innerHTML = markup;
    host.dataset.iconReady = "";
  });

  log(hosts.length);
}

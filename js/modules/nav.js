import { $, $$, byTestId, getFocusable, log } from "./utils.js";

const normalizePathname = (pathname) => {
  const withLeading = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const trimmed = withLeading.replace(/\/+$/, "");
  if (!trimmed || trimmed === "/") return "/index.html";
  return trimmed;
};

const extractHashTarget = (href, { samePageOnly = false } = {}) => {
  if (!href || href === "#") return "";
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return "";
  }

  const rawHash = url.hash ? url.hash.slice(1) : "";
  if (!rawHash) return "";

  if (samePageOnly) {
    const currentPath = normalizePathname(window.location.pathname);
    const targetPath = normalizePathname(url.pathname);
    if (currentPath !== targetPath) return "";
  }

  try {
    return decodeURIComponent(rawHash);
  } catch {
    return rawHash;
  }
};

export function initMobileNav() {
  const toggle = byTestId("site-header__nav-toggle") || $(".site-header__nav-toggle");
  const nav = byTestId("site-header-nav") || $("#site-header-nav");
  if (!toggle || !nav) return;

  const overlay = $(".site-header__overlay");
  const drawer = $(".site-header__drawer");
  const drawerInner = $(".site-header__drawer-inner", drawer || document);
  const navList = nav.querySelector("ul");
  if (drawerInner && navList && !drawerInner.children.length) {
    drawerInner.appendChild(navList.cloneNode(true));
  }
  if (drawerInner) {
    drawerInner.querySelectorAll(".site-header__item--has-submenu").forEach((item) => {
      if (item.querySelector(".site-header__drawer-trigger")) return;
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "site-header__drawer-trigger";
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-label", "Pokaż podmenu");
      const submenu = item.querySelector(".site-header__submenu");
      if (submenu) {
        item.insertBefore(trigger, submenu);
      }
    });
  }

  // The drawer is cloned before initSmartNav(), initAriaCurrent() and initScrollspy()
  // resolve the header navigation, so mirror the resolved header links onto the clone.
  // Both lists keep the same anchor order, which makes the pairing stable.
  const sourceLinks = navList ? Array.from(navList.querySelectorAll("a")) : [];
  const drawerLinks = drawerInner ? Array.from(drawerInner.querySelectorAll("a")) : [];
  const canSyncDrawer = sourceLinks.length > 0 && sourceLinks.length === drawerLinks.length;
  const syncDrawerNavState = () => {
    if (!canSyncDrawer) return;
    sourceLinks.forEach((source, index) => {
      const target = drawerLinks[index];
      const href = source.getAttribute("href");
      if (href !== null && target.getAttribute("href") !== href) target.setAttribute("href", href);
      const current = source.getAttribute("aria-current");
      if (!current) {
        target.removeAttribute("aria-current");
      } else if (target.getAttribute("aria-current") !== current) {
        target.setAttribute("aria-current", current);
      }
    });
  };

  const mq = window.matchMedia("(min-width: 940px)");
  let previouslyFocused = null;
  const backgroundInertState = new Map();
  // Same save/restore isolation as the demo-information dialog: everything except the
  // drawer and its dismissal overlay leaves focus and the accessibility tree, and closing
  // restores each element's earlier inertness instead of clearing it.
  const setBackgroundInert = (shouldBeInert) => {
    if (shouldBeInert) {
      if (!drawer) return;
      backgroundInertState.clear();
      Array.from(document.body.children).forEach((element) => {
        if (element === drawer || element === overlay) return;
        backgroundInertState.set(element, element.hasAttribute("inert"));
        element.setAttribute("inert", "");
      });
      return;
    }

    backgroundInertState.forEach((wasInert, element) => {
      if (!element.isConnected) return;
      if (wasInert) element.setAttribute("inert", "");
      else element.removeAttribute("inert");
    });
    backgroundInertState.clear();
  };
  const trapFocus = (event) => {
    if (event.key !== "Tab" || !document.body.classList.contains("site-header-nav-open")) return;
    const focusable = getFocusable(drawer);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (drawer && !drawer.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };
  const setOpen = (open, { restoreFocus = true } = {}) => {
    const wasOpen = document.body.classList.contains("site-header-nav-open");
    // An open demo-information dialog also makes the drawer inert; never take over its isolation or focus.
    if (open && !wasOpen && drawer?.closest("[inert]")) return;
    if (open && !wasOpen) previouslyFocused = document.activeElement;
    if (open) {
      syncDrawerNavState();
      if (overlay) overlay.hidden = false;
      if (drawer) drawer.hidden = false;
    }
    document.body.classList.toggle("site-header-nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (drawer) {
      drawer.setAttribute("aria-hidden", String(!open));
      if (open) drawer.setAttribute("aria-modal", "true");
      else drawer.removeAttribute("aria-modal");
    }
    if (open) {
      const focusable = getFocusable(drawer);
      if (focusable.length) focusable[0].focus();
      if (!wasOpen) setBackgroundInert(true);
      document.addEventListener("keydown", trapFocus);
    } else {
      document.removeEventListener("keydown", trapFocus);
      // The opener lives in the background, so release it before focus is restored.
      setBackgroundInert(false);
      if (overlay) overlay.hidden = true;
      if (drawer) drawer.hidden = true;
      if (wasOpen && restoreFocus) {
        const target = previouslyFocused && typeof previouslyFocused.focus === "function" ? previouslyFocused : toggle;
        if (target && typeof target.focus === "function") target.focus();
      }
      previouslyFocused = null;
    }
  };

  if (!toggle.hasAttribute("aria-controls") && drawer?.id) {
    toggle.setAttribute("aria-controls", drawer.id);
  }

  toggle.addEventListener("click", () => setOpen(!document.body.classList.contains("site-header-nav-open")), { passive: true });

  nav.addEventListener(
    "click",
    (event) => {
      if (event.target.closest("a")) setOpen(false);
    },
    { passive: true }
  );

  drawer?.addEventListener(
    "click",
    (event) => {
      const trigger = event.target.closest(".site-header__drawer-trigger");
      if (trigger) {
        const item = trigger.closest(".site-header__item--has-submenu");
        if (!item) return;
        const isOpen = !item.classList.contains("site-header__item--accordion-open");
        item.classList.toggle("site-header__item--accordion-open", isOpen);
        trigger.setAttribute("aria-expanded", String(isOpen));
        return;
      }
      if (event.target.closest("a")) setOpen(false);
    },
    { passive: true }
  );

  overlay?.addEventListener("click", () => setOpen(false), { passive: true });

  let wasDesktop = mq.matches;
  const handleResize = () => {
    const isDesktop = mq.matches;
    if (isDesktop && !wasDesktop) {
      const active = document.activeElement;
      // CSS can move focus to body before this breakpoint handler runs.
      const needsFocus = active === toggle || drawer?.contains(active) ||
        (document.body.classList.contains("site-header-nav-open") && active === document.body);
      setOpen(false, { restoreFocus: false });
      if (needsFocus) $(".site-header__brand")?.focus({ preventScroll: true });
    }
    wasDesktop = isDesktop;
  };

  mq.addEventListener?.("change", handleResize);
  window.addEventListener("resize", handleResize, { passive: true });

  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("site-header-nav-open")) return;
    const insideNav = event.target.closest("#site-header-nav");
    const insideToggle = event.target.closest(".site-header__nav-toggle");
    const insideDrawer = event.target.closest(".site-header__drawer");
    if (!insideNav && !insideToggle && !insideDrawer) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("site-header-nav-open")) {
      setOpen(false);
    }
  });

  log();
}

export function initScrollspy() {
  const navRoot = document.getElementById("site-header-nav");
  if (!navRoot) return;

  const parsed = $$("#site-header-nav a[href]").map((link) => ({
    link,
    id: extractHashTarget(link.getAttribute("href"), { samePageOnly: true }),
  }));
  const samePageLinks = parsed.filter((item) => item.id);
  if (!samePageLinks.length) return;

  const map = new Map();
  samePageLinks.forEach(({ id, link }) => {
    if (!map.has(id)) map.set(id, link);
  });
  const links = Array.from(map.values());

  const setCurrent = (id) => {
    if (!id || !map.has(id)) return;
    links.forEach((link) => link.removeAttribute("aria-current"));
    map.get(id)?.setAttribute("aria-current", "location");
  };

  const sections = Array.from(map.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));

  navRoot.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;
      const id = extractHashTarget(link.getAttribute("href"), { samePageOnly: true });
      if (!id) return;
      setCurrent(id);
    },
    { passive: true }
  );

  if (location.hash) {
    const currentId = extractHashTarget(location.hash, { samePageOnly: true });
    if (currentId) setCurrent(currentId);
  }
  log(links.length);
}

export function initSmartNav() {
  const path = location.pathname;
  if (/(?:^|\/)(index\.html)?$/.test(path) || path.endsWith("/")) return;

  const map = {
    menu: "menu.html",
    galeria: "galeria.html",
  };

  const links = document.querySelectorAll(".site-header__nav a[href]");
  if (!links.length) return;

  links.forEach((link) => {
    const targetId = extractHashTarget(link.getAttribute("href"));
    const replacement = targetId ? map[targetId] : "";
    if (replacement) link.setAttribute("href", replacement);
  });

  log(links.length);
}

export function initAriaCurrent() {
  const nav = document.querySelector(".site-header__nav");
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll("a"));
  const path = (location.pathname.split("/").pop() || "").replace(".html", "");
  const hash = (location.hash || "").replace("#", "");

  links.forEach((link) => link.removeAttribute("aria-current"));

  const matches = (link, value) => {
    if (!value) return false;
    const href = link.getAttribute("href") || "";
    return href.includes(`#${value}`) || href.endsWith(`${value}.html`) || href.includes(`/${value}.html`) || href.includes(`/${value}`);
  };

  if (path) {
    for (const link of links) {
      if (matches(link, path)) {
        link.setAttribute("aria-current", "page");
        return;
      }
    }
  }

  if (hash) {
    for (const link of links) {
      if (matches(link, hash)) {
        link.setAttribute("aria-current", "page");
        return;
      }
    }
  }

  log(links.length);
}

export function initStickyShadow() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const threshold = 12;
  let lastY = window.scrollY || window.pageYOffset || 0;
  let ticking = false;

  const apply = () => {
    const scrolled = lastY > threshold;
    document.body.classList.toggle("site-header-is-scrolled", scrolled);
    document.body.classList.toggle("site-header-is-shrunk", scrolled);
    ticking = false;
  };

  const schedule = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(apply);
  };

  const onScrollLike = () => {
    lastY = window.scrollY || window.pageYOffset || 0;
    schedule();
  };

  onScrollLike();
  window.addEventListener("scroll", onScrollLike, { passive: true });
  window.addEventListener("resize", onScrollLike, { passive: true });
  window.addEventListener("pageshow", onScrollLike);
  log();
}

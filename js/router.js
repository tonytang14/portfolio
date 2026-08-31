(function () {
  const SITE_BASE = detectSiteBase();
  const ROOT_URL = SITE_BASE ? `${SITE_BASE}/` : "/";
  const PAGE_SCRIPTS = [
    "pdf-embed.js",
    "pdf-zoom.js",
    "image-zoom.js",
    "contact-form.js",
    "wave-generator-media.js",
  ];

  function detectSiteBase() {
    const path = location.pathname;
    const pagesIndex = path.indexOf("/pages/");

    if (pagesIndex !== -1) {
      return path.slice(0, pagesIndex);
    }

    if (path.endsWith("/index.html")) {
      return path.slice(0, -"/index.html".length);
    }

    if (path.endsWith("/") && path.length > 1) {
      return path.slice(0, -1);
    }

    return "";
  }

  function getRouteFromPathname(pathname) {
    const pagesIndex = pathname.indexOf("/pages/");

    if (pagesIndex !== -1) {
      return pathname.slice(pagesIndex + 1);
    }

    return "index.html";
  }

  function getCurrentRoute() {
    if (history.state?.route) {
      return history.state.route;
    }

    return getRouteFromPathname(location.pathname);
  }

  function getRouteDirectory(route) {
    if (route === "index.html") {
      return `${SITE_BASE}/`;
    }

    const slashIndex = route.lastIndexOf("/");
    if (slashIndex === -1) {
      return `${SITE_BASE}/`;
    }

    return `${SITE_BASE}/${route.slice(0, slashIndex + 1)}`;
  }

  function resolveRouteFromHref(href) {
    if (!href) return null;

    try {
      const route = getCurrentRoute();
      const baseUrl = `${location.origin}${getRouteDirectory(route)}`;
      const resolved = new URL(href, baseUrl);
      let path = resolved.pathname;

      if (SITE_BASE && path.startsWith(SITE_BASE)) {
        path = path.slice(SITE_BASE.length);
      }

      path = path.replace(/^\//, "");

      if (!path || path === "index.html") {
        return "index.html";
      }

      if (path.startsWith("pages/")) {
        return path;
      }

      return null;
    } catch {
      return null;
    }
  }

  function isInternalNavigationLink(anchor) {
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
      return false;
    }

    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
      return false;
    }

    try {
      return new URL(href, location.href).origin === location.origin;
    } catch {
      return false;
    }
  }

  function pageUrl(route) {
    return route === "index.html" ? `${SITE_BASE}/index.html` : `${SITE_BASE}/${route}`;
  }

  function normalizeScriptSrc(src) {
    if (src.startsWith("../")) {
      return `${SITE_BASE}/${src.slice(3)}`;
    }

    if (src.startsWith("js/")) {
      return `${SITE_BASE}/${src}`;
    }

    return src;
  }

  function reloadPageScripts(doc) {
    PAGE_SCRIPTS.forEach((name) => {
      document.querySelectorAll(`script[src*="${name}"]`).forEach((script) => script.remove());
    });

    doc.querySelectorAll("script[src]").forEach((oldScript) => {
      const src = oldScript.getAttribute("src");
      if (!src || src.includes("particles.js") || src.includes("router.js")) {
        return;
      }

      const script = document.createElement("script");
      script.src = normalizeScriptSrc(src);
      document.body.appendChild(script);
    });
  }

  function updateNavigation(route) {
    document.querySelectorAll(".site-nav a[href]").forEach((link) => {
      const linkRoute = resolveRouteFromHref(link.getAttribute("href"));

      if (linkRoute === route) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function applyPage(doc) {
    document.title = doc.title;
    document.body.className = doc.body.className;

    const currentMain = document.querySelector("main");
    const nextMain = doc.querySelector("main");

    if (currentMain && nextMain) {
      currentMain.replaceWith(document.importNode(nextMain, true));
    }

    const currentAside = document.querySelector(".detail-section-nav");
    const nextAside = doc.querySelector(".detail-section-nav");
    const siteShell = document.querySelector(".site-shell");
    const shellMain = document.querySelector("main");

    if (currentAside && !nextAside) {
      currentAside.remove();
    } else if (!currentAside && nextAside && siteShell && shellMain) {
      siteShell.insertBefore(document.importNode(nextAside, true), shellMain);
    } else if (currentAside && nextAside) {
      currentAside.replaceWith(document.importNode(nextAside, true));
    }

    document.querySelectorAll(".pdf-zoom-modal, .image-zoom-modal").forEach((node) => node.remove());
    doc.querySelectorAll(".pdf-zoom-modal, .image-zoom-modal").forEach((node) => {
      document.body.appendChild(document.importNode(node, true));
    });

    reloadPageScripts(doc);
  }

  async function loadPage(route, push) {
    const response = await fetch(pageUrl(route));

    if (!response.ok) {
      throw new Error(`Could not load ${route}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    applyPage(doc);
    updateNavigation(route);

    if (push) {
      history.pushState({ route }, "", ROOT_URL);
    }

    window.scrollTo(0, 0);
  }

  function normalizeLocationUrl() {
    const route = getCurrentRoute();

    if (location.pathname !== new URL(ROOT_URL, location.origin).pathname) {
      history.replaceState({ route }, "", ROOT_URL);
      return;
    }

    if (!history.state?.route) {
      history.replaceState({ route }, "", ROOT_URL);
    }
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || !isInternalNavigationLink(link)) {
      return;
    }

    const route = resolveRouteFromHref(link.getAttribute("href"));
    if (!route || route === getCurrentRoute()) {
      return;
    }

    event.preventDefault();
    loadPage(route, true).catch(() => {
      window.location.href = link.href;
    });
  });

  window.addEventListener("popstate", (event) => {
    const route = event.state?.route || "index.html";
    loadPage(route, false).catch(() => {
      window.location.assign(ROOT_URL);
    });
  });

  normalizeLocationUrl();
})();

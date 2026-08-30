(function () {
  const mobileQuery = window.matchMedia("(max-width: 1100px)");
  const DESKTOP_PDF_PARAMS = "#page=1&view=FitH&navpanes=0";

  function getPdfUrl(wrap) {
    const trigger = wrap.querySelector(".pdf-zoom-trigger");
    if (trigger?.dataset.pdfSrc) return trigger.dataset.pdfSrc;

    const iframe = wrap.querySelector("iframe");
    if (!iframe) return null;

    const src = iframe.getAttribute("src");
    return src ? src.split("#")[0] : null;
  }

  function getPreviewLabel(wrap) {
    if (wrap.dataset.pdfPreviewLabel) return wrap.dataset.pdfPreviewLabel;

    const figcaption = wrap.closest("figure")?.querySelector(".detail-pdf-label");
    if (figcaption) return `Preview ${figcaption.textContent.trim()}`;

    const trigger = wrap.querySelector(".pdf-zoom-trigger");
    if (trigger?.dataset.pdfTitle) return `Preview ${trigger.dataset.pdfTitle}`;

    const iframe = wrap.querySelector("iframe");
    if (iframe?.title) return `Preview ${iframe.title}`;

    return "Preview PDF";
  }

  function mountMobileLink(wrap) {
    if (!mobileQuery.matches || wrap.dataset.pdfLinkMounted === "true") return;

    const url = getPdfUrl(wrap);
    if (!url) return;

    const iframe = wrap.querySelector("iframe");
    const trigger = wrap.querySelector(".pdf-zoom-trigger");

    const link = document.createElement("a");
    link.className = "pdf-preview-link";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = getPreviewLabel(wrap);

    wrap.insertBefore(link, wrap.firstChild);

    if (iframe) iframe.hidden = true;
    if (trigger) trigger.hidden = true;

    wrap.dataset.pdfLinkMounted = "true";
    wrap.classList.add("pdf-embed-wrap--mobile-link");
  }

  function unmountMobileLink(wrap) {
    if (wrap.dataset.pdfLinkMounted !== "true") return;

    const link = wrap.querySelector(".pdf-preview-link");
    const iframe = wrap.querySelector("iframe");
    const trigger = wrap.querySelector(".pdf-zoom-trigger");

    if (link) link.remove();
    if (iframe) iframe.hidden = false;
    if (trigger) trigger.hidden = false;

    delete wrap.dataset.pdfLinkMounted;
    wrap.classList.remove("pdf-embed-wrap--mobile-link");
  }

  function ensureClipWrapper(iframe) {
    if (iframe.parentElement?.classList.contains("pdf-embed-clip")) return;

    const clip = document.createElement("div");
    clip.className = "pdf-embed-clip";
    iframe.parentNode.insertBefore(clip, iframe);
    clip.appendChild(iframe);
  }

  function removeClipWrapper(wrap) {
    const clip = wrap.querySelector(".pdf-embed-clip");
    const iframe = clip?.querySelector("iframe");
    if (!clip || !iframe) return;

    wrap.insertBefore(iframe, clip);
    clip.remove();
  }

  function configureDesktopEmbed(wrap) {
    const iframe = wrap.querySelector("iframe");
    if (!iframe || mobileQuery.matches) return;

    ensureClipWrapper(iframe);

    const url = getPdfUrl(wrap);
    if (!url) return;

    const desiredSrc = `${url}${DESKTOP_PDF_PARAMS}`;
    iframe.setAttribute("scrolling", "no");
    if (iframe.getAttribute("src") !== desiredSrc) {
      iframe.src = desiredSrc;
    }
  }

  function configureEmbeds() {
    document.querySelectorAll(".pdf-embed-wrap").forEach((wrap) => {
      if (mobileQuery.matches) {
        removeClipWrapper(wrap);
        mountMobileLink(wrap);
      } else {
        unmountMobileLink(wrap);
        configureDesktopEmbed(wrap);
      }
    });
  }

  configureEmbeds();
  mobileQuery.addEventListener("change", configureEmbeds);
})();

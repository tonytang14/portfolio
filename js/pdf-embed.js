(function () {
  const mobileQuery = window.matchMedia("(max-width: 1100px)");
  const PDFJS_VERSION = "3.11.174";
  const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

  let pdfJsLoadPromise = null;

  function loadPdfJs() {
    if (window.pdfjsLib) {
      return Promise.resolve(window.pdfjsLib);
    }

    if (!pdfJsLoadPromise) {
      pdfJsLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${PDFJS_CDN}/pdf.min.js`;
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            `${PDFJS_CDN}/pdf.worker.min.js`;
          resolve(window.pdfjsLib);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return pdfJsLoadPromise;
  }

  function getPdfUrl(wrap) {
    const iframe = wrap.querySelector("iframe");
    if (!iframe) return null;

    const dataSrc = iframe.getAttribute("data-pdf-src");
    if (dataSrc) return dataSrc;

    const src = iframe.getAttribute("src");
    return src ? src.split("#")[0] : null;
  }

  async function renderPdfPages(container, url, pdfjsLib) {
    container.innerHTML = "";
    const loading = document.createElement("p");
    loading.className = "pdf-js-loading";
    loading.textContent = "Loading document…";
    container.appendChild(loading);

    const pdf = await pdfjsLib.getDocument(url).promise;
    container.innerHTML = "";

    const containerWidth = container.clientWidth || wrapWidth(container);

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / baseViewport.width;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.className = "pdf-js-page";
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.setAttribute("aria-label", `Page ${pageNum}`);
      container.appendChild(canvas);

      await page.render({
        canvasContext: canvas.getContext("2d"),
        viewport,
      }).promise;
    }
  }

  function wrapWidth(container) {
    const wrap = container.closest(".pdf-embed-wrap");
    return wrap ? wrap.clientWidth : Math.min(window.innerWidth - 32, 680);
  }

  async function mountMobileViewer(wrap) {
    if (!mobileQuery.matches || wrap.dataset.pdfJsMounted === "true") {
      return;
    }

    const url = getPdfUrl(wrap);
    if (!url) return;

    const iframe = wrap.querySelector("iframe");
    const pdfjsLib = await loadPdfJs();

    const viewer = document.createElement("div");
    viewer.className = "pdf-js-viewer";
    viewer.setAttribute("role", "document");

    if (iframe) {
      iframe.hidden = true;
      wrap.insertBefore(viewer, iframe);
    } else {
      wrap.appendChild(viewer);
    }

    wrap.dataset.pdfJsMounted = "true";

    try {
      await renderPdfPages(viewer, url, pdfjsLib);
    } catch (error) {
      viewer.innerHTML = "";
      const fallback = document.createElement("a");
      fallback.className = "pdf-mobile-fallback";
      fallback.href = url;
      fallback.target = "_blank";
      fallback.rel = "noopener noreferrer";
      fallback.textContent = "Open PDF";
      viewer.appendChild(fallback);
    }
  }

  function unmountMobileViewer(wrap) {
    if (wrap.dataset.pdfJsMounted !== "true") return;

    const viewer = wrap.querySelector(".pdf-js-viewer");
    const iframe = wrap.querySelector("iframe");

    if (viewer) viewer.remove();
    if (iframe) iframe.hidden = false;

    delete wrap.dataset.pdfJsMounted;
  }

  function configureEmbeds() {
    document.querySelectorAll(".pdf-embed-wrap").forEach((wrap) => {
      if (mobileQuery.matches) {
        mountMobileViewer(wrap);
      } else {
        unmountMobileViewer(wrap);
      }
    });
  }

  configureEmbeds();
  mobileQuery.addEventListener("change", configureEmbeds);
  window.addEventListener("resize", () => {
    if (!mobileQuery.matches) return;

    document.querySelectorAll(".pdf-embed-wrap[data-pdf-js-mounted='true']").forEach((wrap) => {
      const viewer = wrap.querySelector(".pdf-js-viewer");
      const url = getPdfUrl(wrap);
      if (!viewer || !url || !window.pdfjsLib) return;

      renderPdfPages(viewer, url, window.pdfjsLib).catch(() => {});
    });
  });
})();

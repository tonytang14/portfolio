(function () {
  const modal = document.querySelector(".pdf-zoom-modal");
  const modalFrame = document.querySelector(".pdf-zoom-modal-frame");
  const modalDialog = document.querySelector(".pdf-zoom-dialog");
  const triggers = document.querySelectorAll(".pdf-zoom-trigger");

  if (!modal || !modalFrame || !triggers.length) return;

  const PDF_PARAMS = "#navpanes=0&view=FitH&page=1";
  let lastFocusedElement = null;

  function openModal(src, title) {
    lastFocusedElement = document.activeElement;
    modalFrame.src = `${src}${PDF_PARAMS}`;
    modalFrame.title = title;
    if (modalDialog) {
      modalDialog.setAttribute("aria-label", title);
    }
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.querySelector(".pdf-zoom-close").focus();
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modalFrame.removeAttribute("src");
    document.body.style.overflow = "";

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const src = trigger.dataset.pdfSrc;
      const title = trigger.dataset.pdfTitle || "Fullscreen PDF";
      if (src) openModal(src, title);
    });
  });

  modal.querySelectorAll("[data-pdf-close]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
})();

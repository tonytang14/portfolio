(function () {
  const modal = document.querySelector(".image-zoom-modal");
  const modalImage = document.querySelector(".image-zoom-modal-img");
  const triggers = document.querySelectorAll(".image-zoom-trigger");

  if (!modal || !modalImage || !triggers.length) return;

  let lastFocusedElement = null;

  function openModal(src, alt) {
    lastFocusedElement = document.activeElement;
    modalImage.src = src;
    modalImage.alt = alt;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.querySelector(".image-zoom-close").focus();
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modalImage.removeAttribute("src");
    document.body.style.overflow = "";

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const src = trigger.dataset.zoomSrc;
      const alt = trigger.dataset.zoomAlt || "";
      if (src) openModal(src, alt);
    });
  });

  modal.querySelectorAll("[data-zoom-close]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
})();

(function () {
  const grid = document.querySelector(".detail-photo-video-grid");
  const photo = grid?.querySelector(".detail-photo-video-grid__photo img");
  const frame = grid?.querySelector(".detail-photo-video-grid__video .video-media-frame");
  const video = frame?.querySelector("video");

  if (!photo || !frame || !video) return;

  const VIDEO_RATIO = 9 / 16;
  const mobileQuery = window.matchMedia("(max-width: 680px)");

  function clearInlineSizes() {
    frame.style.removeProperty("height");
    frame.style.removeProperty("width");
  }

  function syncVideoToPhoto() {
    if (mobileQuery.matches) {
      clearInlineSizes();
      return;
    }

    const photoHeight = photo.getBoundingClientRect().height;
    if (!photoHeight) return;

    frame.style.height = `${photoHeight}px`;
    frame.style.width = `${photoHeight * VIDEO_RATIO}px`;
  }

  function scheduleSync() {
    window.requestAnimationFrame(syncVideoToPhoto);
  }

  if (photo.complete) {
    scheduleSync();
  } else {
    photo.addEventListener("load", scheduleSync);
  }

  video.addEventListener("loadedmetadata", scheduleSync);
  window.addEventListener("resize", scheduleSync);
  mobileQuery.addEventListener("change", scheduleSync);

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(scheduleSync);
    observer.observe(photo);
  }
})();

(function () {
  const form = document.querySelector(".contact-form");
  const nextInput = document.querySelector('input[name="_next"]');
  const successMessage = document.querySelector(".contact-success");

  if (nextInput && window.location.href.startsWith("http")) {
    const returnUrl = new URL(window.location.href);
    returnUrl.search = "?sent=1";
    nextInput.value = returnUrl.toString();
  }

  if (new URLSearchParams(window.location.search).get("sent") === "1" && successMessage) {
    successMessage.hidden = false;
    if (form) {
      form.reset();
    }
  }
})();

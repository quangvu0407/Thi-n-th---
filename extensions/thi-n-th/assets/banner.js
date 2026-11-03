document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const closeButton = event.target.closest("[data-thien-thu-banner-close]");

  if (!closeButton) return;

  closeButton.closest("[data-thien-thu-banner]")?.remove();
});

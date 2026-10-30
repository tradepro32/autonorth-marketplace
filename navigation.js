// Progressive enhancement for the mobile navigation; marketplace handlers stay unchanged.
(() => {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const nav = document.getElementById("primaryNavigation");
  if (!toggle || !nav) return;
  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    nav.classList.remove("is-open");
  };
  toggle.addEventListener("click", () => {
    const opening = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(opening));
    toggle.setAttribute("aria-label", opening ? "Close navigation menu" : "Open navigation menu");
    nav.classList.toggle("is-open", opening);
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", close));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") close();
  });
  document.addEventListener("click", event => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) close();
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", event => {
    if (event.matches) close();
  });
})();

(() => {
  const button = document.querySelector(".menu");
  const nav = document.querySelector(".nav");
  button?.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav?.classList.toggle("open", open);
  });
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open");
    button?.setAttribute("aria-expanded", "false");
    button?.setAttribute("aria-label", "Open navigation");
  }));
  const reveal = document.querySelectorAll(".reveal");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    reveal.forEach(el => el.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); obs.unobserve(entry.target); }
    }), {threshold:.12, rootMargin:"0px 0px -30px 0px"});
    reveal.forEach(el => observer.observe(el));
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", event => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
    history.replaceState(null, "", a.getAttribute("href"));
  }));
})();

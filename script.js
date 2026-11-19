(() => {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const canTrackPointer = matchMedia("(hover: hover) and (pointer: fine)");
  const button = document.querySelector(".menu");
  const nav = document.querySelector(".nav");

  document.body.classList.add("motion-ready");
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

  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    reveals.forEach(el => el.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    }), { threshold: .12, rootMargin: "0px 0px -30px 0px" });
    reveals.forEach(el => revealObserver.observe(el));
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", event => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion.matches ? "instant" : "smooth" });
    history.replaceState(null, "", a.getAttribute("href"));
  }));

  const counters = document.querySelectorAll(".counter[data-count]");
  const countUp = element => {
    const end = Number(element.dataset.count);
    if (!Number.isFinite(end)) return;
    if (reduceMotion.matches) { element.textContent = String(end); return; }
    const start = performance.now();
    const duration = 950;
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(end * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const counterObserver = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
      if (entry.isIntersecting) { countUp(entry.target); obs.unobserve(entry.target); }
    }), { threshold: .6 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else counters.forEach(countUp);

  // Pointer-only effects stay off for touchscreens and reduced-motion preferences.
  if (!canTrackPointer.matches || reduceMotion.matches) return;
  document.body.classList.add("has-custom-cursor");

  const cursor = document.querySelector(".custom-cursor");
  const dot = cursor?.querySelector(".cursor-dot");
  let pointerX = innerWidth / 2;
  let pointerY = innerHeight / 2;
  let frame = 0;
  const moveCursor = event => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      cursor?.style.setProperty("--cursor-x", `${pointerX}px`);
      cursor?.style.setProperty("--cursor-y", `${pointerY}px`);
      frame = 0;
    });
  };
  window.addEventListener("pointermove", moveCursor, { passive: true });
  document.addEventListener("pointerover", event => {
    const target = event.target.closest("a, button, .project");
    if (!target) return;
    cursor?.classList.add("is-active");
    cursor?.classList.toggle("is-view", target.matches(".project"));
  });
  document.addEventListener("pointerout", event => {
    const from = event.target.closest("a, button, .project");
    const to = event.relatedTarget?.closest?.("a, button, .project");
    if (from && from !== to) {
      cursor?.classList.remove("is-active");
      cursor?.classList.remove("is-view");
    }
  });
  window.addEventListener("blur", () => cursor?.classList.remove("is-active", "is-view"));

  document.querySelectorAll(".button").forEach(link => {
    link.addEventListener("pointermove", event => {
      const rect = link.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .12;
      const y = (event.clientY - rect.top - rect.height / 2) * .18;
      link.style.setProperty("--mag-x", `${x.toFixed(1)}px`);
      link.style.setProperty("--mag-y", `${y.toFixed(1)}px`);
    });
    link.addEventListener("pointerleave", () => {
      link.style.setProperty("--mag-x", "0px");
      link.style.setProperty("--mag-y", "0px");
    });
  });

  document.querySelectorAll(".project").forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - .5) * 5;
      const rotateX = (.5 - (y / rect.height)) * 4;
      card.style.setProperty("--spot-x", `${x}px`);
      card.style.setProperty("--spot-y", `${y}px`);
      card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });

  document.querySelectorAll(".sticker, .orbit").forEach(shape => {
    shape.addEventListener("pointermove", event => {
      const rect = shape.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
      shape.style.setProperty("--parallax-x", `${(x * 7).toFixed(1)}px`);
      shape.style.setProperty("--parallax-y", `${(y * 7).toFixed(1)}px`);
    });
    shape.addEventListener("pointerleave", () => {
      shape.style.setProperty("--parallax-x", "0px");
      shape.style.setProperty("--parallax-y", "0px");
    });
  });
})();

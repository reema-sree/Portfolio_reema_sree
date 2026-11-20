(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };

  menuButton.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 680) setMenu(false); }, { passive: true });

  document.querySelector('#year').textContent = new Date().getFullYear();
  document.body.classList.add('motion-enabled');

  // Staggered, one-time reveal for content entering the viewport.
  const revealItems = [...document.querySelectorAll('.reveal')];
  revealItems.forEach((item, index) => item.style.setProperty('--stagger', `${(index % 4) * 75}ms`));
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));

  // Keep the nav underline in sync with the section currently in view.
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));

  // Animate verified portfolio milestones once, with reduced-motion support.
  const counters = document.querySelectorAll('.counter');
  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.count || 0);
      const suffix = node.dataset.suffix || '';
      if (prefersReduced) node.textContent = `${target}${suffix}`;
      else {
        const start = performance.now();
        const duration = 1050;
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          node.textContent = `${Math.round(target * eased)}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      observer.unobserve(node);
    });
  }, { threshold: 0.55 });
  counters.forEach((counter) => countObserver.observe(counter));

  // Lenis is only enabled when motion is allowed and the browser loaded its CDN bundle.
  if (!prefersReduced && typeof window.Lenis === 'function') {
    new window.Lenis({ autoRaf: true, anchors: true, smoothWheel: true });
  }

  // Custom pointer treatment is restricted to fine pointers, never touch devices.
  if (hasFinePointer && !prefersReduced) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    const pointerField = document.querySelector('.pointer-field');
    let pointerX = -100, pointerY = -100, ringX = -100, ringY = -100;
    document.body.classList.add('cursor-ready');
    const moveCursor = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerField.style.setProperty('--pointer-x', `${pointerX}px`);
      pointerField.style.setProperty('--pointer-y', `${pointerY}px`);
      dot.style.transform = `translate(${pointerX}px, ${pointerY}px)`;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    };
    const followRing = () => {
      ringX += (pointerX - ringX) * 0.18;
      ringY += (pointerY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(followRing);
    };
    document.addEventListener('pointermove', moveCursor, { passive: true });
    requestAnimationFrame(followRing);
    document.querySelectorAll('a,button,summary,[data-tilt]').forEach((target) => {
      target.addEventListener('pointerenter', () => ring.classList.add('is-active'));
      target.addEventListener('pointerleave', () => ring.classList.remove('is-active', 'is-view'));
    });
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('pointerenter', () => ring.classList.add('is-view'));
      card.addEventListener('pointerleave', () => ring.classList.remove('is-view'));
    });
  }

  // Mouse-follow spotlights and subtle 3D tilt on case studies.
  if (hasFinePointer && !prefersReduced) {
    document.querySelectorAll('.spotlight-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty('--spot-x', `${x}px`);
        card.style.setProperty('--spot-y', `${y}px`);
        if (card.matches('[data-tilt]')) {
          const rx = ((y / rect.height) - 0.5) * -3.2;
          const ry = ((x / rect.width) - 0.5) * 3.2;
          card.style.setProperty('--tilt-x', `${rx}deg`);
          card.style.setProperty('--tilt-y', `${ry}deg`);
        }
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  // Magnetic buttons move only a few pixels and remain still for touch/reduced motion.
  if (hasFinePointer && !prefersReduced) {
    document.querySelectorAll('.magnetic').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.11;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.11;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }

  // Small parallax drift for decorative shapes, scheduled through one animation frame.
  if (!prefersReduced) {
    const parallaxShapes = document.querySelectorAll('.shape-violet,.shape-peach,.orbit-one,.contact-decor');
    let parallaxPending = false;
    const updateParallax = () => {
      const scrollY = window.scrollY;
      parallaxShapes.forEach((shape, index) => {
        const speed = index % 2 ? 0.018 : -0.012;
        shape.style.setProperty('--parallax-y', `${Math.max(-22, Math.min(22, scrollY * speed))}px`);
      });
      parallaxPending = false;
    };
    window.addEventListener('scroll', () => {
      if (!parallaxPending) {
        parallaxPending = true;
        requestAnimationFrame(updateParallax);
      }
    }, { passive: true });
  }

  // Show a fixed mobile contact action once the hero leaves view.
  const mobileContact = document.querySelector('.mobile-contact');
  const heroObserver = new IntersectionObserver(([entry]) => {
    mobileContact.classList.toggle('is-visible', !entry.isIntersecting && window.innerWidth <= 680);
  }, { threshold: 0.05 });
  heroObserver.observe(document.querySelector('.hero'));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 680) mobileContact.classList.remove('is-visible');
  }, { passive: true });

  // Add your Web3Forms access key here; without it, the form falls back to a prefilled email.
  const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
  // Add your personal Calendly or Cal.com URL here when ready.
  const BOOKING_URL = '';
  const bookingLink = document.querySelector('[data-booking-link]');
  if (BOOKING_URL) {
    bookingLink.href = BOOKING_URL;
    bookingLink.target = '_blank';
    bookingLink.rel = 'noreferrer';
    bookingLink.textContent = 'Book a 20-minute call ↗';
  }

  const form = document.querySelector('#contact-form');
  const formStatus = document.querySelector('#form-status');
  const submitButton = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const name = String(fields.get('name') || '').trim();
    const email = String(fields.get('email') || '').trim();
    const service = String(fields.get('service') || '').trim();
    const message = String(fields.get('message') || '').trim();
    if (String(fields.get('botcheck') || '').trim()) return;

    if (WEB3FORMS_ACCESS_KEY === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      const subject = encodeURIComponent(`Project inquiry: ${service}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nService: ${service}\n\n${message}`);
      formStatus.textContent = 'Opening your email app with your project note…';
      formStatus.dataset.state = 'success';
      window.location.href = `mailto:reemasree1612@gmail.com?subject=${subject}&body=${body}`;
      return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    formStatus.textContent = 'Sending your note…';
    formStatus.dataset.state = '';
    try {
      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        name,
        email,
        service,
        message,
        subject: `Portfolio inquiry: ${service}`,
        from_name: name,
        replyto: email,
        botcheck: ''
      };
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error('Submission was not accepted');
      form.reset();
      formStatus.textContent = 'Thanks! Your message is on its way. I’ll reply to your email soon.';
      formStatus.dataset.state = 'success';
    } catch {
      formStatus.textContent = 'The form could not send just now. Email me directly at reemasree1612@gmail.com.';
      formStatus.dataset.state = 'error';
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
    }
  });
})();

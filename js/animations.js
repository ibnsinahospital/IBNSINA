// =============================================
// Ibn Sina Hospital – Premium Mobile Animations
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // ---------- SCROLL PROGRESS BAR ----------
  const progressBar = document.createElement('div');
  progressBar.style.cssText = 'position:fixed; top:0; left:0; width:0%; height:3px; background:var(--emergency, #954c2a); z-index:10001; pointer-events:none;';
  document.body.appendChild(progressBar);
  gsap.to(progressBar, {
    width: '100%',
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
  });

  // ---------- BACK TO TOP BUTTON ----------
  const backToTop = document.createElement('button');
  backToTop.innerHTML = '↑';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.style.cssText = `
    position: fixed; bottom: 90px; right: 20px; z-index: 9998;
    background: var(--forest, #2d4a2b); color: var(--ivory, #faf9f6);
    border: none; border-radius: 50%; width: 44px; height: 44px;
    cursor: pointer; font-size: 1.4rem; display: none;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: opacity 0.3s, transform 0.3s;
    align-items: center; justify-content: center;
  `;
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(backToTop);
  ScrollTrigger.create({
    start: 400,
    end: 99999,
    onToggle: self => {
      backToTop.style.display = self.isActive ? 'flex' : 'none';
    }
  });

  // ---------- TAP FEEDBACK (mobile touch) ----------
  if ('ontouchstart' in window) {
    document.querySelectorAll('.btn, .emergency-badge, .nav-link, .social-icon, .carousel-prev, .carousel-next, .dot').forEach(el => {
      el.addEventListener('touchstart', () => {
        gsap.to(el, { scale: 0.95, duration: 0.15, ease: 'power2.out' });
      }, { passive: true });
      el.addEventListener('touchend', () => {
        gsap.to(el, { scale: 1, duration: 0.25, ease: 'back.out(1.7)' });
      }, { passive: true });
      el.addEventListener('touchcancel', () => {
        gsap.to(el, { scale: 1, duration: 0.25, ease: 'back.out(1.7)' });
      }, { passive: true });
    });
  }

  // ---------- RESPONSIVE ANIMATIONS ----------
  const mm = gsap.matchMedia();

  // 📱 MOBILE & TABLET
  mm.add("(max-width: 768px)", () => {
    // Header: shrink only
    const header = document.querySelector('.site-header');
    if (header) {
      ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: { targets: header, className: 'is-scrolled' },
      });
    }

    // Hero: smooth slide-up with spring
    const hero = document.querySelector('.hero');
    if (hero) {
      gsap.from(hero, { opacity: 0, duration: 0.7, ease: 'power2.out' });
      gsap.from('.hero-title', { opacity: 0, y: 40, duration: 0.8, delay: 0.1, ease: 'back.out(1.4)' });
      gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.7, delay: 0.2, ease: 'power2.out' });
      gsap.from('.hero-desc', { opacity: 0, y: 25, duration: 0.7, delay: 0.3, ease: 'power2.out' });
      gsap.from('.hero-ctas .btn', { opacity: 0, y: 25, duration: 0.6, delay: 0.4, stagger: 0.15, ease: 'back.out(1.7)' });
    }

    // Section titles: clip reveal
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.from(title, {
        opacity: 0, y: 30, clipPath: 'inset(0 0 100% 0)',
        duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });

    // Cards: stagger with alternating directions
    const cardConfigs = [
      { selector: '.why-card', from: { opacity: 0, y: 40, x: 0 } },
      { selector: '.service-card', from: { opacity: 0, y: 30, scale: 0.8 } },
      { selector: '.doctor-card', from: { opacity: 0, x: -40, y: 20 } },
      { selector: '.department-card', from: { opacity: 0, y: 40, scale: 0.9 } },
      { selector: '.blog-preview-card', from: { opacity: 0, y: 30, x: 30 } },
      { selector: '.testimonial-card', from: { opacity: 0, x: 40, y: 10 } },
      { selector: '.position-card', from: { opacity: 0, y: 30, scale: 0.95 } }
    ];
    cardConfigs.forEach(config => {
      const cards = gsap.utils.toArray(config.selector);
      if (!cards.length) return;
      ScrollTrigger.batch(cards, {
        start: 'top 90%',
        once: true,
        onEnter: batch => gsap.from(batch, {
          ...config.from,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.08
        })
      });
    });

    // Quick info cards: slide from left/right
    gsap.utils.toArray('.quick-info-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, x: i % 2 === 0 ? -30 : 30,
        duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 90%' }
      });
    });

    // Stats: pop effect
    gsap.utils.toArray('.stat-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, scale: 0.8,
        duration: 0.5, delay: i * 0.05, ease: 'back.out(1.8)',
        scrollTrigger: { trigger: card, start: 'top 90%' }
      });
    });

    // FAQ accordion with smooth height
    document.querySelectorAll('.faq-list details').forEach(detail => {
      const summary = detail.querySelector('summary');
      const content = detail.querySelector('p');
      if (!summary || !content) return;
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        if (!detail.open) {
          detail.open = true;
          const targetHeight = content.scrollHeight;
          gsap.fromTo(content,
            { height: 0, opacity: 0 },
            { height: targetHeight, opacity: 1, duration: 0.35, ease: 'power1.out', onComplete: () => { content.style.height = 'auto'; } }
          );
        } else {
          const currentHeight = content.scrollHeight;
          gsap.fromTo(content,
            { height: currentHeight, opacity: 1 },
            { height: 0, opacity: 0, duration: 0.25, ease: 'power1.in', onComplete: () => { detail.open = false; } }
          );
        }
      });
    });

    // CTA banner: slide up
    gsap.utils.toArray('.cta-banner').forEach(banner => {
      gsap.from(banner.querySelectorAll('.btn'), {
        scale: 0.8, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: banner, start: 'top 90%' }
      });
    });

    // Footer: fade up
    gsap.from('.site-footer', {
      opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '.site-footer', start: 'top 95%' }
    });
  });

  // 🖥️ DESKTOP
  mm.add("(min-width: 769px)", () => {
    // Header shrink & hide/show
    const header = document.querySelector('.site-header');
    if (header) {
      ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: { targets: header, className: 'is-scrolled' },
      });

      let lastY = window.scrollY;
      ScrollTrigger.create({
        start: 'top top',
        end: 99999,
        onUpdate: () => {
          const y = window.scrollY;
          if (y > lastY && y > 150) {
            gsap.to(header, { yPercent: -100, duration: 0.3, ease: 'power2.out' });
          } else {
            gsap.to(header, { yPercent: 0, duration: 0.3, ease: 'power2.out' });
          }
          lastY = y;
        }
      });
    }

    // Hero parallax & stagger
    const hero = document.querySelector('.hero');
    if (hero) {
      gsap.from(hero, { opacity: 0, scale: 1.08, duration: 1.2, ease: 'power2.out' });
      gsap.to(hero, {
        backgroundPosition: '50% 70%',
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });

      const titleEl = hero.querySelector('.hero-title');
      if (titleEl) {
        const words = titleEl.textContent.trim().split(/\s+/);
        titleEl.innerHTML = words.map(w => `<span style="display:inline-block;">${w}</span>`).join(' ');
        gsap.from(titleEl.children, {
          opacity: 0, y: 20, rotateX: -90, transformOrigin: '50% 100%',
          duration: 0.8, stagger: 0.08, ease: 'power3.out'
        });
      }
      gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8, delay: 0.3, ease: 'power2.out' });
      gsap.from('.hero-desc', { opacity: 0, y: 20, duration: 0.8, delay: 0.45, ease: 'power2.out' });
      gsap.from('.hero-ctas .btn', { opacity: 0, y: 15, duration: 0.6, delay: 0.6, stagger: 0.15, ease: 'back.out(1.5)' });
    }

    // Section headings clip reveal
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.from(title, {
        opacity: 0, y: 30, clipPath: 'inset(0 0 100% 0)',
        duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });

    // Stat counters
    gsap.utils.toArray('.stat-number, [data-counter]').forEach(el => {
      const raw = el.textContent.trim();
      const match = raw.match(/(\d+)/);
      if (!match) return;
      const endVal = parseInt(match[1], 10);
      const suffix = raw.replace(match[1], '');
      const counter = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            val: endVal,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.floor(counter.val) + suffix; },
            onComplete: () => { el.textContent = endVal + suffix; }
          });
        }
      });
    });

    // Card stagger with 3D
    const cardConfigs = [
      { selector: '.why-card', from: { opacity: 0, y: 60, rotation: 2 } },
      { selector: '.service-card', from: { opacity: 0, scale: 0.8, y: 40 } },
      { selector: '.doctor-card', from: { opacity: 0, x: -50, y: 20 } },
      { selector: '.department-card', from: { opacity: 0, y: 70, scale: 0.9 } },
      { selector: '.blog-preview-card', from: { opacity: 0, y: 50, x: 30 } },
      { selector: '.testimonial-card', from: { opacity: 0, x: 80, rotation: -1 } },
      { selector: '.position-card', from: { opacity: 0, y: 30, scale: 0.95 } }
    ];
    cardConfigs.forEach(config => {
      const cards = gsap.utils.toArray(config.selector);
      if (!cards.length) return;
      ScrollTrigger.batch(cards, {
        start: 'top 88%',
        once: true,
        onEnter: batch => gsap.from(batch, {
          ...config.from,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.1,
          overwrite: true
        })
      });
    });

    // Hover lift
    document.querySelectorAll('.why-card, .service-card, .doctor-card, .department-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -6, boxShadow: '0 14px 30px rgba(0,0,0,0.12)', duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', duration: 0.3, ease: 'power2.out' });
      });
    });

    // Magnetic buttons
    document.querySelectorAll('.btn-primary, .hero-ctas .btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.25, y: y * 0.35, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
      });
    });

    // Image zoom
    ScrollTrigger.batch('img[loading="lazy"]', {
      start: 'top 92%',
      once: true,
      onEnter: batch => gsap.from(batch, { opacity: 0, scale: 0.9, duration: 0.8, ease: 'power2.out', stagger: 0.06 })
    });

    // FAQ accordion
    document.querySelectorAll('.faq-list details').forEach(detail => {
      const summary = detail.querySelector('summary');
      const content = detail.querySelector('p');
      if (!summary || !content) return;
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        if (!detail.open) {
          detail.open = true;
          const targetHeight = content.scrollHeight;
          gsap.fromTo(content,
            { height: 0, opacity: 0 },
            { height: targetHeight, opacity: 1, duration: 0.35, ease: 'power1.out', onComplete: () => { content.style.height = 'auto'; } }
          );
        } else {
          const currentHeight = content.scrollHeight;
          gsap.fromTo(content,
            { height: currentHeight, opacity: 1 },
            { height: 0, opacity: 0, duration: 0.25, ease: 'power1.in', onComplete: () => { detail.open = false; } }
          );
        }
      });
    });

    // Testimonials
    gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, y: 30,
        duration: 0.7, delay: i * 0.05, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' }
      });
    });

    // CTA pulse
    gsap.utils.toArray('.cta-banner').forEach(banner => {
      gsap.from(banner.querySelectorAll('.btn'), {
        scale: 0.8, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: banner, start: 'top 90%' }
      });
    });

    // Footer fade
    gsap.from('.site-footer', {
      opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: '.site-footer', start: 'top 95%' }
    });
  });

  // ---------- REFRESH SCROLLTRIGGER AFTER LOAD ----------
  window.addEventListener('load', () => ScrollTrigger.refresh());
});

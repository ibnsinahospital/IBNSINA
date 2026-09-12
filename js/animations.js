// =============================================
// Ibn Sina Hospital – Premium Animations
// Version 2.0 — Enhanced with premium effects
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // ================================================================
  // SHARED (both mobile & desktop)
  // ================================================================

  // ---------- SCROLL PROGRESS BAR (gradient) ----------
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed; top: 0; left: 0; width: 0%; height: 3px;
    background: linear-gradient(90deg, var(--forest, #2d4a2b), var(--emergency, #954c2a), var(--olive, #a4ac86));
    z-index: 10001; pointer-events: none;
    box-shadow: 0 0 12px rgba(149, 76, 42, 0.4);
  `;
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

  // ---------- EMERGENCY BADGE PULSE ----------
  gsap.utils.toArray('.emergency-badge, .btn-emergency, .emergency-phone-large').forEach(el => {
    gsap.to(el, {
      boxShadow: '0 0 0 12px rgba(149, 76, 42, 0)',
      duration: 1.8,
      repeat: -1,
      ease: 'power1.out',
      keyframes: [
        { boxShadow: '0 0 0 0px rgba(149, 76, 42, 0.5)' },
        { boxShadow: '0 0 0 14px rgba(149, 76, 42, 0)' }
      ]
    });
  });

  // ---------- SECTION TITLE UNDERLINE DRAW ----------
  // FIXED: uses a class toggle + CSS transition instead of animating a
  // CSS variable that was never referenced. Underline now draws in
  // correctly when the section title enters the viewport.
  const titleStyle = document.createElement('style');
  titleStyle.textContent = `
    .section-title.underline-drawn { position: relative; }
    .section-title.underline-drawn::after {
      content: ''; display: block;
      position: absolute; bottom: -12px; left: 50%;
      transform: translateX(-50%);
      height: 4px; background: var(--olive, #a4ac86);
      border-radius: 4px; width: 0;
      transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .section-title.underline-drawn.underline-visible::after {
      width: 60px;
    }
  `;
  document.head.appendChild(titleStyle);

  gsap.utils.toArray('.section-title').forEach(title => {
    title.classList.add('underline-drawn');
    ScrollTrigger.create({
      trigger: title,
      start: 'top 85%',
      once: true,
      onEnter: () => title.classList.add('underline-visible')
    });
  });

  // ---------- DIVIDER WAVE DRAW ----------
  gsap.utils.toArray('.section-divider svg path, .hero-wave svg path, .footer-wave svg path').forEach(path => {
    if (!path || typeof path.getTotalLength !== 'function') return;
    const length = path.getTotalLength();
    if (length > 0) {
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: { trigger: path, start: 'top 90%', once: true }
      });
    }
  });

  // ---------- AREA BADGE WAVE ----------
  const areaBadges = document.querySelectorAll('.areas-serve-premium .badge-list span, .areas-serve-premium .badge-list a');
  if (areaBadges.length) {
    areaBadges.forEach((badge, i) => {
      gsap.to(badge, {
        y: -6,
        duration: 1.6 + Math.random() * 0.4,
        delay: i * 0.08,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }

  // ---------- BUTTON RIPPLE ON CLICK ----------
  document.querySelectorAll('.btn, .btn-primary, .btn-outline, .btn-submit, .cta-btn, .btn-appointment').forEach(btn => {
    btn.style.position = btn.style.position || 'relative';
    btn.style.overflow = 'hidden';

    const addRipple = (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width / 2) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height / 2) - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute; border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        width: 20px; height: 20px;
        left: ${x - 10}px; top: ${y - 10}px;
        pointer-events: none; transform: scale(0);
      `;
      btn.appendChild(ripple);

      gsap.to(ripple, {
        scale: Math.max(rect.width, rect.height) / 10,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
    };
    btn.addEventListener('click', addRipple);
    btn.addEventListener('touchstart', addRipple, { passive: true });
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

  // ---------- FAQ ACCORDION (shared) ----------
  document.querySelectorAll('.faq-list details').forEach(detail => {
    const summary = detail.querySelector('summary');
    const content = detail.querySelector('p');
    if (!summary || !content) return;

    summary.addEventListener('mouseenter', () => {
      gsap.to(summary, { paddingLeft: 28, duration: 0.25, ease: 'power2.out' });
    });
    summary.addEventListener('mouseleave', () => {
      gsap.to(summary, { paddingLeft: 24, duration: 0.25, ease: 'power2.out' });
    });

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (!detail.open) {
        detail.open = true;
        const targetHeight = content.scrollHeight;
        gsap.fromTo(content,
          { height: 0, opacity: 0 },
          { height: targetHeight, opacity: 1, duration: 0.35, ease: 'power1.out',
            onComplete: () => { content.style.height = 'auto'; } }
        );
      } else {
        const currentHeight = content.scrollHeight;
        gsap.fromTo(content,
          { height: currentHeight, opacity: 1 },
          { height: 0, opacity: 0, duration: 0.25, ease: 'power1.in',
            onComplete: () => { detail.open = false; } }
        );
      }
    });
  });

  // ================================================================
  // RESPONSIVE ANIMATIONS
  // ================================================================
  const mm = gsap.matchMedia();

  // ==================== 📱 MOBILE & TABLET ====================
  mm.add("(max-width: 768px)", () => {

    // Header shrink
    const header = document.querySelector('.site-header');
    if (header) {
      ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: { targets: header, className: 'is-scrolled' },
      });
    }

    // Hero: smooth slide-up
    // NOTE: .hero-ctas .btn is intentionally NOT animated here (no
    // gsap.from opacity:0 tween). gsap.from() sets an element to its
    // "from" state (opacity:0) immediately and only reveals it once
    // GSAP's animation actually completes. If the GSAP/ScrollTrigger
    // CDN script is slow, blocked, or fails on a visitor's network,
    // the tween never runs and the element is stuck invisible forever.
    // This caused the "Book an Appointment" / "Call Emergency" buttons
    // to permanently disappear for some visitors. Do not add an
    // opacity-based gsap.from() to .hero-ctas .btn again — these
    // buttons must always render via plain CSS only.
    const hero = document.querySelector('.hero');
    if (hero) {
      gsap.from(hero, { opacity: 0, duration: 0.7, ease: 'power2.out' });
      gsap.from('.hero-title', { opacity: 0, y: 40, duration: 0.8, delay: 0.1, ease: 'back.out(1.4)' });
      gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.7, delay: 0.2, ease: 'power2.out' });
      gsap.from('.hero-desc', { opacity: 0, y: 25, duration: 0.7, delay: 0.3, ease: 'power2.out' });
    }

    // Section titles clip reveal
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.from(title, {
        opacity: 0, y: 30, clipPath: 'inset(0 0 100% 0)',
        duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });

    // Paragraphs: alternate slide
    gsap.utils.toArray('.section p').forEach((p, i) => {
      if (p.closest('.faq-list') || p.closest('.hero-content')) return;
      gsap.from(p, {
        opacity: 0,
        x: i % 2 === 0 ? -20 : 20,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: p, start: 'top 92%', once: true }
      });
    });

    // Card stagger
    const cardConfigs = [
      { selector: '.why-card', from: { opacity: 0, y: 40, x: 0 } },
      { selector: '.service-card', from: { opacity: 0, y: 30, scale: 0.8 } },
      { selector: '.doctor-card', from: { opacity: 0, x: -40, y: 20 } },
      { selector: '.department-card', from: { opacity: 0, y: 40, scale: 0.9 } },
      { selector: '.blog-preview-card', from: { opacity: 0, y: 30, x: 30 } },
      { selector: '.testimonial-card', from: { opacity: 0, x: 40, y: 10 } },
      { selector: '.position-card', from: { opacity: 0, y: 30, scale: 0.95 } },
      { selector: '.explore-card', from: { opacity: 0, y: 30, scale: 0.95 } },
      { selector: '.package-card', from: { opacity: 0, y: 30, scale: 0.95 } },
      { selector: '.benefit-item', from: { opacity: 0, y: 25 } },
      { selector: '.static-blog-card', from: { opacity: 0, y: 30 } },
      { selector: '.specialty-card', from: { opacity: 0, y: 30 } }
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

    // Quick info cards
    gsap.utils.toArray('.quick-info-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, x: i % 2 === 0 ? -30 : 30,
        duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 90%' }
      });
    });

    // Stats pop
    gsap.utils.toArray('.stat-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, scale: 0.8,
        duration: 0.5, delay: i * 0.05, ease: 'back.out(1.8)',
        scrollTrigger: { trigger: card, start: 'top 90%' }
      });
    });

    // NOTE: .cta-banner .btn is intentionally NOT animated (see note
    // above the hero block for why an opacity-based gsap.from() on a
    // "Book Appointment" button is unsafe).

    // Footer fade up
    gsap.from('.site-footer', {
      opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '.site-footer', start: 'top 95%' }
    });

    // Gallery photos fade+scale on mobile
    gsap.utils.toArray('.photo-item').forEach((item, i) => {
      gsap.from(item, {
        opacity: 0, scale: 0.92,
        duration: 0.6, delay: (i % 3) * 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: item, start: 'top 92%', once: true }
      });
    });
  });

  // ==================== 🖥️ DESKTOP ====================
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

    // ---- HERO: multi-layer parallax + character reveal ----
    const hero = document.querySelector('.hero');
    if (hero) {
      gsap.from(hero, { opacity: 0, scale: 1.08, duration: 1.2, ease: 'power2.out' });

      gsap.to(hero, {
        backgroundPosition: '50% 70%',
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });

      const canopy = hero.querySelector('.hero-canopy');
      if (canopy) {
        gsap.to(canopy, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
        });
      }

      // Character-by-character reveal of hero title
      const titleEl = hero.querySelector('.hero-title');
      if (titleEl) {
        const originalText = titleEl.textContent.trim();
        const lines = originalText.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) lines.push(originalText);

        titleEl.innerHTML = lines.map(line => {
          const chars = line.split('');
          return `<span class="hero-line" style="display:block;">${
            chars.map(c => c === ' '
              ? '<span style="display:inline-block;width:0.3em;">&nbsp;</span>'
              : `<span style="display:inline-block;">${c}</span>`
            ).join('')
          }</span>`;
        }).join('');

        const allChars = titleEl.querySelectorAll('.hero-line > span');
        gsap.from(allChars, {
          opacity: 0, y: 30, rotateX: -90,
          transformOrigin: '50% 100%',
          duration: 0.65,
          stagger: { each: 0.025, from: 'start' },
          delay: 0.2,
          ease: 'power3.out'
        });
      }

      gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8, delay: 0.9, ease: 'power2.out' });
      gsap.from('.hero-desc', { opacity: 0, y: 20, duration: 0.8, delay: 1.1, ease: 'power2.out' });
    }

    // ---- Section headings: clip reveal ----
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.from(title, {
        opacity: 0, y: 30, clipPath: 'inset(0 0 100% 0)',
        duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });

    // ---- Stat counters ----
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

    // ---- Card stagger with 3D rotation ----
    const cardConfigs = [
      { selector: '.why-card', from: { opacity: 0, y: 60, rotation: 2 } },
      { selector: '.service-card', from: { opacity: 0, scale: 0.8, y: 40 } },
      { selector: '.doctor-card', from: { opacity: 0, x: -50, y: 20 } },
      { selector: '.department-card', from: { opacity: 0, y: 70, scale: 0.9 } },
      { selector: '.blog-preview-card', from: { opacity: 0, y: 50, x: 30 } },
      { selector: '.testimonial-card', from: { opacity: 0, x: 80, rotation: -1 } },
      { selector: '.position-card', from: { opacity: 0, y: 30, scale: 0.95 } },
      { selector: '.explore-card', from: { opacity: 0, y: 30 } },
      { selector: '.package-card', from: { opacity: 0, y: 40 } },
      { selector: '.benefit-item', from: { opacity: 0, y: 25 } },
      { selector: '.static-blog-card', from: { opacity: 0, y: 30 } },
      { selector: '.specialty-card', from: { opacity: 0, y: 40 } }
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

    // ---- 3D Card Tilt on hover ----
    const tiltCards = document.querySelectorAll(
      '.why-card, .service-card, .doctor-card, .department-card, .explore-card, .package-card, .specialty-card'
    );
    tiltCards.forEach(card => {
      card.style.transformStyle = 'preserve-3d';

      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -8,
          boxShadow: '0 20px 40px rgba(45, 74, 43, 0.14)',
          duration: 0.35,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 10;
        const rotateX = (y - 0.5) * -10;

        gsap.to(card, {
          rotationY: rotateY,
          rotationX: rotateX,
          transformPerspective: 1200,
          duration: 0.4,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          y: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          duration: 0.5,
          ease: 'elastic.out(1, 0.6)'
        });
      });
    });

    // ---- Magnetic buttons (excluding hero CTAs) ----
    // NOTE: removed '.hero-ctas .btn' from this selector. This effect
    // only nudges the button under the cursor (harmless on its own),
    // but keeping hero-ctas fully untouched by GSAP here too, so
    // nothing in this file ever sets a transform/opacity on it.
    document.querySelectorAll('.btn-primary').forEach(btn => {
      if (btn.closest('.hero-ctas')) return;
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

    // ---- Image clip-path reveal ----
    ScrollTrigger.batch('img[loading="lazy"]', {
      start: 'top 92%',
      once: true,
      onEnter: batch => gsap.from(batch, {
        opacity: 0,
        scale: 0.9,
        clipPath: 'inset(10% 10% 10% 10% round 12px)',
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.06,
        onComplete: function() {
          batch.forEach(img => { img.style.clipPath = 'none'; });
        }
      })
    });

    // ---- Image skew on scroll ----
    document.querySelectorAll('.photo-item img, .blog-card-image, .gallery-item img').forEach(img => {
      gsap.to(img, {
        skewY: 2,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: img,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        onComplete: () => {
          gsap.to(img, { skewY: 0, duration: 0.4 });
        }
      });
    });

    // ---- Gallery photos stagger ----
    gsap.utils.toArray('.photo-item').forEach((item, i) => {
      gsap.from(item, {
        opacity: 0, scale: 0.9,
        duration: 0.7, delay: (i % 4) * 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: item, start: 'top 92%', once: true }
      });
    });

    // ---- Testimonials stagger ----
    gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, y: 30,
        duration: 0.7, delay: i * 0.05, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' }
      });
    });

    // ---- Sticky Section Progress Dots ----
    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles.length >= 3) {
      const dotsRail = document.createElement('div');
      dotsRail.className = 'progress-dots-rail';
      dotsRail.style.cssText = `
        position: fixed; right: 24px; top: 50%; transform: translateY(-50%);
        z-index: 9997; display: none; flex-direction: column; gap: 12px;
        pointer-events: none;
      `;

      sectionTitles.forEach((title, i) => {
        const dot = document.createElement('a');
        dot.href = '#' + (title.id || `section-${i}`);
        if (!title.id) title.id = `section-${i}`;
        dot.style.cssText = `
          display: block; width: 10px; height: 10px; border-radius: 50%;
          background: rgba(45, 74, 43, 0.25);
          transition: all 0.3s ease;
          pointer-events: auto;
          cursor: pointer;
        `;
        dot.setAttribute('aria-label', title.textContent.trim());

        dot.addEventListener('mouseenter', () => {
          gsap.to(dot, { scale: 1.5, backgroundColor: 'rgba(45, 74, 43, 0.7)', duration: 0.25 });
        });
        dot.addEventListener('mouseleave', () => {
          gsap.to(dot, { scale: 1, backgroundColor: 'rgba(45, 74, 43, 0.25)', duration: 0.25 });
        });

        dotsRail.appendChild(dot);

        ScrollTrigger.create({
          trigger: title,
          start: 'top center',
          end: 'bottom center',
          onToggle: self => {
            if (self.isActive) {
              gsap.to(dot, {
                backgroundColor: '#2d4a2b',
                scale: 1.4,
                duration: 0.3,
                ease: 'back.out(2)'
              });
            } else {
              gsap.to(dot, {
                backgroundColor: 'rgba(45, 74, 43, 0.25)',
                scale: 1,
                duration: 0.3
              });
            }
          }
        });
      });

      document.body.appendChild(dotsRail);
      gsap.fromTo(dotsRail,
        { opacity: 0, x: 20 },
        {
          opacity: 1, x: 0,
          duration: 0.6, delay: 1.5,
          ease: 'power2.out',
          onStart: () => { dotsRail.style.display = 'flex'; }
        }
      );
    }

    // NOTE: .cta-banner .btn is intentionally NOT animated (see note
    // in the mobile block above).

    // Footer fade
    gsap.from('.site-footer', {
      opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: '.site-footer', start: 'top 95%' }
    });
  });

  // ---------- REFRESH SCROLLTRIGGER AFTER LOAD ----------
  window.addEventListener('load', () => ScrollTrigger.refresh());
});
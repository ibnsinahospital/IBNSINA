/* ============================================================
   Ibn Sina Hospital — Safe Animations
   ============================================================
   RULES:
   1. Never use gsap.from({ opacity: 0 }) on any content element.
      If GSAP fails to load, that element stays invisible forever.
   2. Only animate already-visible elements (gsap.to on transform,
      box-shadow, background-position, etc.).
   3. Every animation here is progressive enhancement. The site
      works perfectly if this file is deleted.
   4. No 3D tilt on doctor cards — it tanked Interaction to Next
      Paint (INP) on doctors.html with 35 cards.

   To disable entirely: remove the <script src="js/animations.js">
   tag from your pages. Nothing will break.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  // ------------------------------------------------------------
  // 1. SCROLL PROGRESS BAR (visual only)
  // ------------------------------------------------------------
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  progressBar.setAttribute('aria-hidden', 'true');
  progressBar.style.cssText = `
    position: fixed; top: 0; left: 0; width: 0%; height: 3px;
    background: linear-gradient(90deg, #2d4a2b, #954c2a, #a4ac86);
    z-index: 10001; pointer-events: none;
    box-shadow: 0 0 12px rgba(149, 76, 42, 0.4);
  `;
  document.body.appendChild(progressBar);

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.to(progressBar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3
      }
    });
  }

  // ------------------------------------------------------------
  // 2. BACK-TO-TOP BUTTON
  // ------------------------------------------------------------
  const backToTop = document.createElement('button');
  backToTop.type = 'button';
  backToTop.innerHTML = '↑';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.style.cssText = `
    position: fixed; bottom: 90px; right: 20px; z-index: 9998;
    background: #2d4a2b; color: #faf9f6;
    border: none; border-radius: 50%; width: 44px; height: 44px;
    cursor: pointer; font-size: 1.4rem; display: none;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: opacity 0.3s, transform 0.3s;
    align-items: center; justify-content: center;
  `;
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(backToTop);

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      start: 400,
      end: 99999,
      onToggle: (self) => {
        backToTop.style.display = self.isActive ? 'flex' : 'none';
      }
    });
  }

  // ------------------------------------------------------------
  // 3. EMERGENCY BADGE PULSE (does not affect content visibility)
  // ------------------------------------------------------------
  document.querySelectorAll('.emergency-badge, .btn-emergency').forEach((el) => {
    gsap.to(el, {
      duration: 1.8,
      repeat: -1,
      ease: 'power1.out',
      keyframes: [
        { boxShadow: '0 0 0 0px rgba(149, 76, 42, 0.5)' },
        { boxShadow: '0 0 0 14px rgba(149, 76, 42, 0)' }
      ]
    });
  });

  // ------------------------------------------------------------
  // 4. BUTTON RIPPLE ON CLICK
  // ------------------------------------------------------------
  document.querySelectorAll('.btn, .btn-primary, .btn-outline, .btn-submit, .cta-btn').forEach((btn) => {
    if (btn.dataset.rippleAttached) return;
    btn.dataset.rippleAttached = 'true';
    if (getComputedStyle(btn).position === 'static') {
      btn.style.position = 'relative';
    }
    btn.style.overflow = 'hidden';

    const addRipple = (e) => {
      const rect = btn.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left + rect.width / 2);
      const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : rect.top + rect.height / 2);
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute; border-radius: 50%;
        background: rgba(255, 255, 255, 0.35);
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

  // ------------------------------------------------------------
  // 5. TOUCH FEEDBACK (mobile only — visual nudge, not visibility)
  // ------------------------------------------------------------
  if ('ontouchstart' in window) {
    document.querySelectorAll(
      '.btn, .emergency-badge, .nav-link, .social-icon, .carousel-prev, .carousel-next, .dot'
    ).forEach((el) => {
      el.addEventListener('touchstart', () => {
        gsap.to(el, { scale: 0.96, duration: 0.15, ease: 'power2.out' });
      }, { passive: true });
      el.addEventListener('touchend', () => {
        gsap.to(el, { scale: 1, duration: 0.25, ease: 'back.out(1.7)' });
      }, { passive: true });
      el.addEventListener('touchcancel', () => {
        gsap.to(el, { scale: 1, duration: 0.25, ease: 'back.out(1.7)' });
      }, { passive: true });
    });
  }

  // ------------------------------------------------------------
  // 6. NO 3D TILT, NO IMAGE SKEW, NO MAGNETIC BUTTONS.
  //    These caused jank and had no measurable UX value.
  // ------------------------------------------------------------

  // Refresh ScrollTrigger after everything loads
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });
});
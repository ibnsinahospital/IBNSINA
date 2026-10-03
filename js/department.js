/* ============================================================
   IBN SINA HOSPITAL — DEPARTMENT PAGES SCRIPT
   File: js/department.js
   Self-contained. Does NOT depend on main.js or animations.js.
   Used by all /department-pages/*.html
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. HAMBURGER MENU
     ============================================================ */
  function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('main-nav');
    if (!hamburger || !mainNav) return;

    hamburger.addEventListener('click', function () {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
    });

    // Close menu when a nav link is clicked
    mainNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on outside click (mobile)
    document.addEventListener('click', function (e) {
      if (!mainNav.classList.contains('open')) return;
      if (mainNav.contains(e.target)) return;
      if (hamburger.contains(e.target)) return;
      mainNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  }

  /* ============================================================
     2. STICKY HEADER — add .scrolled class when scrolled past 20px
     ============================================================ */
  function initStickyHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    function update() {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ============================================================
     3. SCROLL REVEAL — .fade-in elements appear on scroll
     ============================================================ */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    // Respect user's motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ============================================================
     4. FAQ ACCORDION — smooth open/close
     Only one open at a time (optional). First one opens by default.
     ============================================================ */
  function initFaq() {
    const faqItems = document.querySelectorAll('.faq-list .faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(function (item, index) {
      const summary = item.querySelector('summary');
      const answer = item.querySelector('.faq-answer');
      if (!summary || !answer) return;

      // Open the first FAQ by default (good for SEO + user experience)
      if (index === 0) {
        item.open = true;
      }

      // Intercept click to animate smoothly
      summary.addEventListener('click', function (e) {
        e.preventDefault();

        if (item.open) {
          // Close this one
          animateClose(item, answer);
        } else {
          // Close any other open item
          faqItems.forEach(function (other) {
            if (other !== item && other.open) {
              const otherAnswer = other.querySelector('.faq-answer');
              if (otherAnswer) animateClose(other, otherAnswer);
            }
          });

          // Open this one
          animateOpen(item, answer);
        }
      });
    });
  }

  function animateOpen(item, answer) {
    item.open = true;
    answer.style.overflow = 'hidden';
    answer.style.height = '0';
    answer.style.opacity = '0';

    requestAnimationFrame(function () {
      const targetHeight = answer.scrollHeight;
      answer.style.transition = 'height .35s ease, opacity .3s ease';
      answer.style.height = targetHeight + 'px';
      answer.style.opacity = '1';

      setTimeout(function () {
        answer.style.height = '';
        answer.style.overflow = '';
        answer.style.transition = '';
        answer.style.opacity = '';
      }, 400);
    });
  }

  function animateClose(item, answer) {
    const currentHeight = answer.scrollHeight;
    answer.style.overflow = 'hidden';
    answer.style.height = currentHeight + 'px';
    answer.style.opacity = '1';

    requestAnimationFrame(function () {
      answer.style.transition = 'height .3s ease, opacity .25s ease';
      answer.style.height = '0';
      answer.style.opacity = '0';

      setTimeout(function () {
        item.open = false;
        answer.style.height = '';
        answer.style.overflow = '';
        answer.style.transition = '';
        answer.style.opacity = '';
      }, 320);
    });
  }

  /* ============================================================
     5. READING PROGRESS BAR
     ============================================================ */
  function initReadingProgress() {
    const bar = document.getElementById('readingProgress');
    if (!bar) return;

    function update() {
      const h = document.documentElement;
      const scrolled = h.scrollTop || document.body.scrollTop;
      const total = h.scrollHeight - h.clientHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ============================================================
     6. BACK TO TOP BUTTON
     ============================================================ */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    function update() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     7. SMOOTH SCROLL FOR IN-PAGE ANCHOR LINKS
     ============================================================ */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const header = document.getElementById('site-header');
        const headerOffset = header ? header.offsetHeight + 20 : 80;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      });
    });
  }

  /* ============================================================
     8. APPOINTMENT FORM — success confirmation
     The department pages use a simple inline form (no doctor dropdown).
     We just show a friendly message after submit.
     ============================================================ */
  function initAppointmentForm() {
    const form = document.querySelector('.appointment-form-section form');
    if (!form) return;

    const iframe = form.parentElement.querySelector('iframe[name="hidden-iframe"]');
    if (!iframe) return;

    let submitted = false;

    form.addEventListener('submit', function () {
      submitted = true;
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.textContent = 'Sending...';
      }
    });

    iframe.addEventListener('load', function () {
      if (!submitted) return;
      submitted = false;

      // Build success message
      const successBlock = document.createElement('div');
      successBlock.className = 'department-form-success';
      successBlock.setAttribute('role', 'status');
      successBlock.setAttribute('aria-live', 'polite');
      successBlock.innerHTML =
        '<div class="success-icon" aria-hidden="true">\u2713</div>' +
        '<h3>Appointment Request Received!</h3>' +
        '<p>Thank you. Our team will call you shortly to confirm your visit.</p>' +
        '<p class="success-note">For urgent help, call <a href="tel:+919622552553">9622552553</a>.</p>';

      // Inline styles for the success card (since department.css doesn't include them)
      successBlock.style.cssText =
        'text-align:center;padding:2rem 1.5rem;background:linear-gradient(160deg,#f4faf2,#eaf3e5);' +
        'border:1px solid #d9e6d2;border-radius:16px;margin-top:1.5rem;animation:deptSuccessPop .5s cubic-bezier(.34,1.56,.64,1);';

      const iconEl = successBlock.querySelector('.success-icon');
      if (iconEl) {
        iconEl.style.cssText =
          'width:60px;height:60px;margin:0 auto 1rem;border-radius:50%;' +
          'background:linear-gradient(135deg,#22a06b,#178a55);color:#fff;' +
          'display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;' +
          'box-shadow:0 12px 30px rgba(34,160,107,.3);';
      }

      const heading = successBlock.querySelector('h3');
      if (heading) {
        heading.style.cssText = 'color:#2d4a2b;font-family:Poppins,sans-serif;font-size:1.3rem;margin:0 0 .5rem;';
      }

      const paragraphs = successBlock.querySelectorAll('p');
      paragraphs.forEach(function (p) {
        p.style.cssText = 'color:#66755f;line-height:1.7;margin:0 0 .5rem;';
      });

      const note = successBlock.querySelector('.success-note');
      if (note) {
        note.style.cssText = 'font-size:.9rem;color:#8a9784;margin-top:.8rem;';
      }

      // Hide the form, show success block
      form.style.display = 'none';
      form.parentElement.appendChild(successBlock);

      // Scroll success into view
      setTimeout(function () {
        successBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    });
  }

  // Add the success pop animation keyframe once
  function injectSuccessAnimation() {
    if (document.getElementById('dept-success-anim')) return;
    const style = document.createElement('style');
    style.id = 'dept-success-anim';
    style.textContent =
      '@keyframes deptSuccessPop{' +
      '0%{opacity:0;transform:scale(.9);}' +
      '100%{opacity:1;transform:scale(1);}' +
      '}';
    document.head.appendChild(style);
  }

  /* ============================================================
     INIT — runs when DOM is ready
     ============================================================ */
  function init() {
    injectSuccessAnimation();
    initHamburger();
    initStickyHeader();
    initScrollReveal();
    initFaq();
    initReadingProgress();
    initBackToTop();
    initSmoothAnchors();
    initAppointmentForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ============================================================
   IBN SINA HOSPITAL — BLOG JAVASCRIPT
   File: js/blog.js
   Self-contained. Does NOT depend on main.js.
   Used only by: blog.html, blog-post.html, /blog/blog-*.html
   ============================================================ */

(function () {
  'use strict';

  const DATA_URLS = { blog: '/data/blog.json' };

  /* ============================================================
     SHARED HELPERS
     ============================================================ */

  async function fetchJSON(url) {
    if (!url) return [];
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error('JSON fetch error for', url, e);
      return [];
    }
  }

  function escapeHTML(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function isPublished(post) {
    const v = (post && post.is_published ? post.is_published : '')
      .toString().toLowerCase().trim();
    return v === 'true' || v === 'yes' || v === '1' || v === 'y';
  }

  function calculateReadingTime(htmlOrText) {
    if (!htmlOrText) return 1;
    const text = String(htmlOrText).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(' ').length : 0;
    return Math.max(1, Math.ceil(words / 200));
  }

  function formatBlogDate(dateValue) {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return escapeHTML(dateValue);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function formatBlogBody(raw) {
    if (!raw) return '';
    const text = String(raw).replace(/[\u200B-\u200D\u2060\uFEFF]/g, '');
    if (/<(p|div|ul|ol|h2|h3|br)\b/i.test(text)) return text;

    const blocks = text.split(/\n\s*\n/);
    let html = '';
    let leadAssigned = false;

    blocks.forEach(function (block) {
      const lines = block.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      if (!lines.length) return;

      const isBulleted = lines.every(function (l) { return /^[-•*]\s+/.test(l); });
      const isNumbered = lines.every(function (l) { return /^\d+[.)]\s+/.test(l); });

      if (isBulleted) {
        html += '<ul>' + lines.map(function (l) {
          return '<li>' + escapeHTML(l.replace(/^[-•*]\s+/, '')) + '</li>';
        }).join('') + '</ul>';
      } else if (isNumbered) {
        html += '<ol>' + lines.map(function (l) {
          return '<li>' + escapeHTML(l.replace(/^\d+[.)]\s+/, '')) + '</li>';
        }).join('') + '</ol>';
      } else if (lines.length === 1) {
        const line = lines[0];
        if (line.endsWith('?') && line.split(/\s+/).filter(Boolean).length <= 20) {
          html += '<p class="blog-pull-quote">' + escapeHTML(line) + '</p>';
        } else if (line.split(/\s+/).filter(Boolean).length <= 8 && !/[.!?:;,]$/.test(line) && /^[A-Z]/.test(line)) {
          html += '<h3 class="blog-subheading">' + escapeHTML(line) + '</h3>';
        } else {
          if (!leadAssigned) {
            html += '<p class="blog-lead-paragraph">' + escapeHTML(line) + '</p>';
            leadAssigned = true;
          } else {
            html += '<p>' + escapeHTML(line) + '</p>';
          }
        }
      } else {
        if (!leadAssigned) {
          html += '<p class="blog-lead-paragraph">' + lines.map(escapeHTML).join('<br>') + '</p>';
          leadAssigned = true;
        } else {
          html += '<p>' + lines.map(escapeHTML).join('<br>') + '</p>';
        }
      }
    });
    return html;
  }

  function getStaticBlogURL(slug) {
    const clean = String(slug || '').trim();
    if (!clean) return 'blog.html';
    return 'blog/blog-' + encodeURIComponent(clean) + '.html';
  }

  function normalizeBlogDescription(value, fallback) {
    const text = String(value || fallback || '')
      .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return 'Health information and medical insights from Ibn Sina Hospital, Budgam, Jammu and Kashmir.';
    return text.length > 160 ? text.slice(0, 157).replace(/\s+\S*$/, '') + '...' : text;
  }

  function renderRelatedBlogLinks(posts, currentSlug) {
    const candidates = posts
      .filter(function (p) { return isPublished(p) && String(p.slug || '') !== String(currentSlug || ''); })
      .sort(function (a, b) {
        return new Date(b.published_at || b.date || 0) - new Date(a.published_at || a.date || 0);
      })
      .slice(0, 3);

    if (!candidates.length) return '';

    return '<section class="blog-related-articles">' +
      '<h2>Related Health Insights</h2>' +
      '<ul>' + candidates.map(function (p) {
        return '<li><a href="' + getStaticBlogURL(p.slug) + '">' +
          escapeHTML(p.title || 'Health Article') + '</a></li>';
      }).join('') + '</ul></section>';
  }

  function addBlogArticleSchema(post) {
    const existing = document.getElementById('dynamic-blog-article-schema');
    if (existing) existing.remove();

    const slug = String(post.slug || '').trim();
    const articleURL = 'https://ibnsinahospital.in/' + getStaticBlogURL(slug);
    const image = post.cover_image_url || 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp';
    const published = post.published_at || post.date || '';
    const title = post.title || 'Health Article';
    const description = normalizeBlogDescription(post.short_summary, title);

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "@id": articleURL + "#article",
          "headline": title,
          "description": description,
          "url": articleURL,
          "mainEntityOfPage": { "@id": articleURL + "#webpage" },
          "image": image,
          "datePublished": published || undefined,
          "author": { "@type": "Organization", "name": "Ibn Sina Hospital" },
          "publisher": { "@id": "https://ibnsinahospital.in/#hospital" }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ibnsinahospital.in/" },
            { "@type": "ListItem", "position": 2, "name": "Health Insights", "item": "https://ibnsinahospital.in/blog.html" },
            { "@type": "ListItem", "position": 3, "name": title, "item": articleURL }
          ]
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamic-blog-article-schema';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  /* ============================================================
     SHARE BUTTONS
     ============================================================ */

  function initializeBlogShareButtons(scope) {
    const root = scope || document;
    root.querySelectorAll('.blog-share-button').forEach(function (button) {
      if (button.dataset.shareBound === 'true') return;
      button.dataset.shareBound = 'true';

      button.addEventListener('click', async function () {
        const type = button.dataset.share;
        const shareURL = window.location.href;
        const titleEl = document.querySelector('.blog-article-title');
        const shareText = (titleEl && titleEl.textContent.trim()) || document.title;

        if (type === 'copy') {
          try {
            await navigator.clipboard.writeText(shareURL);
            const original = button.textContent;
            button.textContent = '✓';
            button.classList.add('copied');
            setTimeout(function () {
              button.textContent = original;
              button.classList.remove('copied');
            }, 1500);
          } catch (e) {
            prompt('Copy this article link:', shareURL);
          }
          return;
        }
        if (type === 'whatsapp') {
          window.open('https://wa.me/?text=' + encodeURIComponent(shareText + '\n\n' + shareURL), '_blank', 'noopener,noreferrer');
          return;
        }
        if (type === 'facebook') {
          window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareURL), '_blank', 'noopener,noreferrer');
          return;
        }
      });
    });
  }

  /* ============================================================
     UI: PROGRESS BAR, BACK TO TOP, HAMBURGER, REVEAL
     ============================================================ */

  function initReadingProgress() {
    const progress = document.getElementById('readingProgress');
    const backToTop = document.getElementById('backToTop');

    function update() {
      const h = document.documentElement;
      const scrolled = h.scrollTop || document.body.scrollTop;
      const total = h.scrollHeight - h.clientHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      if (progress) progress.style.width = pct + '%';
      if (backToTop) {
        if (scrolled > 400) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('main-nav');
    if (!hamburger || !mainNav) return;

    hamburger.addEventListener('click', function () {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
    });

    mainNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initScrollReveal() {
    // Auto-tag elements inside the article body that should reveal on scroll.
    // This runs after article HTML is rendered, so we watch the body container.
    const taggable = document.querySelectorAll(
      '.blog-article-content > h2,' +
      '.blog-article-content > h3,' +
      '.blog-article-content > p,' +
      '.blog-article-content > ul,' +
      '.blog-article-content > ol,' +
      '.blog-article-content > blockquote,' +
      '.blog-article-content > table,' +
      '.blog-related-articles,' +
      '.blog-medical-disclaimer'
    );
    taggable.forEach(function (el) { el.classList.add('reveal'); });

    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    }
  }

  function initButtonGlow() {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        btn.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ============================================================
     BLOG LISTING (blog.html — #blog-grid)
     ============================================================ */

  async function renderBlogListing() {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return;

    // Preserve any static fallback content until we know fetch worked.
    const fallbackHTML = blogGrid.innerHTML;

    const posts = await fetchJSON(DATA_URLS.blog);
    const published = posts.filter(isPublished).sort(function (a, b) {
      return new Date(b.published_at || b.date || 0) - new Date(a.published_at || a.date || 0);
    });

    // If fetch failed or returned nothing, keep the static fallback.
    if (!published.length) {
      if (!fallbackHTML.trim()) {
        blogGrid.innerHTML = '<p style="text-align:center;color:#5c6350;">No blog posts yet. Please check back soon.</p>';
      }
      return;
    }

    blogGrid.innerHTML = published.map(function (p, index) {
      const isFeatured = index === 0;
      const readTime = calculateReadingTime(p.body);
      const postUrl = getStaticBlogURL(p.slug);
      const categoryLabel = p.category || 'Health & Wellness';

      return '<article class="blog-card' + (isFeatured ? ' blog-featured-card' : '') + '">' +
        (p.cover_image_url ?
          '<a href="' + postUrl + '" class="blog-card-image-link" aria-label="Read ' + escapeHTML(p.title || 'health article') + '">' +
            '<div class="blog-card-image-wrapper">' +
              '<img src="' + escapeHTML(p.cover_image_url) + '" alt="' + escapeHTML(p.title || 'Health article') + '" class="blog-card-image" loading="' + (isFeatured ? 'eager' : 'lazy') + '" decoding="async">' +
              '<span class="blog-image-overlay">Read Article</span>' +
            '</div>' +
          '</a>' : '') +
        '<div class="blog-card-content">' +
          '<div class="blog-card-meta">' +
            '<span class="blog-category">' + escapeHTML(categoryLabel) + '</span>' +
            '<time datetime="' + escapeHTML(p.published_at || p.date || '') + '" class="blog-date">' + formatBlogDate(p.published_at || p.date) + '</time>' +
          '</div>' +
          '<h2 class="blog-card-title"><a href="' + postUrl + '">' + escapeHTML(p.title || 'Health Article') + '</a></h2>' +
          '<p>' + escapeHTML(p.short_summary || '') + '</p>' +
          '<div class="blog-card-footer">' +
            '<span class="blog-reading-time">' + readTime + ' min read</span>' +
            '<a href="' + postUrl + '" class="read-more">Read Article <span aria-hidden="true">→</span></a>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');

    initializeBlogShareButtons(blogGrid);
  }

  /* ============================================================
     SINGLE BLOG POST SHELL (blog-post.html — #blog-post-content)
     This page is a legacy ?slug= shell. Static /blog/*.html pages
     don't use this — they render server-side.
     ============================================================ */

  async function renderBlogPostShell() {
    const container = document.getElementById('blog-post-content');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
      container.innerHTML = '<div class="blog-error-state">' +
        '<h1>Health Article</h1>' +
        '<p>No article was selected.</p>' +
        '<a href="blog.html" class="btn btn-primary">← Back to Health Insights</a>' +
      '</div>';
      return;
    }

    container.innerHTML = '<div class="blog-loading-state"><div class="skeleton-card">Loading article...</div></div>';

    const posts = await fetchJSON(DATA_URLS.blog);
    const post = posts.find(function (p) { return String(p.slug) === String(slug); });

    if (!post) {
      container.innerHTML = '<div class="blog-error-state">' +
        '<div class="blog-error-icon">✦</div>' +
        '<h1>Article Not Found</h1>' +
        '<p>The health article you are looking for may have been moved or is no longer available.</p>' +
        '<a href="blog.html" class="btn btn-primary">← Explore Health Insights</a>' +
      '</div>';
      return;
    }

    const title = post.title || 'Health Article';
    const summary = post.short_summary || 'Health information and medical insights from Ibn Sina Hospital.';
    const publishedDate = post.published_at || post.date || '';
    const formattedDate = formatBlogDate(publishedDate);
    const readingTime = calculateReadingTime(post.body);
    const category = post.category || post.department || 'Health & Wellness';
    const coverImage = post.cover_image_url || 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp';

    document.title = title + ' | Ibn Sina Hospital, Budgam, Jammu & Kashmir';

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', normalizeBlogDescription(summary, title));

    addBlogArticleSchema(post);

    container.innerHTML = '<article class="premium-blog-post">' +
      '<nav class="blog-breadcrumb" aria-label="Breadcrumb">' +
        '<a href="index.html">Home</a><span aria-hidden="true">/</span>' +
        '<a href="blog.html">Health Insights</a><span aria-hidden="true">/</span>' +
        '<span aria-current="page">' + escapeHTML(title) + '</span>' +
      '</nav>' +
      '<header class="blog-article-hero">' +
        '<div class="blog-article-category">' + escapeHTML(category) + '</div>' +
        '<h1 class="blog-article-title">' + escapeHTML(title) + '</h1>' +
        '<p class="blog-article-summary">' + escapeHTML(summary) + '</p>' +
        '<div class="blog-article-meta">' +
          (formattedDate ? '<span class="blog-meta-item"><span aria-hidden="true">📅</span><time datetime="' + escapeHTML(publishedDate) + '">' + formattedDate + '</time></span><span class="blog-meta-divider" aria-hidden="true">•</span>' : '') +
          '<span class="blog-meta-item"><span aria-hidden="true">⏱</span>' + readingTime + ' min read</span>' +
          '<span class="blog-meta-divider" aria-hidden="true">•</span>' +
          '<span class="blog-meta-item">Ibn Sina Hospital</span>' +
        '</div>' +
      '</header>' +
      '<figure class="blog-hero-media">' +
        '<img src="' + escapeHTML(coverImage) + '" alt="' + escapeHTML(title) + '" loading="eager" fetchpriority="high" decoding="async">' +
      '</figure>' +
      '<div class="blog-article-layout">' +
        '<aside class="blog-share-rail" aria-label="Share article">' +
          '<span>Share</span>' +
          '<button type="button" class="blog-share-button" data-share="whatsapp" aria-label="Share on WhatsApp">WA</button>' +
          '<button type="button" class="blog-share-button" data-share="facebook" aria-label="Share on Facebook">FB</button>' +
          '<button type="button" class="blog-share-button" data-share="copy" aria-label="Copy article link">🔗</button>' +
        '</aside>' +
        '<div class="blog-article-content blog-body">' +
          formatBlogBody(post.body) +
          renderRelatedBlogLinks(posts, slug) +
          '<aside class="blog-medical-disclaimer">' +
            '<strong>Medical Disclaimer</strong>' +
            '<p>The information provided in this article is intended for general educational purposes only. It should not replace professional medical advice, diagnosis, or treatment. If you have concerns about your health, please consult a qualified healthcare professional.</p>' +
          '</aside>' +
        '</div>' +
      '</div>' +
      '<section class="blog-article-cta">' +
        '<div class="blog-cta-content">' +
          '<span class="blog-cta-eyebrow">Need Medical Advice?</span>' +
          '<h2>Speak with our healthcare team</h2>' +
          '<p>If you have questions about your health or need professional medical guidance, our team at Ibn Sina Hospital is here to help.</p>' +
          '<div class="blog-cta-actions">' +
            '<a href="appointment.html" class="btn btn-primary btn-lg">Book an Appointment</a>' +
            '<a href="tel:9622552553" class="btn btn-outline btn-lg">Call 9622552553</a>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<div class="blog-back-link"><a href="blog.html" class="read-more">← Back to Health Insights</a></div>' +
    '</article>';

    initializeBlogShareButtons(container);
    initScrollReveal();
  }

  /* ============================================================
     INIT
     ============================================================ */

  document.addEventListener('DOMContentLoaded', function () {
    initReadingProgress();
    initHamburger();
    initButtonGlow();
    initializeBlogShareButtons();

    // Order matters: render listing/post FIRST, then wire up reveals.
    Promise.all([renderBlogListing(), renderBlogPostShell()])
      .then(function () {
        initScrollReveal();
      });
  });

})();

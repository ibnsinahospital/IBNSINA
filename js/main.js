// ============================================================
// IBN SINA HOSPITAL — MAIN JAVASCRIPT
// Google Sheets → Build Script → JSON → Website
// ============================================================


// ============================================================
// CONFIGURATION
// ============================================================

const DATA_URLS = {
  doctors: '/data/doctors.json',
  blog: '/data/blog.json',
  careers: '/data/careers.json',
  departments: '/data/departments.json',
  updates: '/data/updates.json'
};


// ============================================================
// STATIC SERVICES
// ============================================================

const STATIC_SERVICES = [
  {
    title: 'Ambulance Services',
    description: '24/7 emergency ambulance service for transporting patients to and from the hospital.',
    icon: 'ambulance'
  },
  {
    title: 'Endoscopy',
    description: 'Advanced upper and lower GI endoscopy including colonoscopy for accurate internal diagnosis.',
    icon: 'endoscopy'
  },
  {
    title: 'Dialysis',
    description: 'In-house dialysis unit providing life-sustaining renal care with experienced nephrology support.',
    icon: 'dialysis'
  },
  {
    title: 'Digital X-Rays',
    description: 'High-resolution digital radiography with same-day results for fast, accurate diagnosis.',
    icon: 'digital-xray'
  },
  {
    title: 'Vaccinations',
    description: 'Complete immunization services for children and adults — routine, travel, and seasonal vaccines.',
    icon: 'vaccinations'
  },
  {
    title: 'TMT (Treadmill Test)',
    description: 'Cardiac stress testing for heart health assessment — conducted under expert supervision.',
    icon: 'tmt'
  },
  {
    title: 'Holter Monitoring',
    description: 'Continuous 24-hour ECG recording to detect irregular heart rhythms that may not appear during a routine ECG.',
    icon: 'holter'
  },
  {
    title: 'ABPM (Ambulatory Blood Pressure Monitoring)',
    description: '24-hour blood pressure monitoring to assess hypertension patterns and adjust treatment accurately.',
    icon: 'abpm'
  },
  {
    title: 'Ultrasonography',
    description: 'Detailed ultrasound imaging for abdominal, obstetric, vascular, and soft-tissue evaluation.',
    icon: 'ultrasonography'
  },
  {
    title: 'Colonoscopy',
    description: 'Thorough colonoscopic screening and diagnostic procedures for gastrointestinal health.',
    icon: 'colonoscopy'
  },
  {
    title: '24/7 Pharmacy',
    description: 'In-house pharmacy — we never close. Emergency medications and prescriptions anytime.',
    icon: 'pharmacy'
  },
  {
    title: '24/7 Diagnostic Lab',
    description: 'Round-the-clock laboratory services for in-patients and out-patients, with rapid turnaround.',
    icon: 'lab'
  }
];


// ============================================================
// SERVICE ICONS
// ============================================================

const SERVICE_ICONS = {

  ambulance: `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round">
      <rect x="1" y="9" width="14" height="9" rx="1"></rect>
      <path d="M15 12h4l3 3v3h-7z"></path>
      <circle cx="6" cy="19" r="2"></circle>
      <circle cx="17" cy="19" r="2"></circle>
      <path d="M6 12h4M8 10v4"></path>
    </svg>
  `,

  endoscopy: `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="M2 12h20"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10"/>
      <path d="M12 2a15.3 15.3 0 00-4 10 15.3 15.3 0 004 10"/>
    </svg>
  `,

  dialysis: `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  `,

  'digital-xray': `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  `,

  vaccinations: `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-4 .5-5.5 2-1.5-1.5-3.74-2-5.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  `,

  tmt: `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  `,

  holter: `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <path d="M4 12h6l2-5 3 10 2-5h3"/>
      <rect x="2" y="2" width="20" height="20" rx="4"/>
    </svg>
  `,

  abpm: `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <path d="M12 2v20M4 4h16M4 20h16"/>
      <circle cx="12" cy="12" r="8"/>
    </svg>
  `,

  ultrasonography: `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  `,

  colonoscopy: `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  `,

  pharmacy: `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <path d="M8 2h8v4H8z"/>
      <rect x="3" y="6" width="18" height="16" rx="2"/>
      <line x1="12" y1="10" x2="12" y2="18"/>
      <line x1="8" y1="14" x2="16" y2="14"/>
    </svg>
  `,

  lab: `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2">
      <path d="M9 3h6l2 9-4 8H9l-3-8 3-9z"/>
      <circle cx="12" cy="16" r="2"/>
    </svg>
  `
};


// ============================================================
// JSON FETCH HELPER
// ============================================================

async function fetchJSON(url) {

  if (!url) return [];

  try {

    const res = await fetch(url, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {

      console.warn(
        `Expected array from ${url}, got:`,
        data
      );

      return [];
    }

    console.log(
      'Fetched JSON from',
      url,
      ':',
      data.length,
      'items'
    );

    return data;

  } catch (e) {

    console.error(
      'JSON fetch error for',
      url,
      e
    );

    return [];
  }
}


// ============================================================
// HTML ESCAPE HELPER
// Used for Google Sheets values that should be treated as text.
// ============================================================

function escapeHTML(value) {

  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// ============================================================
// DOCTOR CARD VISIBILITY HELPER
// ============================================================

function injectDoctorCardStyle() {

  if (
    document.getElementById(
      'doctor-card-force-visibility'
    )
  ) {
    return;
  }

  const style = document.createElement('style');

  style.id = 'doctor-card-force-visibility';

  style.textContent = `

    .doctor-card,
    .doctor-card * {
      color:#1a1a1a!important;
      opacity:1!important;
      visibility:visible!important;
      line-height:1.4!important;
      text-indent:0!important;
      transform:none!important;
    }

    .doctor-card h3 {
      color:#2d4a2b!important;
      font-size:1.3rem!important;
      margin-bottom:0.3rem!important;
    }

    .doctor-card .doctor-specialty {
      color:#5a6b4a!important;
      font-weight:600!important;
      font-size:1rem!important;
    }

    .doctor-card .doctor-qual {
      color:#555!important;
      font-size:0.85rem!important;
      line-height:1.5!important;
      word-wrap:break-word;
      white-space:normal;
    }

    .doctor-card .doctor-card-img-placeholder svg {
      display:block!important;
      width:80px!important;
      height:80px!important;
      margin:0 auto 1rem!important;
    }

    .doctor-card .btn {
      color:#fff!important;
      background:#2d4a2b!important;
      border-color:#2d4a2b!important;
      display:inline-block!important;
    }

    .doctor-card {
      background:#fff!important;
      border:1px solid #e0e0d0!important;
      min-height:200px!important;
    }

  `;

  document.head.appendChild(style);
}


// ============================================================
// BLOG HELPERS
// ============================================================

function isPublished(post) {

  const value = (
    post?.is_published ||
    ''
  )
    .toString()
    .toLowerCase()
    .trim();

  return (
    value === 'true' ||
    value === 'yes' ||
    value === '1' ||
    value === 'y'
  );
}


function calculateReadingTime(htmlOrText) {

  if (!htmlOrText) {
    return 1;
  }

  const text = String(htmlOrText)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = text
    ? text.split(' ').length
    : 0;

  return Math.max(
    1,
    Math.ceil(words / 200)
  );
}


function formatBlogBody(raw) {
  if (!raw) return '';
  const text = String(raw);

  // If the sheet content already contains real HTML tags, trust it as-is.
  if (/<(p|div|ul|ol|h2|h3|br)\b/i.test(text)) {
    return text;
  }

  // Plain text: split into blocks on blank lines, detect bullet/numbered
  // lines, and convert them into proper <ul>/<ol> so points appear on
  // their own line instead of collapsing into one paragraph.
  const blocks = text.split(/\n\s*\n/);
  let html = '';

  blocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const isBulleted = lines.every(l => /^[-•*]\s+/.test(l));
    const isNumbered = lines.every(l => /^\d+[.)]\s+/.test(l));

    if (isBulleted) {
      html += '<ul>' + lines.map(l => `<li>${escapeHTML(l.replace(/^[-•*]\s+/, ''))}</li>`).join('') + '</ul>';
    } else if (isNumbered) {
      html += '<ol>' + lines.map(l => `<li>${escapeHTML(l.replace(/^\d+[.)]\s+/, ''))}</li>`).join('') + '</ol>';
    } else {
      html += '<p>' + lines.map(l => escapeHTML(l)).join('<br>') + '</p>';
    }
  });

  return html;
}


function formatBlogDate(dateValue) {

  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return escapeHTML(dateValue);
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }
  );
}


function setMetaContent(selector, content) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', content);
}

function upsertLinkRel(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function normalizeBlogDescription(value, fallback) {
  const text = String(value || fallback || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return 'Health information and medical insights from Ibn Sina Hospital, Budgam, Jammu and Kashmir.';
  return text.length > 160 ? text.slice(0, 157).replace(/\s+\S*$/, '') + '...' : text;
}

function addBlogArticleSchema(post) {
  const existing = document.getElementById('dynamic-blog-article-schema');
  if (existing) existing.remove();

  const slug = String(post.slug || '').trim();
  const articleURL = `https://ibnsinahospital.in/blog-post.html?slug=${encodeURIComponent(slug)}`;
  const image = post.cover_image_url || 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp';
  const published = post.published_at || post.date || '';
  const modified = post.updated_at || post.modified_at || published;
  const title = post.title || 'Health Article';
  const description = normalizeBlogDescription(post.short_summary, title);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${articleURL}#article`,
        "headline": title,
        "description": description,
        "url": articleURL,
        "mainEntityOfPage": { "@id": `${articleURL}#webpage` },
        "image": image,
        "datePublished": published || undefined,
        "dateModified": modified || undefined,
        "inLanguage": "en-IN",
        "author": {
          "@type": "Organization",
          "name": "Ibn Sina Hospital",
          "url": "https://ibnsinahospital.in/"
        },
        "publisher": { "@id": "https://ibnsinahospital.in/#hospital" }
      },
      {
        "@type": "MedicalWebPage",
        "@id": `${articleURL}#webpage`,
        "url": articleURL,
        "name": title,
        "description": description,
        "isPartOf": { "@id": "https://ibnsinahospital.in/#website" },
        "about": { "@type": "Thing", "name": "Health information" },
        "inLanguage": "en-IN",
        "datePublished": published || undefined,
        "dateModified": modified || undefined,
        "publisher": { "@id": "https://ibnsinahospital.in/#hospital" }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articleURL}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ibnsinahospital.in/" },
          { "@type": "ListItem", "position": 2, "name": "Health Insights", "item": "https://ibnsinahospital.in/blog.html" },
          { "@type": "ListItem", "position": 3, "name": title, "item": articleURL }
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://ibnsinahospital.in/#website",
        "url": "https://ibnsinahospital.in/",
        "name": "Ibn Sina Hospital",
        "publisher": { "@id": "https://ibnsinahospital.in/#hospital" }
      },
      {
        "@type": "Hospital",
        "@id": "https://ibnsinahospital.in/#hospital",
        "name": "Ibn Sina Hospital",
        "url": "https://ibnsinahospital.in/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp"
        },
        "telephone": "+919622552553",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Budgam",
          "addressRegion": "Jammu and Kashmir",
          "postalCode": "191111",
          "addressCountry": "IN"
        }
      }
    ]
  };

  Object.values(schema["@graph"]).forEach(node => {
    Object.keys(node).forEach(key => {
      if (node[key] === undefined) delete node[key];
    });
  });

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'dynamic-blog-article-schema';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

function renderRelatedBlogLinks(posts, currentSlug) {
  const candidates = posts
    .filter(p => isPublished(p) && String(p.slug || '') !== String(currentSlug || ''))
    .sort((a, b) => new Date(b.published_at || b.date || 0) - new Date(a.published_at || a.date || 0))
    .slice(0, 3);

  if (!candidates.length) return '';

  return `
    <section class="blog-related-articles" aria-labelledby="related-articles-heading">
      <h2 id="related-articles-heading">Related Health Insights</h2>
      <ul>
        ${candidates.map(p => `
          <li>
            <a href="blog-post.html?slug=${encodeURIComponent(p.slug || '')}">
              ${escapeHTML(p.title || 'Health Article')}
            </a>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
  'DOMContentLoaded',
  () => {


    // ========================================================
    // HAMBURGER MENU
    // ========================================================

    const hamburger =
      document.getElementById('hamburger');

    const mainNav =
      document.getElementById('main-nav');

    if (hamburger && mainNav) {

      hamburger.addEventListener(
        'click',
        () => {

          const expanded =
            hamburger.getAttribute(
              'aria-expanded'
            ) === 'true';

          hamburger.setAttribute(
            'aria-expanded',
            String(!expanded)
          );

          mainNav.classList.toggle('open');
        }
      );

      mainNav
        .querySelectorAll('.nav-link')
        .forEach(link => {

          link.addEventListener(
            'click',
            () => {

              mainNav.classList.remove(
                'open'
              );

              hamburger.setAttribute(
                'aria-expanded',
                'false'
              );
            }
          );

        });
    }


    // ========================================================
    // STICKY HEADER
    // ========================================================

    window.addEventListener(
      'scroll',
      () => {

        const header =
          document.getElementById(
            'site-header'
          );

        if (!header) return;

        if (window.scrollY > 20) {

          header.classList.add(
            'scrolled'
          );

        } else {

          header.classList.remove(
            'scrolled'
          );
        }

      },
      { passive: true }
    );


    // ========================================================
    // SCROLL REVEAL
    // ========================================================

    if (
      !window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
    ) {

      const observer =
        new IntersectionObserver(
          entries => {

            entries.forEach(entry => {

              if (
                entry.isIntersecting
              ) {

                entry.target.classList.add(
                  'visible'
                );

                observer.unobserve(
                  entry.target
                );
              }

            });

          },
          {
            threshold: 0.15
          }
        );

      document
        .querySelectorAll('.fade-in')
        .forEach(el =>
          observer.observe(el)
        );
    }


    // ========================================================
    // NEWSLETTER
    // ========================================================


    const contactForm =
      document.getElementById(
        'contact-form'
      );

    if (contactForm) {

      contactForm.addEventListener(
        'submit',
        e => {

          e.preventDefault();

          const name =
            document.getElementById(
              'contact-name'
            )?.value.trim() || '';

          const email =
            document.getElementById(
              'contact-email'
            )?.value.trim() || '';

          const phone =
            document.getElementById(
              'contact-phone'
            )?.value.trim() || '';

          const subject =
            document.getElementById(
              'contact-subject'
            )?.value.trim() || '';

          const message =
            document.getElementById(
              'contact-message'
            )?.value.trim() || '';


          const body =
            `Name: ${name}%0D%0A` +
            `Phone: ${phone}%0D%0A` +
            `Email: ${email}%0D%0A%0D%0A` +
            `${message}`;


          const gmailUrl =
            `https://mail.google.com/mail/?view=cm&fs=1` +
            `&to=weibnsina@gmail.com` +
            `&su=${encodeURIComponent(
              subject ||
              'Contact Form'
            )}` +
            `&body=${body}`;


          window.open(
            gmailUrl,
            '_blank',
            'noopener,noreferrer'
          );

        }
      );
    }


    // ========================================================
    // CAREERS APPLICATION
    // ========================================================

    const careersForm =
      document.getElementById(
        'careers-form'
      );

    if (careersForm) {

      const posSelect =
        document.getElementById(
          'applicant-position'
        );


      if (posSelect) {

        fetchJSON(
          DATA_URLS.careers
        )
          .then(
            positions => {

              const open =
                positions.filter(
                  p => {

                    const val =
                      (
                        p.is_open ||
                        ''
                      )
                        .toString()
                        .toLowerCase()
                        .trim();

                    return (
                      val === 'true' ||
                      val === 'yes' ||
                      val === '1' ||
                      val === 'y'
                    );
                  }
                );

              posSelect.innerHTML =
                '<option value="">-- Select Position --</option>' +

                open
                  .map(
                    p =>
                      `<option value="${escapeHTML(p.title || '')}">${escapeHTML(p.title || '')}</option>`
                  )
                  .join('');

            }
          );
      }


      careersForm.addEventListener(
        'submit',
        e => {

          e.preventDefault();

          const name =
            document.getElementById(
              'applicant-name'
            )?.value.trim() || '';

          const phone =
            document.getElementById(
              'applicant-phone'
            )?.value.trim() || '';

          const email =
            document.getElementById(
              'applicant-email'
            )?.value.trim() || '';

          const position =
            posSelect?.value || '';

          const cover =
            document.getElementById(
              'cover-message'
            )?.value.trim() || '';


          const body =
            `Position Applied: ${position}%0D%0A` +
            `Name: ${name}%0D%0A` +
            `Phone: ${phone}%0D%0A` +
            `Email: ${email}%0D%0A%0D%0A` +
            `Cover Message:%0D%0A${cover}`;


          const gmailUrl =
            `https://mail.google.com/mail/?view=cm&fs=1` +
            `&to=weibnsina@gmail.com` +
            `&su=${encodeURIComponent(
              `Job Application: ${
                position ||
                'Open Position'
              }`
            )}` +
            `&body=${body}`;


          window.open(
            gmailUrl,
            '_blank',
            'noopener,noreferrer'
          );

        }
      );
    }


    // ========================================================
    // APPOINTMENT FORM
    // ========================================================

    const appointmentForm =
      document.getElementById(
        'appointment-form'
      );

    if (appointmentForm) {

      const deptSelect =
        document.getElementById(
          'department'
        );

      const docSelect =
        document.getElementById(
          'preferred-doctor'
        );

      const successDiv =
        document.getElementById(
          'appointment-success'
        );


      const departments = [

        'Cardiology',
        'CTVS',
        'Dental',
        'Dermatology',
        'Endocrinology',
        'ENT',
        'Gastroenterology',
        'General Surgery',
        'Gynaecology',
        'Neurosurgery',
        'Neurology',
        'Ophthalmology',
        'Orthopaedics',
        'Pediatrics',
        'Physiotherapy',
        'Plastic Surgery',
        'Psychiatry',
        'Pulmonology',
        'Rheumatology',
        'Urology'

      ];


      if (deptSelect) {

        deptSelect.innerHTML =
          '<option value="">-- Select --</option>' +

          departments
            .map(
              d =>
                `<option value="${escapeHTML(d)}">${escapeHTML(d)}</option>`
            )
            .join('');
      }


      async function populateDoctorsDropdown() {

        if (!docSelect) {
          return;
        }

        try {

          const doctors =
            await fetchJSON(
              DATA_URLS.doctors
            );


          docSelect.innerHTML =
            '<option value="">-- Any Doctor --</option>' +

            doctors
              .map(
                d =>
                  `<option value="${escapeHTML(d.name || '')}">
                    ${escapeHTML(d.name || '')}
                    ${
                      d.specialty
                        ? ` (${escapeHTML(d.specialty)})`
                        : ''
                    }
                  </option>`
              )
              .join('');


          const urlParams =
            new URLSearchParams(
              window.location.search
            );

          const preselected =
            urlParams.get(
              'doctor'
            );


          if (preselected) {

            const match =
              Array.from(
                docSelect.options
              ).find(
                opt =>
                  opt.value ===
                  preselected
              );

            if (match) {

              docSelect.value =
                preselected;
            }
          }

        } catch (err) {

          docSelect.innerHTML =
            '<option value="">-- Any Doctor --</option>';
        }
      }


      populateDoctorsDropdown();


      const hiddenFrame =
        document.querySelector(
          'iframe[name="hidden-iframe"]'
        );


      if (hiddenFrame) {

        hiddenFrame.addEventListener(
          'load',
          () => {

            appointmentForm.style.display =
              'none';

            if (successDiv) {

              successDiv.style.display =
                'block';
            }

          }
        );
      }

    }

  }
);

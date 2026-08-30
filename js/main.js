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


function addBlogArticleSchema(post) {

  const existing =
    document.getElementById(
      'dynamic-blog-article-schema'
    );

  if (existing) {
    existing.remove();
  }

  const slug = post.slug || '';

  const articleURL =
    `https://ibnsinahospital.in/blog-post.html?slug=${encodeURIComponent(slug)}`;

  const image =
    post.cover_image_url ||
    'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp';

  const published =
    post.published_at ||
    post.date ||
    '';

  const schema = {

    "@context": "https://schema.org",

    "@type": "MedicalWebPage",

    "headline": post.title || 'Health Article',

    "description":
      post.short_summary ||
      post.title ||
      'Health information from Ibn Sina Hospital.',

    "url": articleURL,

    "image": image,

    "datePublished": published,

    "publisher": {

      "@type": "Hospital",

      "name": "Ibn Sina Hospital",

      "url": "https://ibnsinahospital.in/",

      "logo": {

        "@type": "ImageObject",

        "url":
          "https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp"
      }
    },

    "mainEntityOfPage": {

      "@type": "WebPage",

      "@id": articleURL
    },

    "areaServed": {

      "@type": "AdministrativeArea",

      "name": "Jammu and Kashmir"
    }
  };

  const script =
    document.createElement('script');

  script.type =
    'application/ld+json';

  script.id =
    'dynamic-blog-article-schema';

  script.textContent =
    JSON.stringify(schema);

  document.head.appendChild(script);
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

    const newsletterForm =
      document.getElementById(
        'newsletter-form'
      );

    if (newsletterForm) {

      newsletterForm.addEventListener(
        'submit',
        e => {

          e.preventDefault();

          const email =
            document.getElementById(
              'newsletter-email'
            );

          if (
            email &&
            email.value.trim() &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              .test(email.value)
          ) {

            alert(
              'Thank you for subscribing!'
            );

            newsletterForm.reset();

          } else {

            alert(
              'Please enter a valid email address.'
            );
          }

        }
      );
    }


    // ========================================================
    // DOCTOR LISTING
    // doctors.html
    // ========================================================

    const doctorGrid =
      document.getElementById(
        'doctor-grid'
      );

    if (doctorGrid) {

      const filterDept =
        document.getElementById(
          'filter-department'
        );

      const searchInput =
        document.getElementById(
          'search-doctor'
        );

      let doctorsCache = [];


      async function populateDepartmentsFilter() {

        if (!filterDept) {
          return;
        }

        try {

          const departments =
            await fetchJSON(
              DATA_URLS.departments
            );

          if (departments.length) {

            filterDept.innerHTML =
              '<option value="">All Departments</option>' +
              departments
                .map(
                  d =>
                    `<option value="${escapeHTML(d.name)}">${escapeHTML(d.name)}</option>`
                )
                .join('');

          } else {

            filterDept.innerHTML =
              '<option value="">All Departments</option>';
          }

        } catch (e) {

          filterDept.innerHTML =
            '<option value="">All Departments</option>';
        }
      }


      async function loadDoctors() {

        doctorGrid.innerHTML =
          '<div class="skeleton-card">Loading doctors...</div>';

        doctorsCache =
          await fetchJSON(
            DATA_URLS.doctors
          );

        if (!doctorsCache.length) {

          doctorGrid.innerHTML =
            '<p style="text-align:center;">No doctors found. Please call 9622552553.</p>';

          return;
        }

        renderDoctors();

        const params =
          new URLSearchParams(
            window.location.search
          );

        const deptParam =
          params.get('dept');

        if (
          deptParam &&
          filterDept
        ) {

          filterDept.value =
            deptParam;

          renderDoctors();
        }
      }


      function renderDoctors() {

        let filtered =
          doctorsCache;

        const selectedDept =
          filterDept
            ? filterDept.value
                .trim()
                .toLowerCase()
            : '';

        if (selectedDept) {

          filtered =
            filtered.filter(
              d =>
                d.department &&
                d.department
                  .trim()
                  .toLowerCase() ===
                selectedDept
            );
        }

        if (
          searchInput &&
          searchInput.value.trim()
        ) {

          const q =
            searchInput.value
              .toLowerCase();

          filtered =
            filtered.filter(
              d =>
                (
                  (d.name || '') +
                  (d.specialty || '') +
                  (d.department || '')
                )
                  .toLowerCase()
                  .includes(q)
            );
        }

        if (!filtered.length) {

          doctorGrid.innerHTML =
            '<p style="text-align:center;">No doctors match your criteria.</p>';

          return;
        }

        injectDoctorCardStyle();

        doctorGrid.innerHTML =
          filtered
            .map(d => `

              <div
                class="doctor-card fade-in"
                onclick="location.href='doctor-profile.html?id=${encodeURIComponent(d.id || '')}'"
                style="background:#fff;border:1px solid #e0e0d0;min-height:200px;"
              >

                ${
                  d.photo_url
                    ? `
                      <img
                        src="${escapeHTML(d.photo_url)}"
                        alt="${escapeHTML(d.name || 'Doctor')}"
                        style="width:80px;height:80px;object-fit:cover;border-radius:50%;margin:0 auto 1rem;display:block;"
                        loading="lazy"
                      >
                    `
                    : `
                      <div
                        class="doctor-card-img-placeholder"
                        style="display:block;margin:0 auto 1rem;"
                      >
                        <svg
                          width="80"
                          height="80"
                          viewBox="0 0 60 60"
                        >
                          <circle
                            cx="30"
                            cy="22"
                            r="16"
                            fill="#a4ac86"
                            opacity="0.5"
                          />
                          <ellipse
                            cx="30"
                            cy="55"
                            rx="22"
                            ry="14"
                            fill="#a4ac86"
                            opacity="0.4"
                          />
                        </svg>
                      </div>
                    `
                }

                <h3>
                  ${escapeHTML(d.name || 'Unnamed')}
                </h3>

                <p class="doctor-specialty">
                  ${escapeHTML(d.specialty || '')}
                </p>

                <p class="doctor-qual">
                  ${escapeHTML(d.qualifications || '')}
                </p>

                <a
                  href="appointment.html?doctor=${encodeURIComponent(d.name || '')}"
                  class="btn btn-outline btn-sm"
                  onclick="event.stopPropagation();"
                  style="margin-top:.8rem;color:#fff;background:#2d4a2b;"
                >
                  Book Appointment
                </a>

              </div>

            `)
            .join('');
      }


      populateDepartmentsFilter()
        .then(loadDoctors);

      if (filterDept) {

        filterDept.addEventListener(
          'change',
          renderDoctors
        );
      }

      if (searchInput) {

        searchInput.addEventListener(
          'input',
          renderDoctors
        );
      }
    }


    // ========================================================
    // FEATURED DOCTORS
    // index.html
    // ========================================================

    const featContainer =
      document.getElementById(
        'featured-doctor-cards'
      );

    if (featContainer) {

      (async () => {

        featContainer.innerHTML =
          '<div class="skeleton-card">Loading...</div>';

        const doctors =
          await fetchJSON(
            DATA_URLS.doctors
          );

        const featured =
          doctors.slice(0, 6);

        if (!featured.length) {

          featContainer.innerHTML =
            '<p class="text-center">Doctor list coming soon.</p>';

          return;
        }

        injectDoctorCardStyle();

        featContainer.innerHTML =
          featured
            .map(d => `

              <div
                class="doctor-card fade-in"
                onclick="location.href='doctor-profile.html?id=${encodeURIComponent(d.id || '')}'"
                style="background:#fff;border:1px solid #e0e0d0;min-height:200px;"
              >

                ${
                  d.photo_url
                    ? `
                      <img
                        src="${escapeHTML(d.photo_url)}"
                        alt="${escapeHTML(d.name || 'Doctor')}"
                        style="width:80px;height:80px;object-fit:cover;border-radius:50%;margin:0 auto 1rem;display:block;"
                        loading="lazy"
                      >
                    `
                    : `
                      <div
                        class="doctor-card-img-placeholder"
                        style="display:block;margin:0 auto 1rem;"
                      >
                        <svg
                          width="80"
                          height="80"
                          viewBox="0 0 60 60"
                        >
                          <circle
                            cx="30"
                            cy="22"
                            r="16"
                            fill="#a4ac86"
                            opacity="0.5"
                          />
                          <ellipse
                            cx="30"
                            cy="55"
                            rx="22"
                            ry="14"
                            fill="#a4ac86"
                            opacity="0.4"
                          />
                        </svg>
                      </div>
                    `
                }

                <h3>
                  ${escapeHTML(d.name || 'Unnamed')}
                </h3>

                <p class="doctor-specialty">
                  ${escapeHTML(d.specialty || '')}
                </p>

                <p class="doctor-qual">
                  ${escapeHTML(d.qualifications || '')}
                </p>

                <a
                  href="appointment.html?doctor=${encodeURIComponent(d.name || '')}"
                  class="btn btn-outline btn-sm"
                  onclick="event.stopPropagation();"
                  style="margin-top:.8rem;color:#fff;background:#2d4a2b;"
                >
                  Book Appointment
                </a>

              </div>

            `)
            .join('');

      })();
    }


    // ========================================================
    // DOCTOR PROFILE
    // ========================================================

    const profileContainer =
      document.getElementById(
        'doctor-profile-content'
      );

    if (profileContainer) {

      const params =
        new URLSearchParams(
          window.location.search
        );

      const docId =
        params.get('id');

      if (!docId) {

        profileContainer.innerHTML =
          '<p>No doctor selected.</p>';

      } else {

        (async () => {

          const doctors =
            await fetchJSON(
              DATA_URLS.doctors
            );

          const doc =
            doctors.find(
              d =>
                String(d.id) ===
                String(docId)
            );

          if (!doc) {

            profileContainer.innerHTML =
              '<p>Doctor not found.</p>';

            return;
          }

          document.title =
            `${doc.name || 'Doctor'} | Ibn Sina Hospital`;

          const metaDescription =
            document.querySelector(
              'meta[name="description"]'
            );

          if (metaDescription) {

            metaDescription.setAttribute(
              'content',
              `View the profile of ${doc.name || 'a doctor'} – ${doc.specialty || 'Doctor'} at Ibn Sina Hospital, Jammu and Kashmir.`
            );
          }

          profileContainer.innerHTML = `

            <div class="doctor-profile-card">

              ${
                doc.photo_url
                  ? `
                    <img
                      src="${escapeHTML(doc.photo_url)}"
                      alt="${escapeHTML(doc.name || 'Doctor')}"
                      style="width:120px;height:120px;object-fit:cover;border-radius:50%;margin:0 auto 1rem;display:block;"
                    >
                  `
                  : ''
              }

              <h1>
                ${escapeHTML(doc.name || 'Unnamed')}
              </h1>

              <p>
                <strong>Specialty:</strong>
                ${escapeHTML(doc.specialty || 'N/A')}
              </p>

              <p>
                <strong>Department:</strong>
                ${escapeHTML(doc.department || 'N/A')}
              </p>

              <p>
                <strong>Qualifications:</strong>
                ${escapeHTML(doc.qualifications || 'N/A')}
              </p>

              <div class="doctor-bio">
                <strong>About:</strong>
                <br>
                ${doc.about || 'No biography available.'}
              </div>

              <a
                href="appointment.html?doctor=${encodeURIComponent(doc.name || '')}"
                class="btn btn-primary"
              >
                Book Appointment with ${escapeHTML(doc.name || 'Doctor')}
              </a>

              <a
                href="doctors.html"
                class="btn btn-outline"
                style="margin-top:1rem;"
              >
                ← Back to All Doctors
              </a>

            </div>

          `;

        })();
      }
    }


    // ========================================================
    // STATIC SERVICES
    // ========================================================

    const servicesGrid =
      document.getElementById(
        'services-grid'
      );

    if (servicesGrid) {

      servicesGrid.innerHTML =
        STATIC_SERVICES
          .map(s => {

            const iconHtml =
              SERVICE_ICONS[s.icon]
                ? `
                  <div class="service-icon">
                    ${SERVICE_ICONS[s.icon]}
                  </div>
                `
                : '';

            return `

              <div class="service-card fade-in">

                ${iconHtml}

                <h3>
                  ${escapeHTML(s.title)}
                </h3>

                <p>
                  ${escapeHTML(s.description)}
                </p>

              </div>

            `;

          })
          .join('');
    }


    // ========================================================
    // DYNAMIC DEPARTMENTS
    // ========================================================

    const deptGrid =
      document.getElementById(
        'departments-grid'
      );

    if (deptGrid) {

      (async () => {

        deptGrid.innerHTML =
          '<div class="skeleton-card">Loading departments...</div>';

        const departments =
          await fetchJSON(
            DATA_URLS.departments
          );

        if (!departments.length) {

          deptGrid.innerHTML =
            '<p class="text-center">Departments list unavailable.</p>';

          return;
        }

        const isHomePage =
          window.location.pathname.endsWith(
            'index.html'
          ) ||
          window.location.pathname === '/' ||
          window.location.pathname === '';

        const displayDepts =
          isHomePage
            ? departments.slice(0, 6)
            : departments;

        let html = '';
        let styleRules = '';

        displayDepts.forEach(
          (d, index) => {

            // 🔗 Link to the hand-built department-pages/ file when one
            // exists for this department; otherwise fall back to the
            // auto-generated departments/department-{slug}.html page.
            // Keep this list in sync with the files actually present in
            // department-pages/ (mirrors the fallback logic in
            // generate_dynamic.py's resolve_department_link()).
            const MANUAL_DEPARTMENT_SLUGS = new Set([
              'ent',
              'gastroenterology',
              'general-surgery',
              'gynaecology',
              'nephrology',
              'optholmology',
              'orthropedics',
              'pediatric-surgery',
              'rheumatology',
              'urology'
            ]);
            const link =
              MANUAL_DEPARTMENT_SLUGS.has(d.slug)
                ? `department-pages/${d.slug}.html`
                : `departments/department-${d.slug}.html`;

            const iconHtml =
              d.icon_url
                ? `
                  <div class="service-icon">
                    ${d.icon_url}
                  </div>
                `
                : '';

            const bgImage =
              d.bg_image_url
                ? d.bg_image_url.trim()
                : '';

            const cardId =
              `dept-${d.slug || index}`;

            html += `

              <a
                href="${escapeHTML(link)}"
                class="service-card department-card"
                id="${escapeHTML(cardId)}"
                style="text-decoration:none;"
              >

                ${iconHtml}

                <h3>
                  ${escapeHTML(d.name || '')}
                </h3>

              </a>

            `;

            if (bgImage) {

              styleRules += `

                #${cardId}:hover,
                #${cardId}.touch-hover {

                  background-image:
                    url('${bgImage}') !important;

                  background-size:
                    cover !important;

                  background-position:
                    center !important;

                  background-color:
                    transparent !important;

                  color:
                    #ffffff !important;
                }

                #${cardId}:hover h3,
                #${cardId}.touch-hover h3 {

                  color:
                    #ffffff !important;

                  text-shadow:
                    0 1px 3px rgba(0,0,0,0.6);
                }

                #${cardId}:hover .service-icon svg,
                #${cardId}.touch-hover .service-icon svg {

                  stroke:
                    #ffffff !important;
                }

                #${cardId}:hover::before,
                #${cardId}.touch-hover::before {

                  display:
                    none !important;
                }

              `;
            }
          }
        );

        deptGrid.innerHTML =
          html;

        if (styleRules) {

          const styleTag =
            document.createElement(
              'style'
            );

          styleTag.id =
            'department-hover-styles';

          styleTag.textContent =
            styleRules;

          document.head.appendChild(
            styleTag
          );
        }

        const cards =
          deptGrid.querySelectorAll(
            '.department-card'
          );

        cards.forEach(card => {

          const hasBg =
            styleRules.includes(
              card.id
            );

          if (hasBg) {

            card.addEventListener(
              'touchstart',
              () =>
                card.classList.add(
                  'touch-hover'
                ),
              {
                passive: true
              }
            );

            card.addEventListener(
              'touchend',
              () =>
                card.classList.remove(
                  'touch-hover'
                ),
              {
                passive: true
              }
            );

            card.addEventListener(
              'touchcancel',
              () =>
                card.classList.remove(
                  'touch-hover'
                ),
              {
                passive: true
              }
            );
          }

        });

      })();
    }


    // ========================================================
    // LATEST UPDATES CAROUSEL
    // ========================================================

    const updatesContainer =
      document.getElementById(
        'updates-carousel'
      );

    if (updatesContainer) {

      (async () => {

        updatesContainer.innerHTML =
          '<div class="skeleton-card">Loading updates...</div>';

        let updates =
          await fetchJSON(
            DATA_URLS.updates
          );

        if (!updates.length) {

          updates = [

            {
              title:
                'New Cardiology Wing Opened',

              description:
                'We have expanded our cardiac care with a new wing.',

              date:
                '2026-08-01',

              link:
                'https://i.ibb.co/9kYKZsWB/181bf27c6da3.webp'
            },

            {
              title:
                '24/7 Pharmacy Now Available',

              description:
                'Our pharmacy remains open all day, every day.',

              date:
                '2026-07-15'
            },

            {
              title:
                'Dialysis Unit Upgraded',

              description:
                'Advanced dialysis machines installed for better care.',

              date:
                '2026-06-30'
            }

          ];
        }

        updates.sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        );

        let currentIndex = 0;

        let autoSlideInterval;


        function isVideoURL(url) {

          return (
            url &&
            (
              url.includes(
                'youtube.com/embed'
              ) ||
              url.includes(
                'vimeo.com'
              ) ||
              url.match(
                /\.mp4($|\?)/
              )
            )
          );
        }


        function isImageURL(url) {

          return (
            url &&
            /\.(jpeg|jpg|gif|png|webp|svg|bmp|ico)(\?.*)?$/i
              .test(url)
          );
        }


        const slidesHTML =
          updates
            .map((u, i) => {

              const media =
                u.media_url ||
                u.image_url ||
                u.link;

              let titleContent =
                escapeHTML(
                  u.title || ''
                );

              let mediaArea = '';

              if (
                media &&
                isVideoURL(media)
              ) {

                mediaArea = `

                  <div class="update-media">

                    <iframe
                      src="${escapeHTML(media)}"
                      frameborder="0"
                      allowfullscreen
                      style="width:100%;height:100%;border:none;"
                      title="${escapeHTML(u.title || 'Hospital update')}"
                    ></iframe>

                  </div>

                `;

              } else if (
                media &&
                isImageURL(media)
              ) {

                mediaArea = `

                  <div
                    class="update-media"
                    style="background-image:url('${escapeHTML(media)}');"
                  ></div>

                `;

              } else {

                mediaArea = `
                  <div class="update-media update-media-empty"></div>
                `;
              }

              if (
                media &&
                !isVideoURL(media) &&
                !isImageURL(media)
              ) {

                titleContent = `

                  <a
                    href="${escapeHTML(media)}"
                    target="_blank"
                    rel="noopener"
                  >
                    ${escapeHTML(u.title || '')}
                  </a>

                `;
              }

              return `

                <div
                  class="update-slide"
                  data-index="${i}"
                >

                  ${mediaArea}

                  <div class="update-caption">

                    <h4>
                      ${titleContent}
                    </h4>

                    <p>
                      ${escapeHTML(u.description || '')}
                    </p>

                    <small>
                      ${escapeHTML(u.date || '')}
                    </small>

                  </div>

                </div>

              `;

            })
            .join('');


        updatesContainer.innerHTML = `

          <div class="carousel-wrapper">

            <div
              class="carousel-slides"
              id="carousel-slides"
            >
              ${slidesHTML}
            </div>

            <button
              class="carousel-prev"
              id="carousel-prev"
              aria-label="Previous update"
              type="button"
            >
              ❮
            </button>

            <button
              class="carousel-next"
              id="carousel-next"
              aria-label="Next update"
              type="button"
            >
              ❯
            </button>

          </div>

          <div
            class="carousel-dots"
            id="carousel-dots"
          >
            ${
              updates
                .map(
                  (_, i) =>
                    `<span class="dot" data-index="${i}"></span>`
                )
                .join('')
            }
          </div>

        `;


        const slidesEl =
          document.getElementById(
            'carousel-slides'
          );

        const dots =
          document.querySelectorAll(
            '#carousel-dots .dot'
          );

        const prevBtn =
          document.getElementById(
            'carousel-prev'
          );

        const nextBtn =
          document.getElementById(
            'carousel-next'
          );


        function goToSlide(index) {

          if (index < 0) {
            index =
              updates.length - 1;
          }

          if (
            index >= updates.length
          ) {
            index = 0;
          }

          currentIndex =
            index;

          if (slidesEl) {

            slidesEl.style.transform =
              `translateX(-${currentIndex * 100}%)`;
          }

          dots.forEach(
            d =>
              d.classList.remove(
                'active'
              )
          );

          if (dots[currentIndex]) {

            dots[currentIndex]
              .classList.add(
                'active'
              );
          }
        }


        if (prevBtn) {

          prevBtn.addEventListener(
            'click',
            () =>
              goToSlide(
                currentIndex - 1
              )
          );
        }


        if (nextBtn) {

          nextBtn.addEventListener(
            'click',
            () =>
              goToSlide(
                currentIndex + 1
              )
          );
        }


        dots.forEach(dot => {

          dot.addEventListener(
            'click',
            () =>
              goToSlide(
                parseInt(
                  dot.dataset.index,
                  10
                )
              )
          );

        });


        autoSlideInterval =
          setInterval(
            () =>
              goToSlide(
                currentIndex + 1
              ),
            5000
          );


        updatesContainer.addEventListener(
          'mouseenter',
          () =>
            clearInterval(
              autoSlideInterval
            )
        );


        updatesContainer.addEventListener(
          'mouseleave',
          () =>
            autoSlideInterval =
              setInterval(
                () =>
                  goToSlide(
                    currentIndex + 1
                  ),
                5000
              )
        );


        goToSlide(0);

      })();
    }


    // ========================================================
    // BLOG PREVIEW
    // index.html
    // ========================================================

    const blogPreviewGrid =
      document.getElementById(
        'blog-preview-grid'
      );

    if (blogPreviewGrid) {

      (async () => {

        blogPreviewGrid.innerHTML =
          '<div class="skeleton-card">Loading posts...</div>';

        const posts =
          await fetchJSON(
            DATA_URLS.blog
          );

        const published =
          posts
            .filter(isPublished)
            .sort(
              (a, b) =>
                new Date(
                  b.published_at ||
                  b.date ||
                  0
                ) -
                new Date(
                  a.published_at ||
                  a.date ||
                  0
                )
            )
            .slice(0, 3);

        if (!published.length) {

          blogPreviewGrid.innerHTML =
            '<p class="text-center">No blog posts yet.</p>';

          return;
        }

        blogPreviewGrid.innerHTML =
          published
            .map(p => `

              <article
                class="blog-preview-card fade-in"
              >

                ${
                  p.cover_image_url
                    ? `
                      <img
                        src="${escapeHTML(p.cover_image_url)}"
                        alt="${escapeHTML(p.title || 'Health article')}"
                        loading="lazy"
                        style="width:100%;height:180px;object-fit:cover;border-radius:var(--radius);margin-bottom:0.8rem;"
                      >
                    `
                    : ''
                }

                <h3>

                  <a
                    href="blog-post.html?slug=${encodeURIComponent(p.slug || '')}"
                  >
                    ${escapeHTML(p.title || 'Health Article')}
                  </a>

                </h3>

                <time datetime="${escapeHTML(p.published_at || p.date || '')}">
                  ${formatBlogDate(
                    p.published_at ||
                    p.date
                  )}
                </time>

                <p>
                  ${escapeHTML(
                    p.short_summary || ''
                  )}
                </p>

              </article>

            `)
            .join('');

      })();
    }


    // ========================================================
    // BLOG LISTING
    // blog.html
    // ========================================================

    const blogGrid =
      document.getElementById(
        'blog-grid'
      );

    if (blogGrid) {

      (async () => {

        blogGrid.innerHTML =
          '<div class="skeleton-card">Loading posts...</div>';

        const posts =
          await fetchJSON(
            DATA_URLS.blog
          );

        const published =
          posts
            .filter(isPublished)
            .sort(
              (a, b) =>
                new Date(
                  b.published_at ||
                  b.date ||
                  0
                ) -
                new Date(
                  a.published_at ||
                  a.date ||
                  0
                )
            );

        if (!published.length) {

          blogGrid.innerHTML =
            '<p class="text-center">No blog posts yet. Please check back soon.</p>';

          return;
        }

        blogGrid.innerHTML =
          published
            .map((p, index) => {

              const isFeatured = index === 0;
              const readTime = calculateReadingTime(p.body);
              const postUrl = `blog-post.html?slug=${encodeURIComponent(p.slug || '')}`;
              const categoryLabel = p.category || 'Health & Wellness';

              return `

                <article
                  class="blog-preview-card blog-card fade-in${isFeatured ? ' blog-featured-card' : ''}"
                  data-category="${escapeHTML(categoryLabel)}"
                >

                  ${
                    p.cover_image_url
                      ? `
                        <a
                          href="${postUrl}"
                          class="blog-card-image-link"
                          aria-label="Read ${escapeHTML(p.title || 'health article')}"
                        >
                          <div class="blog-card-image-wrapper">
                            <img
                              src="${escapeHTML(p.cover_image_url)}"
                              alt="${escapeHTML(p.title || 'Health article')}"
                              class="blog-card-image"
                              loading="${isFeatured ? 'eager' : 'lazy'}"
                              decoding="async"
                            >
                            <span class="blog-image-overlay">Read Article</span>
                          </div>
                        </a>
                      `
                      : ''
                  }

                  <div class="blog-card-content">

                    <div class="blog-card-meta">

                      <span class="blog-category">
                        ${escapeHTML(categoryLabel)}
                      </span>

                      <time
                        datetime="${escapeHTML(p.published_at || p.date || '')}"
                        class="blog-date"
                      >
                        ${formatBlogDate(
                          p.published_at ||
                          p.date
                        )}
                      </time>

                    </div>

                    <h2 class="blog-card-title">
                      <a href="${postUrl}">
                        ${escapeHTML(p.title || 'Health Article')}
                      </a>
                    </h2>

                    <p>
                      ${escapeHTML(
                        p.short_summary || ''
                      )}
                    </p>

                    <div class="blog-card-footer">

                      <span class="blog-reading-time">
                        ${readTime} min read
                      </span>

                      <a
                        href="${postUrl}"
                        class="read-more"
                        aria-label="Read full article: ${escapeHTML(p.title || 'health article')}"
                      >
                        Read Article <span aria-hidden="true">→</span>
                      </a>

                    </div>

                  </div>

                </article>

              `;
            })
            .join('');

      })();
    }


    // ========================================================
    // SINGLE BLOG POST
    // blog-post.html
    //
    // Google Sheets → blog.json → this renderer
    // ========================================================

    const postContainer =
      document.getElementById(
        'blog-post-content'
      );

    if (postContainer) {

      const params =
        new URLSearchParams(
          window.location.search
        );

      const slug =
        params.get('slug');


      if (!slug) {

        postContainer.innerHTML = `

          <div class="blog-error-state">

            <h1>
              Health Article
            </h1>

            <p>
              No article was selected.
            </p>

            <a
              href="blog.html"
              class="btn btn-primary"
            >
              ← Back to Health Insights
            </a>

          </div>

        `;

      } else {

        (async () => {

          postContainer.innerHTML = `

            <div class="blog-loading-state">

              <div class="skeleton-card">
                Loading article...
              </div>

            </div>

          `;


          const posts =
            await fetchJSON(
              DATA_URLS.blog
            );


          const post =
            posts.find(
              p =>
                String(p.slug) ===
                String(slug)
            );


          if (!post) {

            postContainer.innerHTML = `

              <div class="blog-error-state">

                <div class="blog-error-icon">
                  ✦
                </div>

                <h1>
                  Article Not Found
                </h1>

                <p>
                  The health article you are looking for
                  may have been moved or is no longer available.
                </p>

                <a
                  href="blog.html"
                  class="btn btn-primary"
                >
                  ← Explore Health Insights
                </a>

              </div>

            `;

            return;
          }


          // ==================================================
          // BASIC INFORMATION
          // ==================================================

          const title =
            post.title ||
            'Health Article';

          const summary =
            post.short_summary ||
            'Health information and medical insights from Ibn Sina Hospital.';

          const publishedDate =
            post.published_at ||
            post.date ||
            '';

          const formattedDate =
            formatBlogDate(
              publishedDate
            );

          const readingTime =
            calculateReadingTime(
              post.body
            );

          const category =
            post.category ||
            post.department ||
            'Health & Wellness';

          const coverImage =
            post.cover_image_url ||
            'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp';


          // ==================================================
          // DYNAMIC SEO
          // ==================================================

          document.title =
            `${title} | Ibn Sina Hospital Jammu & Kashmir`;


          const metaDescription =
            document.querySelector(
              'meta[name="description"]'
            );

          if (metaDescription) {

            metaDescription.setAttribute(
              'content',
              summary
            );
          }


          const canonical =
            document.querySelector(
              'link[rel="canonical"]'
            );

          if (canonical) {

            canonical.setAttribute(
              'href',
              `https://ibnsinahospital.in/blog-post.html?slug=${encodeURIComponent(slug)}`
            );
          }


          const ogTitle =
            document.querySelector(
              'meta[property="og:title"]'
            );

          if (ogTitle) {

            ogTitle.setAttribute(
              'content',
              title
            );
          }


          const ogDescription =
            document.querySelector(
              'meta[property="og:description"]'
            );

          if (ogDescription) {

            ogDescription.setAttribute(
              'content',
              summary
            );
          }


          const ogURL =
            document.querySelector(
              'meta[property="og:url"]'
            );

          if (ogURL) {

            ogURL.setAttribute(
              'content',
              window.location.href
            );
          }


          const ogImage =
            document.querySelector(
              'meta[property="og:image"]'
            );

          if (ogImage) {

            ogImage.setAttribute(
              'content',
              coverImage
            );
          }


          const twitterTitle =
            document.querySelector(
              'meta[name="twitter:title"]'
            );

          if (twitterTitle) {

            twitterTitle.setAttribute(
              'content',
              title
            );
          }


          const twitterDescription =
            document.querySelector(
              'meta[name="twitter:description"]'
            );

          if (twitterDescription) {

            twitterDescription.setAttribute(
              'content',
              summary
            );
          }


          const twitterImage =
            document.querySelector(
              'meta[name="twitter:image"]'
            );

          if (twitterImage) {

            twitterImage.setAttribute(
              'content',
              coverImage
            );
          }


          // ==================================================
          // ARTICLE STRUCTURED DATA
          // ==================================================

          addBlogArticleSchema(
            post
          );


          // ==================================================
          // RENDER ARTICLE
          // ==================================================

          postContainer.innerHTML = `

            <article
              class="premium-blog-post"
            >

              <!-- ================================
                   BREADCRUMB
                   ================================ -->

              <nav
                class="blog-breadcrumb"
                aria-label="Breadcrumb"
              >

                <a href="index.html">
                  Home
                </a>

                <span aria-hidden="true">
                  /
                </span>

                <a href="blog.html">
                  Health Insights
                </a>

                <span aria-hidden="true">
                  /
                </span>

                <span>
                  Article
                </span>

              </nav>


              <!-- ================================
                   ARTICLE HERO
                   ================================ -->

              <header
                class="blog-article-hero"
              >

                <div
                  class="blog-article-category"
                >
                  ${escapeHTML(category)}
                </div>


                <h1
                  class="blog-article-title"
                >
                  ${escapeHTML(title)}
                </h1>


                <p
                  class="blog-article-summary"
                >
                  ${escapeHTML(summary)}
                </p>


                <div
                  class="blog-article-meta"
                >

                  ${
                    formattedDate
                      ? `
                        <span class="blog-meta-item">

                          <span
                            aria-hidden="true"
                          >
                            📅
                          </span>

                          <time
                            datetime="${escapeHTML(publishedDate)}"
                          >
                            ${formattedDate}
                          </time>

                        </span>
                      `
                      : ''
                  }


                  <span
                    class="blog-meta-divider"
                    aria-hidden="true"
                  >
                    •
                  </span>


                  <span
                    class="blog-meta-item"
                  >

                    <span
                      aria-hidden="true"
                    >
                      ⏱
                    </span>

                    ${readingTime} min read

                  </span>


                  <span
                    class="blog-meta-divider"
                    aria-hidden="true"
                  >
                    •
                  </span>


                  <span
                    class="blog-meta-item"
                  >

                    Ibn Sina Hospital

                  </span>

                </div>

              </header>


              <!-- ================================
                   HERO IMAGE
                   ================================ -->

              <figure
                class="blog-hero-media"
              >

                <img
                  src="${escapeHTML(coverImage)}"
                  alt="${escapeHTML(title)}"
                  loading="eager"
                  fetchpriority="high"
                  decoding="async"
                >

              </figure>


              <!-- ================================
                   ARTICLE BODY
                   ================================ -->

              <div
                class="blog-article-layout"
              >


                <!-- SOCIAL / SHARE RAIL -->

                <aside
                  class="blog-share-rail"
                  aria-label="Share article"
                >

                  <span>
                    Share
                  </span>

                  <button
                    type="button"
                    class="blog-share-button"
                    data-share="whatsapp"
                    aria-label="Share on WhatsApp"
                  >
                    WA
                  </button>

                  <button
                    type="button"
                    class="blog-share-button"
                    data-share="facebook"
                    aria-label="Share on Facebook"
                  >
                    FB
                  </button>

                  <button
                    type="button"
                    class="blog-share-button"
                    data-share="copy"
                    aria-label="Copy article link"
                  >
                    🔗
                  </button>

                </aside>


                <!-- ARTICLE CONTENT -->

                <div
                  class="blog-article-content blog-body"
                >

                  ${formatBlogBody(post.body)}


                  <!-- ==========================
                       MEDICAL DISCLAIMER
                       ========================== -->

                  <aside
                    class="blog-medical-disclaimer"
                  >

                    <strong>
                      Medical Disclaimer
                    </strong>

                    <p>
                      The information provided in this article
                      is intended for general educational purposes
                      only. It should not replace professional
                      medical advice, diagnosis, or treatment.
                      If you have concerns about your health,
                      please consult a qualified healthcare professional.
                    </p>

                  </aside>

                </div>

              </div>


              <!-- ================================
                   ARTICLE FOOTER CTA
                   ================================ -->

              <section
                class="blog-article-cta"
              >

                <div
                  class="blog-cta-content"
                >

                  <span
                    class="blog-cta-eyebrow"
                  >
                    Need Medical Advice?
                  </span>

                  <h2>
                    Speak with our healthcare team
                  </h2>

                  <p>
                    If you have questions about your health
                    or need professional medical guidance,
                    our team at Ibn Sina Hospital is here to help.
                  </p>

                  <div
                    class="blog-cta-actions"
                  >

                    <a
                      href="appointment.html"
                      class="btn btn-primary"
                    >
                      Book an Appointment
                    </a>

                    <a
                      href="tel:9622552553"
                      class="btn btn-outline"
                    >
                      Call 9622552553
                    </a>

                  </div>

                </div>

              </section>


              <!-- ================================
                   BACK TO BLOG
                   ================================ -->

              <div
                class="blog-back-link"
              >

                <a
                  href="blog.html"
                  class="read-more"
                >
                  ← Back to Health Insights
                </a>

              </div>

            </article>

          `;


          // ==================================================
          // SHARE BUTTONS
          // ==================================================

          const shareButtons =
            postContainer.querySelectorAll(
              '.blog-share-button'
            );


          shareButtons.forEach(
            button => {

              button.addEventListener(
                'click',
                async () => {

                  const type =
                    button.dataset.share;

                  const shareURL =
                    window.location.href;

                  const shareText =
                    title;


                  if (
                    type === 'copy'
                  ) {

                    try {

                      await navigator.clipboard.writeText(
                        shareURL
                      );

                      const original =
                        button.textContent;

                      button.textContent =
                        '✓';

                      setTimeout(
                        () => {
                          button.textContent =
                            original;
                        },
                        1500
                      );

                    } catch (error) {

                      prompt(
                        'Copy this article link:',
                        shareURL
                      );
                    }

                    return;
                  }


                  if (
                    type === 'whatsapp'
                  ) {

                    const url =
                      `https://wa.me/?text=${encodeURIComponent(
                        `${shareText}\n\n${shareURL}`
                      )}`;

                    window.open(
                      url,
                      '_blank',
                      'noopener,noreferrer'
                    );

                    return;
                  }


                  if (
                    type === 'facebook'
                  ) {

                    const url =
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        shareURL
                      )}`;

                    window.open(
                      url,
                      '_blank',
                      'noopener,noreferrer'
                    );

                    return;
                  }

                }
              );

            }
          );


          // ==================================================
          // IMAGE ENHANCEMENT
          // Make article images lazy loaded
          // ==================================================

          const articleImages =
            postContainer.querySelectorAll(
              '.blog-article-content img'
            );

          articleImages.forEach(
            img => {

              if (
                !img.hasAttribute(
                  'loading'
                )
              ) {

                img.setAttribute(
                  'loading',
                  'lazy'
                );
              }

              if (
                !img.hasAttribute(
                  'decoding'
                )
              ) {

                img.setAttribute(
                  'decoding',
                  'async'
                );
              }

            }
          );


          // ==================================================
          // REVEAL ARTICLE
          // ==================================================

          requestAnimationFrame(
            () => {

              postContainer
                .querySelectorAll(
                  '.fade-in'
                )
                .forEach(
                  el =>
                    el.classList.add(
                      'visible'
                    )
                );

            }
          );


        })();
      }
    }


    // ========================================================
    // CAREERS LISTING
    // ========================================================

    const positionsList =
      document.getElementById(
        'positions-list'
      );

    if (positionsList) {

      (async () => {

        const positions =
          await fetchJSON(
            DATA_URLS.careers
          );

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

        if (!open.length) {

          positionsList.innerHTML =
            '<p>No open positions at the moment.</p>';

          return;
        }

        positionsList.innerHTML =
          open
            .map(pos => `

              <div class="position-card">

                <h3>
                  ${escapeHTML(
                    pos.title || ''
                  )}
                </h3>

                <p>
                  ${
                    pos.department
                      ? 'Dept: ' +
                        escapeHTML(
                          pos.department
                        )
                      : ''
                  }

                  |

                  ${escapeHTML(
                    pos.employment_type || ''
                  )}
                </p>

                <p>
                  ${
                    pos.description
                      ? escapeHTML(
                          pos.description
                            .substring(0, 150)
                        ) + '...'
                      : ''
                  }
                </p>

                ${
                  pos.closes_at
                    ? `
                      <small>
                        Closes:
                        ${escapeHTML(
                          pos.closes_at
                        )}
                      </small>
                    `
                    : ''
                }

              </div>

            `)
            .join('');

      })();
    }


    // ========================================================
    // CONTACT FORM
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

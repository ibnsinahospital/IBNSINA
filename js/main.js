// ============================================================
// Ibn Sina Hospital — Main JavaScript
// Google Sheets → generate_dynamic.py → JSON → this file
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
  { title: 'Ambulance Services', description: '24/7 emergency ambulance service for transporting patients to and from the hospital.', icon: 'ambulance' },
  { title: 'Endoscopy', description: 'Advanced upper and lower GI endoscopy including colonoscopy for accurate internal diagnosis.', icon: 'endoscopy' },
  { title: 'Dialysis', description: 'In-house dialysis unit providing life-sustaining renal care with experienced nephrology support.', icon: 'dialysis' },
  { title: 'Digital X-Rays', description: 'High-resolution digital radiography with same-day results for fast, accurate diagnosis.', icon: 'digital-xray' },
  { title: 'Vaccinations', description: 'Complete immunization services for children and adults — routine, travel, and seasonal vaccines.', icon: 'vaccinations' },
  { title: 'TMT (Treadmill Test)', description: 'Cardiac stress testing for heart health assessment — conducted under expert supervision.', icon: 'tmt' },
  { title: 'Holter Monitoring', description: 'Continuous 24-hour ECG recording to detect irregular heart rhythms that may not appear during a routine ECG.', icon: 'holter' },
  { title: 'ABPM', description: '24-hour blood pressure monitoring to assess hypertension patterns and adjust treatment accurately.', icon: 'abpm' },
  { title: 'Ultrasonography', description: 'Detailed ultrasound imaging for abdominal, obstetric, vascular, and soft-tissue evaluation.', icon: 'ultrasonography' },
  { title: 'Colonoscopy', description: 'Thorough colonoscopic screening and diagnostic procedures for gastrointestinal health.', icon: 'colonoscopy' },
  { title: '24/7 Pharmacy', description: 'In-house pharmacy — we never close. Emergency medications and prescriptions anytime.', icon: 'pharmacy' },
  { title: '24/7 Diagnostic Lab', description: 'Round-the-clock laboratory services for in-patients and out-patients, with rapid turnaround.', icon: 'lab' }
];


// ============================================================
// SERVICE ICONS
// ============================================================
const SERVICE_ICONS = {
  ambulance: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="9" width="14" height="9" rx="1"></rect><path d="M15 12h4l3 3v3h-7z"></path><circle cx="6" cy="19" r="2"></circle><circle cx="17" cy="19" r="2"></circle><path d="M6 12h4M8 10v4"></path></svg>',
  endoscopy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10"/><path d="M12 2a15.3 15.3 0 00-4 10 15.3 15.3 0 004 10"/></svg>',
  dialysis: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  'digital-xray': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  vaccinations: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-4 .5-5.5 2-1.5-1.5-3.74-2-5.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  tmt: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  holter: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h6l2-5 3 10 2-5h3"/><rect x="2" y="2" width="20" height="20" rx="4"/></svg>',
  abpm: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M4 4h16M4 20h16"/><circle cx="12" cy="12" r="8"/></svg>',
  ultrasonography: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  colonoscopy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  pharmacy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2h8v4H8z"/><rect x="3" y="6" width="18" height="16" rx="2"/><line x1="12" y1="10" x2="12" y2="18"/><line x1="8" y1="14" x2="16" y2="14"/></svg>',
  lab: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6l2 9-4 8H9l-3-8 3-9z"/><circle cx="12" cy="16" r="2"/></svg>'
};


// ============================================================
// HELPERS
// ============================================================
async function fetchJSON(url) {
  if (!url) return [];
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.warn('Expected array from', url, 'got:', data);
      return [];
    }
    console.log('Fetched JSON from', url, ':', data.length, 'items');
    return data;
  } catch (e) {
    console.error('JSON fetch error for', url, e);
    return [];
  }
}

function escapeHTML(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isPublished(post) {
  const value = (post?.is_published || '').toString().toLowerCase().trim();
  return value === 'true' || value === 'yes' || value === '1' || value === 'y';
}

function calculateReadingTime(htmlOrText) {
  if (!htmlOrText) return 1;
  const text = String(htmlOrText).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

function formatBlogBody(raw) {
  if (!raw) return '';
  const text = String(raw).replace(/[\u200B-\u200D\u2060\uFEFF]/g, '');
  if (/<(p|div|ul|ol|h2|h3|br)\b/i.test(text)) return text;

  const blocks = text.split(/\n\s*\n/);
  let html = '';
  let leadAssigned = false;

  blocks.forEach((block) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const isBulleted = lines.every((l) => /^[-•*]\s+/.test(l));
    const isNumbered = lines.every((l) => /^\d+[.)]\s+/.test(l));

    if (isBulleted) {
      html += '<ul>' + lines.map((l) => `<li>${escapeHTML(l.replace(/^[-•*]\s+/, ''))}</li>`).join('') + '</ul>';
    } else if (isNumbered) {
      html += '<ol>' + lines.map((l) => `<li>${escapeHTML(l.replace(/^\d+[.)]\s+/, ''))}</li>`).join('') + '</ol>';
    } else if (lines.length === 1) {
      const line = lines[0];
      if (line.endsWith('?') && line.split(/\s+/).filter(Boolean).length <= 20) {
        html += `<p class="blog-pull-quote">${escapeHTML(line)}</p>`;
      } else if (line.split(/\s+/).filter(Boolean).length <= 8 && !/[.!?:;,]$/.test(line) && /^[A-Z]/.test(line)) {
        html += `<h3 class="blog-subheading">${escapeHTML(line)}</h3>`;
      } else if (!leadAssigned) {
        html += `<p class="blog-lead-paragraph">${escapeHTML(line)}</p>`;
        leadAssigned = true;
      } else {
        html += `<p>${escapeHTML(line)}</p>`;
      }
    } else {
      const joined = lines.map((l) => escapeHTML(l)).join('<br>');
      if (!leadAssigned) {
        html += `<p class="blog-lead-paragraph">${joined}</p>`;
        leadAssigned = true;
      } else {
        html += `<p>${joined}</p>`;
      }
    }
  });

  return html;
}

function formatBlogDate(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return escapeHTML(dateValue);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
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
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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
  const description = normalizeBlogDescription(post.short_summary || post['short summary'], title);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', '@id': `${articleURL}#article`, headline: title, description, url: articleURL, mainEntityOfPage: { '@id': `${articleURL}#webpage` }, image, datePublished: published || undefined, dateModified: modified || undefined, inLanguage: 'en-IN', author: { '@type': 'Organization', name: 'Ibn Sina Hospital', url: 'https://ibnsinahospital.in/' }, publisher: { '@id': 'https://ibnsinahospital.in/#hospital' } },
      { '@type': 'MedicalWebPage', '@id': `${articleURL}#webpage`, url: articleURL, name: title, description, isPartOf: { '@id': 'https://ibnsinahospital.in/#website' }, about: { '@type': 'Thing', name: 'Health information' }, inLanguage: 'en-IN', datePublished: published || undefined, dateModified: modified || undefined, publisher: { '@id': 'https://ibnsinahospital.in/#hospital' } },
      { '@type': 'BreadcrumbList', '@id': `${articleURL}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ibnsinahospital.in/' },
        { '@type': 'ListItem', position: 2, name: 'Health Insights', item: 'https://ibnsinahospital.in/blog.html' },
        { '@type': 'ListItem', position: 3, name: title, item: articleURL }
      ] }
    ]
  };

  Object.values(schema['@graph']).forEach((node) => {
    Object.keys(node).forEach((key) => { if (node[key] === undefined) delete node[key]; });
  });

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'dynamic-blog-article-schema';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

function renderRelatedBlogLinks(posts, currentSlug) {
  const candidates = posts
    .filter((p) => isPublished(p) && String(p.slug || '') !== String(currentSlug || ''))
    .sort((a, b) => new Date(b.published_at || b.date || 0) - new Date(a.published_at || a.date || 0))
    .slice(0, 3);
  if (!candidates.length) return '';
  return `<section class="blog-related-articles" aria-labelledby="related-articles-heading"><h2 id="related-articles-heading">Related Health Insights</h2><ul>${candidates.map((p) => `<li><a href="blog-post.html?slug=${encodeURIComponent(p.slug || '')}">${escapeHTML(p.title || 'Health Article')}</a></li>`).join('')}</ul></section>`;
}

// ------------------------------------------------------------
// Doctor helpers — FIXED
// ------------------------------------------------------------
function doctorSlug(rawName) {
  return String(rawName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanDoctorName(raw) {
  if (!raw) return 'Doctor';
  let name = String(raw).trim().replace(/\.+$/, '');
  name = name.replace(/^dr\.?\s*/i, '').trim();
  if (!name) return 'Doctor';
  name = name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return `Dr. ${name}`;
}

function prettySpecialty(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/-/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function sortByDisplayOrder(arr) {
  return [...arr].sort((a, b) => (parseInt(a.display_order || 0, 10) || 0) - (parseInt(b.display_order || 0, 10) || 0));
}

function isEmpty(container) {
  return container && container.children.length === 0;
}

// Injected once — keeps doctor cards styled even without CSS additions
function injectDoctorCardStyle() {
  if (document.getElementById('doctor-card-force-visibility')) return;
  const style = document.createElement('style');
  style.id = 'doctor-card-force-visibility';
  style.textContent = `
    .doctor-card { background:#fff; border:1px solid #e0e0d0; min-height:200px; padding:1.5rem; border-radius:0.75rem; text-align:center; }
    .doctor-card h3 { color:#2d4a2b; font-size:1.3rem; margin-bottom:0.3rem; }
    .doctor-card .doctor-specialty { color:#5a6b4a; font-weight:600; font-size:1rem; }
    .doctor-card .doctor-qual { color:#555; font-size:0.85rem; line-height:1.5; }
    .doctor-card .btn { color:#fff; background:#2d4a2b; border-color:#2d4a2b; display:inline-block; }
  `;
  document.head.appendChild(style);
}


// ============================================================
// DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // -------- HAMBURGER MENU --------
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('main-nav');
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
    });
    mainNav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // -------- STICKY HEADER --------
  window.addEventListener('scroll', () => {
    const header = document.getElementById('site-header');
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // -------- SCROLL REVEAL --------
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
  }

  // ==========================================================
  // DOCTOR LISTING (doctors.html)
  // ==========================================================
  const doctorGrid = document.getElementById('doctor-grid');
  if (doctorGrid) {
    const filterDept = document.getElementById('filter-department');
    const searchInput = document.getElementById('search-doctor');
    let doctorsCache = [];

    async function populateDepartmentsFilter() {
      if (!filterDept) return;
      try {
        const departments = await fetchJSON(DATA_URLS.departments);
        filterDept.innerHTML = departments.length
          ? '<option value="">All Departments</option>' + departments.map((d) => `<option value="${escapeHTML(d.name)}">${escapeHTML(d.name)}</option>`).join('')
          : '<option value="">All Departments</option>';
      } catch (e) {
        filterDept.innerHTML = '<option value="">All Departments</option>';
      }
    }

    async function loadDoctors() {
      if (!isEmpty(doctorGrid)) {
        doctorsCache = await fetchJSON(DATA_URLS.doctors);
        return;
      }
      doctorGrid.innerHTML = '<div class="skeleton-card">Loading doctors...</div>';
      doctorsCache = await fetchJSON(DATA_URLS.doctors);
      if (!doctorsCache.length) {
        doctorGrid.innerHTML = '<p style="text-align:center;">No doctors found. Please call 9622552553.</p>';
        return;
      }
      renderDoctors();
      const params = new URLSearchParams(window.location.search);
      const deptParam = params.get('dept');
      if (deptParam && filterDept) {
        filterDept.value = deptParam;
        renderDoctors();
      }
    }

    function renderDoctors() {
      let filtered = sortByDisplayOrder(doctorsCache);
      const selectedDept = filterDept ? filterDept.value.trim().toLowerCase() : '';
      if (selectedDept) {
        filtered = filtered.filter((d) => d.department && d.department.trim().toLowerCase() === selectedDept);
      }
      if (searchInput && searchInput.value.trim()) {
        const q = searchInput.value.toLowerCase();
        filtered = filtered.filter((d) =>
          (((d.name || '') + (d.specialty || '') + (d.department || '')).toLowerCase().includes(q))
        );
      }
      if (!filtered.length) {
        doctorGrid.innerHTML = '<p style="text-align:center;">No doctors match your criteria.</p>';
        return;
      }
      injectDoctorCardStyle();
      doctorGrid.innerHTML = filtered.map((d) => {
        const cleanName = cleanDoctorName(d.name);
        const docUrl = `/doctors/doctor-${doctorSlug(d.name)}.html`;
        return `<div class="doctor-card fade-in" onclick="location.href='${docUrl}'">
          ${d.photo_url
            ? `<img src="${escapeHTML(d.photo_url)}" alt="${escapeHTML(cleanName)}" style="width:80px;height:80px;object-fit:cover;border-radius:50%;margin:0 auto 1rem;display:block;" loading="lazy" width="80" height="80">`
            : `<div class="doctor-card-img-placeholder"><svg width="80" height="80" viewBox="0 0 60 60"><circle cx="30" cy="22" r="16" fill="#a4ac86" opacity="0.5"/><ellipse cx="30" cy="55" rx="22" ry="14" fill="#a4ac86" opacity="0.4"/></svg></div>`
          }
          <h3>${escapeHTML(cleanName)}</h3>
          <p class="doctor-specialty">${escapeHTML(prettySpecialty(d.specialty))}</p>
          <p class="doctor-qual">${escapeHTML(d.qualifications || '')}</p>
          <a href="appointment.html?doctor=${encodeURIComponent(cleanName)}" class="btn btn-outline btn-sm" onclick="event.stopPropagation();">Book Appointment</a>
        </div>`;
      }).join('');
    }

    populateDepartmentsFilter().then(loadDoctors);
    if (filterDept) filterDept.addEventListener('change', renderDoctors);
    if (searchInput) searchInput.addEventListener('input', renderDoctors);
  }

  // ==========================================================
  // FEATURED DOCTORS (index.html)
  // ==========================================================
  const featContainer = document.getElementById('featured-doctor-cards');
  if (featContainer && isEmpty(featContainer)) {
    (async () => {
      featContainer.innerHTML = '<div class="skeleton-card">Loading...</div>';
      const doctors = await fetchJSON(DATA_URLS.doctors);
      const featured = sortByDisplayOrder(doctors).slice(0, 6);
      if (!featured.length) {
        featContainer.innerHTML = '<p class="text-center">Doctor list coming soon.</p>';
        return;
      }
      injectDoctorCardStyle();
      featContainer.innerHTML = featured.map((d) => {
        const cleanName = cleanDoctorName(d.name);
        const docUrl = `/doctors/doctor-${doctorSlug(d.name)}.html`;
        return `<div class="doctor-card fade-in" onclick="location.href='${docUrl}'">
          ${d.photo_url
            ? `<img src="${escapeHTML(d.photo_url)}" alt="${escapeHTML(cleanName)}" style="width:80px;height:80px;object-fit:cover;border-radius:50%;margin:0 auto 1rem;display:block;" loading="lazy" width="80" height="80">`
            : `<div class="doctor-card-img-placeholder"><svg width="80" height="80" viewBox="0 0 60 60"><circle cx="30" cy="22" r="16" fill="#a4ac86" opacity="0.5"/><ellipse cx="30" cy="55" rx="22" ry="14" fill="#a4ac86" opacity="0.4"/></svg></div>`
          }
          <h3>${escapeHTML(cleanName)}</h3>
          <p class="doctor-specialty">${escapeHTML(prettySpecialty(d.specialty))}</p>
          <p class="doctor-qual">${escapeHTML(d.qualifications || '')}</p>
          <a href="appointment.html?doctor=${encodeURIComponent(cleanName)}" class="btn btn-outline btn-sm" onclick="event.stopPropagation();">Book Appointment</a>
        </div>`;
      }).join('');
    })();
  }

  // ==========================================================
  // DOCTOR PROFILE (legacy — kept for old URLs)
  // ==========================================================
  const profileContainer = document.getElementById('doctor-profile-content');
  if (profileContainer) {
    const params = new URLSearchParams(window.location.search);
    const docId = params.get('id');
    if (!docId) {
      profileContainer.innerHTML = '<p>No doctor selected.</p>';
    } else {
      (async () => {
        const doctors = await fetchJSON(DATA_URLS.doctors);
        const doc = doctors.find((d) => String(d.id) === String(docId));
        if (!doc) {
          profileContainer.innerHTML = '<p>Doctor not found.</p>';
          return;
        }
        const cleanName = cleanDoctorName(doc.name);
        document.title = `${cleanName} | Ibn Sina Hospital`;
        setMetaContent('meta[name="description"]', `${cleanName} — ${prettySpecialty(doc.specialty)} at Ibn Sina Hospital, Budgam.`);
        profileContainer.innerHTML = `<div class="doctor-profile-card">
          ${doc.photo_url ? `<img src="${escapeHTML(doc.photo_url)}" alt="${escapeHTML(cleanName)}" style="width:120px;height:120px;object-fit:cover;border-radius:50%;margin:0 auto 1rem;display:block;">` : ''}
          <h1>${escapeHTML(cleanName)}</h1>
          <p><strong>Specialty:</strong> ${escapeHTML(prettySpecialty(doc.specialty) || 'N/A')}</p>
          <p><strong>Department:</strong> ${escapeHTML(doc.department || 'N/A')}</p>
          <p><strong>Qualifications:</strong> ${escapeHTML(doc.qualifications || 'N/A')}</p>
          <div class="doctor-bio"><strong>About:</strong><br>${doc.about || 'No biography available.'}</div>
          <a href="appointment.html?doctor=${encodeURIComponent(cleanName)}" class="btn btn-primary">Book Appointment</a>
          <a href="doctors.html" class="btn btn-outline" style="margin-top:1rem;">← Back to All Doctors</a>
        </div>`;
      })();
    }
  }

  // ==========================================================
  // STATIC SERVICES
  // ==========================================================
  const servicesGrid = document.getElementById('services-grid');
  if (servicesGrid && isEmpty(servicesGrid)) {
    servicesGrid.innerHTML = STATIC_SERVICES.map((s) => {
      const iconHtml = SERVICE_ICONS[s.icon] ? `<div class="service-icon">${SERVICE_ICONS[s.icon]}</div>` : '';
      return `<div class="service-card fade-in">${iconHtml}<h3>${escapeHTML(s.title)}</h3><p>${escapeHTML(s.description)}</p></div>`;
    }).join('');
  }

  // ==========================================================
  // DYNAMIC DEPARTMENTS
  // ==========================================================
  const deptGrid = document.getElementById('departments-grid');
  if (deptGrid && isEmpty(deptGrid)) {
    (async () => {
      deptGrid.innerHTML = '<div class="skeleton-card">Loading departments...</div>';
      const departments = await fetchJSON(DATA_URLS.departments);
      if (!departments.length) {
        deptGrid.innerHTML = '<p class="text-center">Departments list unavailable.</p>';
        return;
      }
      const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
      const displayDepts = isHomePage ? departments.slice(0, 6) : departments;
      const MANUAL = new Set(['cardiology','dentistry','dermatology','ent','gastroenterology','general-medicine','general-surgery','gynaecology','nephrology','neonatal-intensive-care-unit','ophthalmology','orthopaedics','pediatric-surgery','physiotherapy','plastic-surgery','pulmonology','radiology','rheumatology','urology']);
      let html = '';
      let styleRules = '';
      displayDepts.forEach((d, index) => {
        const link = MANUAL.has(d.slug) ? `department-pages/${d.slug}.html` : `departments/department-${d.slug}.html`;
        const iconHtml = d.icon_url ? `<div class="service-icon">${d.icon_url}</div>` : '';
        const bgImage = d.bg_image_url ? d.bg_image_url.trim() : '';
        const cardId = `dept-${d.slug || index}`;
        html += `<a href="${escapeHTML(link)}" class="service-card department-card" id="${escapeHTML(cardId)}" style="text-decoration:none;">${iconHtml}<h3>${escapeHTML(d.name || '')}</h3></a>`;
        if (bgImage) {
          styleRules += `#${cardId}:hover{background-image:url('${bgImage}')!important;background-size:cover!important;background-position:center!important;background-color:transparent!important;color:#fff!important;}#${cardId}:hover h3{color:#fff!important;text-shadow:0 1px 3px rgba(0,0,0,.6);}#${cardId}:hover .service-icon svg{stroke:#fff!important;}`;
        }
      });
      deptGrid.innerHTML = html;
      if (styleRules) {
        const styleTag = document.createElement('style');
        styleTag.id = 'department-hover-styles';
        styleTag.textContent = styleRules;
        document.head.appendChild(styleTag);
      }
    })();
  }

  // ==========================================================
  // LATEST UPDATES CAROUSEL
  // ==========================================================
  const updatesContainer = document.getElementById('updates-carousel');
  if (updatesContainer && isEmpty(updatesContainer)) {
    (async () => {
      let updates = await fetchJSON(DATA_URLS.updates);
      if (!updates.length) {
        updates = [
          { title: 'New Cardiology Wing Opened', description: 'We have expanded our cardiac care with a new wing.', date: '2026-08-01' },
          { title: '24/7 Pharmacy Now Available', description: 'Our pharmacy remains open all day, every day.', date: '2026-07-15' },
          { title: 'Dialysis Unit Upgraded', description: 'Advanced dialysis machines installed for better care.', date: '2026-06-30' }
        ];
      }
      updates.sort((a, b) => new Date(b.date) - new Date(a.date));
      let currentIndex = 0;
      let autoSlideInterval;

      const isVideoURL = (url) => url && (url.includes('youtube.com/embed') || url.includes('vimeo.com') || /\.mp4($|\?)/.test(url));
      const isImageURL = (url) => url && /\.(jpeg|jpg|gif|png|webp|svg|bmp|ico)(\?.*)?$/i.test(url);

      const slidesHTML = updates.map((u, i) => {
        const media = u.media_url || u.image_url || u.link;
        let titleContent = escapeHTML(u.title || '');
        let mediaArea = '';
        if (media && isVideoURL(media)) {
          mediaArea = `<div class="update-media"><iframe src="${escapeHTML(media)}" frameborder="0" allowfullscreen style="width:100%;height:100%;border:none;" title="${escapeHTML(u.title || 'Hospital update')}"></iframe></div>`;
        } else if (media && isImageURL(media)) {
          mediaArea = `<div class="update-media" style="background-image:url('${escapeHTML(media)}');"></div>`;
        } else {
          mediaArea = `<div class="update-media update-media-empty"></div>`;
        }
        if (media && !isVideoURL(media) && !isImageURL(media)) {
          titleContent = `<a href="${escapeHTML(media)}" target="_blank" rel="noopener">${escapeHTML(u.title || '')}</a>`;
        }
        return `<div class="update-slide" data-index="${i}">${mediaArea}<div class="update-caption"><h3>${titleContent}</h3><p>${escapeHTML(u.description || '')}</p><small>${escapeHTML(u.date || '')}</small></div></div>`;
      }).join('');

      updatesContainer.innerHTML = `<div class="carousel-wrapper"><div class="carousel-slides" id="carousel-slides">${slidesHTML}</div><button class="carousel-prev" id="carousel-prev" aria-label="Previous update" type="button">❮</button><button class="carousel-next" id="carousel-next" aria-label="Next update" type="button">❯</button></div><div class="carousel-dots" id="carousel-dots">${updates.map((_, i) => `<span class="dot" data-index="${i}"></span>`).join('')}</div>`;

      const slidesEl = document.getElementById('carousel-slides');
      const dots = document.querySelectorAll('#carousel-dots .dot');
      const prevBtn = document.getElementById('carousel-prev');
      const nextBtn = document.getElementById('carousel-next');

      function goToSlide(index) {
        if (index < 0) index = updates.length - 1;
        if (index >= updates.length) index = 0;
        currentIndex = index;
        if (slidesEl) slidesEl.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((d) => d.classList.remove('active'));
        if (dots[currentIndex]) dots[currentIndex].classList.add('active');
      }

      if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
      dots.forEach((dot) => dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index, 10))));

      autoSlideInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);
      updatesContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
      updatesContainer.addEventListener('mouseleave', () => { autoSlideInterval = setInterval(() => goToSlide(currentIndex + 1), 5000); });
      goToSlide(0);
    })();
  }

  // ==========================================================
  // BLOG PREVIEW (index.html)
  // ==========================================================
  const blogPreviewGrid = document.getElementById('blog-preview-grid');
  if (blogPreviewGrid && isEmpty(blogPreviewGrid)) {
    (async () => {
      blogPreviewGrid.innerHTML = '<div class="skeleton-card">Loading posts...</div>';
      const posts = await fetchJSON(DATA_URLS.blog);
      const published = posts.filter(isPublished).sort((a, b) => new Date(b.published_at || b.date || 0) - new Date(a.published_at || a.date || 0)).slice(0, 3);
      if (!published.length) {
        blogPreviewGrid.innerHTML = '<p class="text-center">No blog posts yet.</p>';
        return;
      }
      blogPreviewGrid.innerHTML = published.map((p) => `<article class="blog-preview-card fade-in">${p.cover_image_url ? `<img src="${escapeHTML(p.cover_image_url)}" alt="${escapeHTML(p.title || 'Health article')}" loading="lazy" width="400" height="180" style="width:100%;height:180px;object-fit:cover;border-radius:var(--radius);margin-bottom:0.8rem;">` : ''}<h3><a href="blog/blog-${escapeHTML(p.slug || '')}.html">${escapeHTML(p.title || 'Health Article')}</a></h3><time datetime="${escapeHTML(p.published_at || p.date || '')}">${formatBlogDate(p.published_at || p.date)}</time><p>${escapeHTML(p.short_summary || p['short summary'] || '')}</p></article>`).join('');
    })();
  }

  // ==========================================================
  // BLOG LISTING (blog.html)
  // ==========================================================
  const blogGrid = document.getElementById('blog-grid');
  if (blogGrid && isEmpty(blogGrid)) {
    (async () => {
      blogGrid.innerHTML = '<div class="skeleton-card">Loading posts...</div>';
      const posts = await fetchJSON(DATA_URLS.blog);
      const published = posts.filter(isPublished).sort((a, b) => new Date(b.published_at || b.date || 0) - new Date(a.published_at || a.date || 0));
      if (!published.length) {
        blogGrid.innerHTML = '<p class="text-center">No blog posts yet. Please check back soon.</p>';
        return;
      }
      blogGrid.innerHTML = published.map((p, index) => {
        const isFeatured = index === 0;
        const readTime = calculateReadingTime(p.body);
        const postUrl = `blog/blog-${escapeHTML(p.slug || '')}.html`;
        const categoryLabel = p.category || p.department || 'Health & Wellness';
        return `<article class="blog-preview-card blog-card fade-in${isFeatured ? ' blog-featured-card' : ''}" data-category="${escapeHTML(categoryLabel)}">
          ${p.cover_image_url ? `<a href="${postUrl}" class="blog-card-image-link" aria-label="Read ${escapeHTML(p.title || 'health article')}"><div class="blog-card-image-wrapper"><img src="${escapeHTML(p.cover_image_url)}" alt="${escapeHTML(p.title || 'Health article')}" class="blog-card-image" loading="${isFeatured ? 'eager' : 'lazy'}" decoding="async" width="600" height="400"><span class="blog-image-overlay">Read Article</span></div></a>` : ''}
          <div class="blog-card-content"><div class="blog-card-meta"><span class="blog-category">${escapeHTML(categoryLabel)}</span><time datetime="${escapeHTML(p.published_at || p.date || '')}" class="blog-date">${formatBlogDate(p.published_at || p.date)}</time></div>
          <h2 class="blog-card-title"><a href="${postUrl}">${escapeHTML(p.title || 'Health Article')}</a></h2>
          <p>${escapeHTML(p.short_summary || p['short summary'] || '')}</p>
          <div class="blog-card-footer"><span class="blog-reading-time">${readTime} min read</span><a href="${postUrl}" class="read-more" aria-label="Read full article: ${escapeHTML(p.title || 'health article')}">Read Article <span aria-hidden="true">→</span></a></div></div></article>`;
      }).join('');
    })();
  }

  // ==========================================================
  // SINGLE BLOG POST (legacy — kept for old URLs)
  // ==========================================================
  const postContainer = document.getElementById('blog-post-content');
  if (postContainer) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) {
      postContainer.innerHTML = '<div class="blog-error-state"><h1>Health Article</h1><p>No article was selected.</p><a href="blog.html" class="btn btn-primary">← Back to Health Insights</a></div>';
    } else {
      (async () => {
        postContainer.innerHTML = '<div class="blog-loading-state"><div class="skeleton-card">Loading article...</div></div>';
        const posts = await fetchJSON(DATA_URLS.blog);
        const post = posts.find((p) => String(p.slug) === String(slug));
        if (!post) {
          postContainer.innerHTML = '<div class="blog-error-state"><h1>Article Not Found</h1><p>The health article you are looking for may have been moved or is no longer available.</p><a href="blog.html" class="btn btn-primary">← Explore Health Insights</a></div>';
          return;
        }
        const title = post.title || 'Health Article';
        const summary = post.short_summary || post['short summary'] || 'Health information and medical insights from Ibn Sina Hospital.';
        const publishedDate = post.published_at || post.date || '';
        const formattedDate = formatBlogDate(publishedDate);
        const readingTime = calculateReadingTime(post.body);
        const category = post.category || post.department || 'Health & Wellness';
        const coverImage = post.cover_image_url || 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp';
        const articleURL = `https://ibnsinahospital.in/blog-post.html?slug=${encodeURIComponent(slug)}`;
        const seoDescription = normalizeBlogDescription(summary, 'Health information and medical insights from Ibn Sina Hospital, Budgam, Jammu and Kashmir.');
        document.title = `${title} | Ibn Sina Hospital, Budgam, Jammu & Kashmir`;
        setMetaContent('meta[name="description"]', seoDescription);
        upsertLinkRel('canonical', articleURL);
        setMetaContent('meta[property="og:title"]', title);
        setMetaContent('meta[property="og:description"]', seoDescription);
        setMetaContent('meta[property="og:url"]', articleURL);
        setMetaContent('meta[property="og:image"]', coverImage);
        setMetaContent('meta[name="twitter:title"]', title);
        setMetaContent('meta[name="twitter:description"]', seoDescription);
        setMetaContent('meta[name="twitter:image"]', coverImage);
        addBlogArticleSchema(post);

        postContainer.innerHTML = `<article class="premium-blog-post">
          <nav class="blog-breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><a href="blog.html">Health Insights</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHTML(title)}</span></nav>
          <header class="blog-article-hero"><div class="blog-article-category">${escapeHTML(category)}</div><h1 class="blog-article-title">${escapeHTML(title)}</h1><p class="blog-article-summary">${escapeHTML(summary)}</p>
          <div class="blog-article-meta">${formattedDate ? `<span class="blog-meta-item"><span aria-hidden="true">📅</span><time datetime="${escapeHTML(publishedDate)}">${formattedDate}</time></span>` : ''}<span class="blog-meta-divider" aria-hidden="true">•</span><span class="blog-meta-item"><span aria-hidden="true">⏱</span>${readingTime} min read</span><span class="blog-meta-divider" aria-hidden="true">•</span><span class="blog-meta-item">Ibn Sina Hospital</span></div></header>
          <figure class="blog-hero-media"><img src="${escapeHTML(coverImage)}" alt="${escapeHTML(title)}" loading="eager" fetchpriority="high" decoding="async"></figure>
          <div class="blog-article-layout"><aside class="blog-share-rail" aria-label="Share article"><span>Share</span><button type="button" class="blog-share-button" data-share="whatsapp" aria-label="Share on WhatsApp">WA</button><button type="button" class="blog-share-button" data-share="facebook" aria-label="Share on Facebook">FB</button><button type="button" class="blog-share-button" data-share="copy" aria-label="Copy article link">🔗</button></aside>
          <div class="blog-article-content blog-body">${formatBlogBody(post.body)}${renderRelatedBlogLinks(posts, slug)}<aside class="blog-medical-disclaimer"><strong>Medical Disclaimer</strong><p>The information provided in this article is intended for general educational purposes only. It should not replace professional medical advice, diagnosis, or treatment. If you have concerns about your health, please consult a qualified healthcare professional.</p></aside></div></div>
          <section class="blog-article-cta"><div class="blog-cta-content"><span class="blog-cta-eyebrow">Need Medical Advice?</span><h2>Speak with our healthcare team</h2><p>If you have questions about your health or need professional medical guidance, our team at Ibn Sina Hospital is here to help.</p><div class="blog-cta-actions"><a href="appointment.html" class="btn btn-primary">Book an Appointment</a><a href="tel:9622552553" class="btn btn-outline">Call 9622552553</a></div></div></section>
          <div class="blog-back-link"><a href="blog.html" class="read-more">← Back to Health Insights</a></div>
        </article>`;

        postContainer.querySelectorAll('.blog-share-button').forEach((button) => {
          button.addEventListener('click', async () => {
            const type = button.dataset.share;
            const shareURL = window.location.href;
            const shareText = title;
            if (type === 'copy') {
              try { await navigator.clipboard.writeText(shareURL); const o = button.textContent; button.textContent = '✓'; setTimeout(() => { button.textContent = o; }, 1500); } catch (e) { prompt('Copy this article link:', shareURL); }
              return;
            }
            if (type === 'whatsapp') { window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareURL}`)}`, '_blank', 'noopener,noreferrer'); return; }
            if (type === 'facebook') { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareURL)}`, '_blank', 'noopener,noreferrer'); return; }
          });
        });

        postContainer.querySelectorAll('.blog-article-content img').forEach((img) => {
          if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
          if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
        });

        requestAnimationFrame(() => {
          postContainer.querySelectorAll('.fade-in').forEach((el) => el.classList.add('visible'));
        });
      })();
    }
  }

  // ==========================================================
  // CAREERS LISTING
  // ==========================================================
  const positionsList = document.getElementById('positions-list');
  if (positionsList && isEmpty(positionsList)) {
    (async () => {
      const positions = await fetchJSON(DATA_URLS.careers);
      const open = positions.filter((p) => ['true', 'yes', '1', 'y'].includes((p.is_open || '').toString().toLowerCase().trim()));
      if (!open.length) {
        positionsList.innerHTML = '<p>No open positions at the moment.</p>';
        return;
      }
      positionsList.innerHTML = open.map((pos) => `<div class="position-card"><h3>${escapeHTML(pos.title || '')}</h3><p>${pos.department ? 'Dept: ' + escapeHTML(pos.department) : ''} | ${escapeHTML(pos.employment_type || '')}</p><p>${pos.description ? escapeHTML(pos.description.substring(0, 150)) + '...' : ''}</p>${pos.closes_at ? `<small>Closes: ${escapeHTML(pos.closes_at)}</small>` : ''}</div>`).join('');
    })();
  }

  // ==========================================================
  // CONTACT FORM
  // ==========================================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name')?.value.trim() || '';
      const email = document.getElementById('contact-email')?.value.trim() || '';
      const phone = document.getElementById('contact-phone')?.value.trim() || '';
      const subject = document.getElementById('contact-subject')?.value.trim() || '';
      const message = document.getElementById('contact-message')?.value.trim() || '';
      const body = `Name: ${name}%0D%0APhone: ${phone}%0D%0AEmail: ${email}%0D%0A%0D%0A${message}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=weibnsina@gmail.com&su=${encodeURIComponent(subject || 'Contact Form')}&body=${body}`;
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // ==========================================================
  // CAREERS APPLICATION
  // ==========================================================
  const careersForm = document.getElementById('careers-form');
  if (careersForm) {
    const posSelect = document.getElementById('applicant-position');
    if (posSelect) {
      fetchJSON(DATA_URLS.careers).then((positions) => {
        const open = positions.filter((p) => ['true', 'yes', '1', 'y'].includes((p.is_open || '').toString().toLowerCase().trim()));
        posSelect.innerHTML = '<option value="">-- Select Position --</option>' + open.map((p) => `<option value="${escapeHTML(p.title || '')}">${escapeHTML(p.title || '')}</option>`).join('');
      });
    }
    careersForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('applicant-name')?.value.trim() || '';
      const phone = document.getElementById('applicant-phone')?.value.trim() || '';
      const email = document.getElementById('applicant-email')?.value.trim() || '';
      const position = posSelect?.value || '';
      const cover = document.getElementById('cover-message')?.value.trim() || '';
      const body = `Position Applied: ${position}%0D%0AName: ${name}%0D%0APhone: ${phone}%0D%0AEmail: ${email}%0D%0A%0D%0ACover Message:%0D%0A${cover}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=weibnsina@gmail.com&su=${encodeURIComponent(`Job Application: ${position || 'Open Position'}`)}&body=${body}`;
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // ==========================================================
  // APPOINTMENT FORM — DO NOT MODIFY (works with Google Apps Script)
  // ==========================================================
  const appointmentForm = document.getElementById('appointment-form');
  if (appointmentForm) {
    const deptSelect = document.getElementById('department');
    const docSelect = document.getElementById('preferred-doctor');
    const successDiv = document.getElementById('appointment-success');

    const departments = ['Cardiology','CTVS','Dental','Dermatology','Endocrinology','ENT','Gastroenterology','General Surgery','Gynaecology','Neurosurgery','Neurology','Ophthalmology','Orthopaedics','Pediatrics','Physiotherapy','Plastic Surgery','Psychiatry','Pulmonology','Rheumatology','Urology'];

    if (deptSelect) {
      deptSelect.innerHTML = '<option value="">-- Select --</option>' + departments.map((d) => `<option value="${escapeHTML(d)}">${escapeHTML(d)}</option>`).join('');
    }

    async function populateDoctorsDropdown() {
      if (!docSelect) return;
      try {
        const doctors = await fetchJSON(DATA_URLS.doctors);
        docSelect.innerHTML = '<option value="">-- Any Doctor --</option>' + sortByDisplayOrder(doctors).map((d) => {
          const cleanName = cleanDoctorName(d.name);
          return `<option value="${escapeHTML(cleanName)}">${escapeHTML(cleanName)}${d.specialty ? ` (${escapeHTML(prettySpecialty(d.specialty))})` : ''}</option>`;
        }).join('');
        const urlParams = new URLSearchParams(window.location.search);
        const preselected = urlParams.get('doctor');
        if (preselected) {
          const match = Array.from(docSelect.options).find((opt) => opt.value === preselected);
          if (match) docSelect.value = preselected;
        }
      } catch (err) {
        docSelect.innerHTML = '<option value="">-- Any Doctor --</option>';
      }
    }

    populateDoctorsDropdown();

    const hiddenFrame = document.querySelector('iframe[name="hidden-iframe"]');
    if (hiddenFrame) {
      hiddenFrame.addEventListener('load', () => {
        appointmentForm.style.display = 'none';
        if (successDiv) successDiv.style.display = 'block';
      });
    }
  }
});
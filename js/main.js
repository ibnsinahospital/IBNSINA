// ========== CONFIGURATION ==========
const SHEET_URLS = {
  doctors: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_H8Rgr6VOjrap91SR_3nbBQLVf7QOQOHqZSs-pT6SfoNpyHjpj-QD0nNtcHDr5ip439naZ0sTr62Y/pub?output=csv',
  blog: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRyksX4tU5UEPKPVbRGUiCe7lXxS-Z0WqSgB1vghBBqEvddzZ9M5ZSMtvfoCFPXRZoLojgWjIEmbQH8/pub?output=csv',
  gallery: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3ipvIHQSd0uvYjhDFrlMhG7nF5J9FKMPxB60sb9mrGWd-PiiTrmeMwqhPEUOXn8KI-MPov0hbAjSu/pub?output=csv',
  careers: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS5kvrIMvCUkkTyP0TqkP7Y4fst-kBhZMTIzo3Vcc_jHnaYXkT-d0GsSev0yJyqosiKwmPsfZjolSrP/pub?output=csv',
  departments: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSY7cmsIsfCzFSfe6Gf6wG-XWffYscBhXHqnFqv0RvwuqbG7kNnPG7eSmSaR_E-ztlY8qLkHZ2yuL-t/pub?output=csv',
  updates: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZW6V9At9Nb8LCupYha92UshFV5P6sbSKAOJmDoaZR6IbZyFoJorhEyJPcq5zscDdTSC_B39-j1RW5/pub?output=csv'
};

// ========== STATIC SERVICES (hardcoded) ==========
const STATIC_SERVICES = [
  { title: 'Ambulance Services', description: '24/7 emergency ambulance service for transporting patients to and from the hospital.', icon: 'ambulance' },
  { title: 'Endoscopy', description: 'Advanced upper and lower GI endoscopy including colonoscopy for accurate internal diagnosis.', icon: 'endoscopy' },
  { title: 'Dialysis', description: 'In-house dialysis unit providing life-sustaining renal care with experienced nephrology support.', icon: 'dialysis' },
  { title: 'Digital X-Rays', description: 'High-resolution digital radiography with same-day results for fast, accurate diagnosis.', icon: 'digital-xray' },
  { title: 'Vaccinations', description: 'Complete immunization services for children and adults — routine, travel, and seasonal vaccines.', icon: 'vaccinations' },
  { title: 'TMT (Treadmill Test)', description: 'Cardiac stress testing for heart health assessment — conducted under expert supervision.', icon: 'tmt' },
  { title: 'Holter Monitoring', description: 'Continuous 24‑hour ECG recording to detect irregular heart rhythms that may not appear during a routine ECG.', icon: 'holter' },
  { title: 'ABPM (Ambulatory Blood Pressure Monitoring)', description: '24‑hour blood pressure monitoring to assess hypertension patterns and adjust treatment accurately.', icon: 'abpm' },
  { title: 'Ultrasonography', description: 'Detailed ultrasound imaging for abdominal, obstetric, vascular, and soft-tissue evaluation.', icon: 'ultrasonography' },
  { title: 'Colonoscopy', description: 'Thorough colonoscopic screening and diagnostic procedures for gastrointestinal health.', icon: 'colonoscopy' },
  { title: '24/7 Pharmacy', description: 'In-house pharmacy — we never close. Emergency medications and prescriptions anytime.', icon: 'pharmacy' },
  { title: '24/7 Diagnostic Lab', description: 'Round-the-clock laboratory services for in-patients and out-patients, with rapid turnaround.', icon: 'lab' }
];

// ========== SERVICE ICONS ==========
const SERVICE_ICONS = {
  ambulance: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="9" width="14" height="9" rx="1"></rect><path d="M15 12h4l3 3v3h-7z"></path><circle cx="6" cy="19" r="2"></circle><circle cx="17" cy="19" r="2"></circle><path d="M6 12h4M8 10v4"></path></svg>`,
  endoscopy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10"/><path d="M12 2a15.3 15.3 0 00-4 10 15.3 15.3 0 004 10"/></svg>`,
  dialysis: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  'digital-xray': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  vaccinations: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-4 .5-5.5 2-1.5-1.5-3.74-2-5.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  tmt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  holter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h6l2-5 3 10 2-5h3"/><rect x="2" y="2" width="20" height="20" rx="4"/></svg>`,
  abpm: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M4 4h16M4 20h16"/><circle cx="12" cy="12" r="8"/></svg>`,
  ultrasonography: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  colonoscopy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
  pharmacy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2h8v4H8z"/><rect x="3" y="6" width="18" height="16" rx="2"/><line x1="12" y1="10" x2="12" y2="18"/><line x1="8" y1="14" x2="16" y2="14"/></svg>`,
  lab: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6l2 9-4 8H9l-3-8 3-9z"/><circle cx="12" cy="16" r="2"/></svg>`
};

// ========== SMART CSV PARSER ==========
function normalizeKey(key) {
  return key.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').toLowerCase();
}
function parseCSV(csvText) {
  // Parses the whole CSV character-by-character so that newlines INSIDE
  // quoted fields (e.g. a multi-paragraph blog body) don't get treated
  // as new rows. Splitting on '\n' first (the old approach) breaks any
  // cell that contains a blank line.
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } // escaped quote
        else { inQuotes = false; }
      } else {
        field += char;
      }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(field); field = ''; }
      else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else { field += char; }
    }
  }
  // push last field/row if file doesn't end with a newline
  if (field.length || row.length) { row.push(field); rows.push(row); }

  const nonEmptyRows = rows.filter(r => r.some(v => v.trim() !== ''));
  if (nonEmptyRows.length < 2) return [];

  const headers = nonEmptyRows[0].map(h => normalizeKey(h.trim()));
  return nonEmptyRows.slice(1).map(values => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (values[i] || '').trim(); });
    // Alias common column-name variants so sheet headers don't have to
    // match the code's field names exactly.
    if (obj.short_summary && !obj.excerpt) obj.excerpt = obj.short_summary;
    if (obj.summary && !obj.excerpt) obj.excerpt = obj.summary;
    return obj;
  });
}
async function fetchSheet(url) {
  if (!url) return [];
  try { const res = await fetch(url); const csv = await res.text(); return parseCSV(csv); }
  catch (e) { console.error('Sheet fetch error:', e); return []; }
}

// ========== DOCTOR CARD VISIBILITY HELPER ==========
function injectDoctorCardStyle() {
  if (document.getElementById('doctor-card-force-visibility')) return;
  const style = document.createElement('style');
  style.id = 'doctor-card-force-visibility';
  style.textContent = `
    .doctor-card, .doctor-card * { color:#1a1a1a!important; opacity:1!important; visibility:visible!important; display:block!important; line-height:1.4!important; font-size:1rem!important; text-indent:0!important; transform:none!important; background:transparent!important; }
    .doctor-card h3 { color:#2d4a2b!important; font-size:1.3rem!important; margin-bottom:0.3rem!important; }
    .doctor-card .doctor-specialty { color:#5a6b4a!important; font-weight:600!important; font-size:1rem!important; }
    .doctor-card .doctor-qual { color:#555!important; font-size:0.85rem!important; line-height:1.5; word-wrap:break-word; white-space:normal; }
    .doctor-card .doctor-card-img-placeholder svg { display:block!important; width:80px!important; height:80px!important; margin:0 auto 1rem!important; }
    .doctor-card .btn { color:#fff!important; background:#2d4a2b!important; border-color:#2d4a2b!important; display:inline-block!important; }
    .doctor-card { background:#fff!important; border:1px solid #e0e0d0!important; min-height:200px!important; }
  `;
  document.head.appendChild(style);
}

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', () => {

  // ===== HAMBURGER MENU =====
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('main-nav');
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
      hamburger.setAttribute('aria-expanded', !expanded);
      mainNav.classList.toggle('open');
    });
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => { mainNav.classList.remove('open'); hamburger.setAttribute('aria-expanded', false); });
    });
  }

  // ===== STICKY HEADER =====
  window.addEventListener('scroll', () => {
    const header = document.getElementById('site-header');
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });

  // ===== SCROLL REVEAL (CSS class) =====
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  // ===== NEWSLETTER (demo) =====
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletter-email');
      if (email && email.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        alert('Thank you for subscribing! (Demo)');
        newsletterForm.reset();
      } else {
        alert('Please enter a valid email address.');
      }
    });
  }

  // ===== DOCTOR LISTING (doctors.html) – fixed dropdown & full quals =====
  const doctorGrid = document.getElementById('doctor-grid');
  if (doctorGrid) {
    const filterDept = document.getElementById('filter-department');
    const searchInput = document.getElementById('search-doctor');
    let doctorsCache = [];

    async function populateDepartmentsFilter() {
      if (!filterDept) return;
      try {
        const departments = await fetchSheet(SHEET_URLS.departments);
        if (departments.length) {
          filterDept.innerHTML = '<option value="">All Departments</option>' +
            departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
        } else {
          filterDept.innerHTML = '<option value="">All Departments</option>';
        }
      } catch (e) {
        filterDept.innerHTML = '<option value="">All Departments</option>';
      }
    }

    async function loadDoctors() {
      doctorGrid.innerHTML = '<div class="skeleton-card">Loading doctors...</div>';
      doctorsCache = await fetchSheet(SHEET_URLS.doctors);
      if (!doctorsCache.length) {
        doctorGrid.innerHTML = '<p style="text-align:center;">No doctors found. Please call 9622552553.</p>';
        return;
      }
      renderDoctors();
      const params = new URLSearchParams(window.location.search);
      const deptParam = params.get('dept');
      if (deptParam && filterDept) filterDept.value = deptParam;
    }

    function renderDoctors() {
      let filtered = doctorsCache;
      const selectedDept = filterDept ? filterDept.value.trim().toLowerCase() : '';
      if (selectedDept) {
        filtered = filtered.filter(d => d.department && d.department.trim().toLowerCase() === selectedDept);
      }
      if (searchInput && searchInput.value.trim()) {
        const q = searchInput.value.toLowerCase();
        filtered = filtered.filter(d => (d.name + d.specialty + d.department).toLowerCase().includes(q));
      }
      if (!filtered.length) {
        doctorGrid.innerHTML = '<p style="text-align:center;">No doctors match your criteria.</p>';
        return;
      }
      injectDoctorCardStyle();
      doctorGrid.innerHTML = filtered.map(d => `
        <div class="doctor-card fade-in" onclick="location.href='doctor-profile.html?id=${d.id}'" style="background:#fff;border:1px solid #e0e0d0;min-height:200px;">
          ${d.photo_url ? `<img src="${d.photo_url}" alt="${d.name}" style="width:80px;height:80px;object-fit:cover;border-radius:50%;margin:0 auto 1rem;display:block;">` : `<div class="doctor-card-img-placeholder" style="display:block;margin:0 auto 1rem;"><svg width="80" height="80" viewBox="0 0 60 60"><circle cx="30" cy="22" r="16" fill="#a4ac86" opacity="0.5"/><ellipse cx="30" cy="55" rx="22" ry="14" fill="#a4ac86" opacity="0.4"/></svg></div>`}
          <h3 style="color:#2d4a2b;font-size:1.3rem;margin-bottom:.3rem;">${d.name||'Unnamed'}</h3>
          <p class="doctor-specialty" style="color:#5a6b4a;font-weight:600;margin-bottom:.2rem;">${d.specialty||''}</p>
          <p class="doctor-qual" style="color:#555;font-size:.85rem;line-height:1.5;word-wrap:break-word;">${d.qualifications || ''}</p>
          <a href="appointment.html?doctor=${encodeURIComponent(d.name)}" class="btn btn-outline btn-sm" onclick="event.stopPropagation();" style="margin-top:.8rem;color:#fff;background:#2d4a2b;">Book Appointment</a>
        </div>
      `).join('');
    }

    populateDepartmentsFilter().then(loadDoctors);
    if (filterDept) filterDept.addEventListener('change', renderDoctors);
    if (searchInput) searchInput.addEventListener('input', renderDoctors);
  }

  // ===== FEATURED DOCTORS (index.html) =====
  const featContainer = document.getElementById('featured-doctor-cards');
  if (featContainer) {
    (async () => {
      featContainer.innerHTML = '<div class="skeleton-card">Loading...</div>';
      const doctors = await fetchSheet(SHEET_URLS.doctors);
      const featured = doctors.slice(0, 6);
      if (!featured.length) { featContainer.innerHTML = '<p class="text-center">Doctor list coming soon.</p>'; return; }
      injectDoctorCardStyle();
      featContainer.innerHTML = featured.map(d => `
        <div class="doctor-card fade-in" onclick="location.href='doctor-profile.html?id=${d.id}'" style="background:#fff;border:1px solid #e0e0d0;min-height:200px;">
          ${d.photo_url ? `<img src="${d.photo_url}" alt="${d.name}" style="width:80px;height:80px;object-fit:cover;border-radius:50%;margin:0 auto 1rem;display:block;">` : `<div class="doctor-card-img-placeholder" style="display:block;margin:0 auto 1rem;"><svg width="80" height="80" viewBox="0 0 60 60"><circle cx="30" cy="22" r="16" fill="#a4ac86" opacity="0.5"/><ellipse cx="30" cy="55" rx="22" ry="14" fill="#a4ac86" opacity="0.4"/></svg></div>`}
          <h3 style="color:#2d4a2b;font-size:1.3rem;margin-bottom:.3rem;">${d.name||'Unnamed'}</h3>
          <p class="doctor-specialty" style="color:#5a6b4a;font-weight:600;margin-bottom:.2rem;">${d.specialty||''}</p>
          <p class="doctor-qual" style="color:#555;font-size:.85rem;line-height:1.5;word-wrap:break-word;">${d.qualifications || ''}</p>
          <a href="appointment.html?doctor=${encodeURIComponent(d.name)}" class="btn btn-outline btn-sm" onclick="event.stopPropagation();" style="margin-top:.8rem;color:#fff;background:#2d4a2b;">Book Appointment</a>
        </div>
      `).join('');
    })();
  }

  // ===== DOCTOR PROFILE =====
  const profileContainer = document.getElementById('doctor-profile-content');
  if (profileContainer) {
    const params = new URLSearchParams(window.location.search);
    const docId = params.get('id');
    if (!docId) { profileContainer.innerHTML = '<p>No doctor selected.</p>'; return; }
    (async () => {
      const doctors = await fetchSheet(SHEET_URLS.doctors);
      const doc = doctors.find(d => d.id === docId);
      if (!doc) { profileContainer.innerHTML = '<p>Doctor not found.</p>'; return; }
      document.title = (doc.name || 'Doctor') + ' | Ibn Sina Hospital';
      profileContainer.innerHTML = `
        <div class="doctor-profile-card">
          ${doc.photo_url ? `<img src="${doc.photo_url}" alt="${doc.name}" style="width:120px;height:120px;object-fit:cover;border-radius:50%;margin:0 auto 1rem;display:block;">` : ''}
          <h1>${doc.name || 'Unnamed'}</h1>
          <p><strong>Specialty:</strong> ${doc.specialty || 'N/A'}</p>
          <p><strong>Department:</strong> ${doc.department || 'N/A'}</p>
          <p><strong>Qualifications:</strong> ${doc.qualifications || 'N/A'}</p>
          <div class="doctor-bio"><strong>About:</strong><br>${doc.about || 'No biography available.'}</div>
          <a href="appointment.html?doctor=${encodeURIComponent(doc.name)}" class="btn btn-primary">Book Appointment with ${doc.name}</a>
          <a href="doctors.html" class="btn btn-outline" style="margin-top:1rem;">← Back to All Doctors</a>
        </div>
      `;
    })();
  }

  // ===== STATIC SERVICES =====
  const servicesGrid = document.getElementById('services-grid');
  if (servicesGrid) {
    servicesGrid.innerHTML = STATIC_SERVICES.map(s => {
      const iconHtml = SERVICE_ICONS[s.icon] ? `<div class="service-icon">${SERVICE_ICONS[s.icon]}</div>` : '';
      return `
        <div class="service-card fade-in">
          ${iconHtml}
          <h3>${s.title}</h3>
          <p>${s.description}</p>
        </div>
      `;
    }).join('');
  }

  // ===== DYNAMIC DEPARTMENTS (homepage: 6 cards + hover & touch effect) =====
  const deptGrid = document.getElementById('departments-grid');
  if (deptGrid) {
    (async () => {
      deptGrid.innerHTML = '<div class="skeleton-card">Loading departments...</div>';
      const departments = await fetchSheet(SHEET_URLS.departments);
      if (!departments.length) {
        deptGrid.innerHTML = '<p class="text-center">Departments list unavailable.</p>';
        return;
      }

      const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
      const displayDepts = isHomePage ? departments.slice(0, 6) : departments;

      let html = '';
      let styleRules = '';

      displayDepts.forEach((d, index) => {
        const link = d.landing_page_url || `departments/${d.slug}.html`;
        const iconHtml = d.icon_url ? `<div class="service-icon">${d.icon_url}</div>` : '';
        const bgImage = d.bg_image_url ? d.bg_image_url.trim() : '';
        const cardId = `dept-${d.slug || index}`;

        html += `
          <a href="${link}" class="service-card department-card" id="${cardId}" style="text-decoration:none;">
            ${iconHtml}
            <h3>${d.name}</h3>
          </a>
        `;

        if (bgImage) {
          styleRules += `
            #${cardId}:hover, #${cardId}.touch-hover {
              background-image: url('${bgImage}') !important;
              background-size: cover !important;
              background-position: center !important;
              background-color: transparent !important;
              color: #ffffff !important;
            }
            #${cardId}:hover h3, #${cardId}.touch-hover h3 {
              color: #ffffff !important;
              text-shadow: 0 1px 3px rgba(0,0,0,0.6);
            }
            #${cardId}:hover .service-icon svg, #${cardId}.touch-hover .service-icon svg {
              stroke: #ffffff !important;
            }
            #${cardId}:hover::before, #${cardId}.touch-hover::before {
              display: none !important;
            }
          `;
        }
      });

      deptGrid.innerHTML = html;

      if (styleRules) {
        const styleTag = document.createElement('style');
        styleTag.id = 'department-hover-styles';
        styleTag.textContent = styleRules;
        document.head.appendChild(styleTag);
      }

      // Touch support for mobile
      const cards = deptGrid.querySelectorAll('.department-card');
      cards.forEach(card => {
        const hasBg = styleRules.includes(card.id);
        if (hasBg) {
          card.addEventListener('touchstart', () => card.classList.add('touch-hover'), { passive: true });
          card.addEventListener('touchend', () => card.classList.remove('touch-hover'), { passive: true });
          card.addEventListener('touchcancel', () => card.classList.remove('touch-hover'), { passive: true });
        }
      });
    })();
  }

  // ===== LATEST UPDATES CAROUSEL (with fallback) =====
  const updatesContainer = document.getElementById('updates-carousel');
  if (updatesContainer) {
    (async () => {
      updatesContainer.innerHTML = '<div class="skeleton-card">Loading updates...</div>';
      let updates = await fetchSheet(SHEET_URLS.updates);
      if (!updates.length) {
        updates = [
          { title: 'New Cardiology Wing Opened', description: 'We have expanded our cardiac care with a new wing.', date: '2026-08-01', link: 'https://i.ibb.co/9kYKZsWB/181bf27c6da3.webp' },
          { title: '24/7 Pharmacy Now Available', description: 'Our pharmacy remains open all day, every day.', date: '2026-07-15' },
          { title: 'Dialysis Unit Upgraded', description: 'Advanced dialysis machines installed for better care.', date: '2026-06-30' }
        ];
      }

      updates.sort((a, b) => new Date(b.date) - new Date(a.date));
      let currentIndex = 0;
      let autoSlideInterval;

      function isVideoURL(url) { return url && (url.includes('youtube.com/embed') || url.includes('vimeo.com') || url.match(/\.mp4($|\?)/)); }
      function isImageURL(url) { return url && /\.(jpeg|jpg|gif|png|webp|svg|bmp|ico)(\?.*)?$/i.test(url); }

      const slidesHTML = updates.map((u, i) => {
        const media = u.media_url || u.image_url || u.link;
        let titleContent = u.title;
        let mediaArea = '';
        if (media && isVideoURL(media)) mediaArea = `<div class="update-media"><iframe src="${media}" frameborder="0" allowfullscreen style="width:100%;height:100%;border:none;"></iframe></div>`;
        else if (media && isImageURL(media)) mediaArea = `<div class="update-media" style="background-image:url('${media}');"></div>`;
        else mediaArea = `<div class="update-media update-media-empty"></div>`;
        if (media && !isVideoURL(media) && !isImageURL(media)) titleContent = `<a href="${media}" target="_blank">${u.title}</a>`;
        return `<div class="update-slide" data-index="${i}">${mediaArea}<div class="update-caption"><h4>${titleContent}</h4><p>${u.description}</p><small>${u.date}</small></div></div>`;
      }).join('');

      updatesContainer.innerHTML = `
        <div class="carousel-wrapper">
          <div class="carousel-slides" id="carousel-slides">${slidesHTML}</div>
          <button class="carousel-prev" id="carousel-prev" aria-label="Previous">❮</button>
          <button class="carousel-next" id="carousel-next" aria-label="Next">❯</button>
        </div>
        <div class="carousel-dots" id="carousel-dots">${updates.map((_, i) => `<span class="dot" data-index="${i}"></span>`).join('')}</div>
      `;

      const slidesEl = document.getElementById('carousel-slides');
      const dots = document.querySelectorAll('#carousel-dots .dot');
      const prevBtn = document.getElementById('carousel-prev');
      const nextBtn = document.getElementById('carousel-next');
      function goToSlide(index) {
        if (index < 0) index = updates.length - 1;
        if (index >= updates.length) index = 0;
        currentIndex = index;
        slidesEl.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach(d => d.classList.remove('active'));
        if (dots[currentIndex]) dots[currentIndex].classList.add('active');
      }
      prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
      nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
      dots.forEach(dot => dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index))));
      autoSlideInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);
      updatesContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
      updatesContainer.addEventListener('mouseleave', () => autoSlideInterval = setInterval(() => goToSlide(currentIndex + 1), 5000));
      goToSlide(0);
    })();
  }

  // ===== BLOG PREVIEW (with fallback) =====
  const blogPreviewGrid = document.getElementById('blog-preview-grid');
  if (blogPreviewGrid) {
    (async () => {
      blogPreviewGrid.innerHTML = '<div class="skeleton-card">Loading posts...</div>';
      const posts = await fetchSheet(SHEET_URLS.blog);
      const published = posts.filter(p => p.is_published === 'TRUE').slice(0, 3);
      if (!published.length) {
        const dummy = [
          { title: 'Tips for Healthy Heart', excerpt: 'Regular TMT and Holter monitoring can detect early cardiac issues.', date: '2026-07-20' },
          { title: 'Managing Blood Pressure', excerpt: 'ABPM provides accurate 24‑hour blood pressure readings for better control.', date: '2026-07-10' },
          { title: 'Why Choose Dialysis in Budgam?', excerpt: 'Our dialysis unit provides life‑sustaining care close to home.', date: '2026-06-25' }
        ];
        blogPreviewGrid.innerHTML = dummy.map(p => `
          <article class="blog-preview-card fade-in">
            <h3><a href="#">${p.title}</a></h3>
            <time>${p.date}</time>
            <p>${p.excerpt}</p>
          </article>
        `).join('');
        return;
      }
      blogPreviewGrid.innerHTML = published.map(p => `
        <article class="blog-preview-card fade-in">
          ${p.cover_image_url ? `<img src="${p.cover_image_url}" alt="${p.title}" style="width:100%;height:180px;object-fit:cover;border-radius:var(--radius);margin-bottom:0.8rem;">` : ''}
          <h3><a href="blog-post.html?slug=${p.slug}">${p.title}</a></h3>
          <time>${p.published_at}</time>
          <p>${p.excerpt || ''}</p>
        </article>
      `).join('');
    })();
  }

  // ===== GALLERY (new masonry + video) =====
  const photoMasonry = document.getElementById('photo-masonry');
  const videoGrid = document.getElementById('video-grid');
  if (photoMasonry || videoGrid) {
    (async () => {
      const items = await fetchSheet(SHEET_URLS.gallery);
      const photos = items.filter(i => i.category === 'photo');
      const videos = items.filter(i => i.category === 'video');

      if (photoMasonry) {
        if (photos.length) {
          photoMasonry.innerHTML = photos.map(i => `
            <div class="photo-item">
              <img src="${i.image_url}" alt="${i.alt_text || i.title}" loading="lazy">
              <div class="photo-caption">${i.title}</div>
            </div>
          `).join('');
          initLightbox();
        } else {
          photoMasonry.innerHTML = '<p>No photos available.</p>';
        }
      }

      if (videoGrid) {
        if (videos.length) {
          videoGrid.innerHTML = videos.map(v => `
            <div class="video-item">
              <iframe src="${v.image_url}" title="${v.title}" allowfullscreen></iframe>
              <div class="video-title">${v.title}</div>
            </div>
          `).join('');
        } else {
          videoGrid.innerHTML = '<p>No videos available.</p>';
        }
      }
    })();
  }

  function initLightbox() {
    const photos = document.querySelectorAll('.photo-item img');
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !photos.length) return;
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const photoArray = Array.from(photos);
    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      const img = photoArray[currentIndex];
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = img.alt || '';
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
    function showNext() { currentIndex = (currentIndex + 1) % photoArray.length; openLightbox(currentIndex); }
    function showPrev() { currentIndex = (currentIndex - 1 + photoArray.length) % photoArray.length; openLightbox(currentIndex); }

    photos.forEach((img, idx) => img.addEventListener('click', () => openLightbox(idx)));
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);
    window.addEventListener('keydown', (e) => {
      if (lightbox.style.display === 'flex') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
      }
    });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  }

  // ===== BLOG LISTING (blog.html) =====
  const blogGrid = document.getElementById('blog-grid');
  if (blogGrid) {
    (async () => {
      blogGrid.innerHTML = '<div class="skeleton-card">Loading posts...</div>';
      const posts = await fetchSheet(SHEET_URLS.blog);
      const published = posts.filter(p => p.is_published === 'TRUE');
      if (!published.length) { blogGrid.innerHTML = '<p class="text-center">No blog posts yet.</p>'; return; }
      blogGrid.innerHTML = published.map(p => `
        <article class="blog-preview-card fade-in">
          ${p.cover_image_url ? `<img src="${p.cover_image_url}" alt="${p.title}" style="width:100%; height:180px; object-fit:cover; border-radius:var(--radius); margin-bottom:0.8rem;">` : ''}
          <h3><a href="blog-post.html?slug=${p.slug}">${p.title}</a></h3>
          <time>${p.published_at}</time>
          <p>${p.excerpt || ''}</p>
          <a href="blog-post.html?slug=${p.slug}" class="read-more">Read More →</a>
        </article>
      `).join('');
    })();
  }

  // ===== SINGLE BLOG POST (blog-post.html) =====
  const postContainer = document.getElementById('blog-post-content');
  if (postContainer) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) { postContainer.innerHTML = '<p>No slug provided.</p>'; return; }
    (async () => {
      const posts = await fetchSheet(SHEET_URLS.blog);
      const post = posts.find(p => p.slug === slug && p.is_published === 'TRUE');
      if (!post) { postContainer.innerHTML = '<p>Post not found.</p>'; return; }
      document.title = post.title + ' | Ibn Sina Hospital';
      postContainer.innerHTML = `
        ${post.cover_image_url ? `<img src="${post.cover_image_url}" alt="${post.title}" style="width:100%; max-height:400px; object-fit:cover; border-radius:var(--radius); margin-bottom:1.5rem;">` : ''}
        <h1>${post.title}</h1>
        <time>${post.published_at}</time>
        <div class="blog-body">${post.body}</div>
      `;
    })();
  }

  // ===== CAREERS LISTING =====
  const positionsList = document.getElementById('positions-list');
  if (positionsList) {
    (async () => {
      const positions = await fetchSheet(SHEET_URLS.careers);
      const open = positions.filter(p => p.is_open === 'TRUE');
      if (!open.length) { positionsList.innerHTML = '<p>No open positions at the moment.</p>'; return; }
      positionsList.innerHTML = open.map(pos => `
        <div class="position-card">
          <h3>${pos.title}</h3>
          <p>${pos.department ? 'Dept: ' + pos.department : ''} | ${pos.employment_type || ''}</p>
          <p>${pos.description ? pos.description.substring(0,150) + '...' : ''}</p>
          ${pos.closes_at ? `<small>Closes: ${pos.closes_at}</small>` : ''}
        </div>
      `).join('');
    })();
  }

  // ===== CONTACT FORM (Gmail compose) =====
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const phone = document.getElementById('contact-phone')?.value.trim() || '';
      const subject = document.getElementById('contact-subject')?.value.trim() || '';
      const message = document.getElementById('contact-message')?.value.trim() || '';
      const body = `Name: ${name}%0D%0APhone: ${phone}%0D%0AEmail: ${email}%0D%0A%0D%0A${message}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=ibnsinatechofficial@gmail.com&su=${encodeURIComponent(subject || 'Contact Form')}&body=${body}`;
      window.open(gmailUrl, '_blank');
    });
  }

  // ===== CAREERS APPLICATION (Gmail compose) =====
  const careersForm = document.getElementById('careers-form');
  if (careersForm) {
    const posSelect = document.getElementById('applicant-position');
    if (posSelect) {
      fetchSheet(SHEET_URLS.careers).then(positions => {
        const open = positions.filter(p => p.is_open === 'TRUE');
        posSelect.innerHTML = '<option value="">-- Select Position --</option>' +
          open.map(p => `<option value="${p.title}">${p.title}</option>`).join('');
      });
    }
    careersForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('applicant-name').value.trim();
      const phone = document.getElementById('applicant-phone').value.trim();
      const email = document.getElementById('applicant-email').value.trim();
      const position = posSelect?.value || '';
      const cover = document.getElementById('cover-message')?.value.trim() || '';
      const body = `Position Applied: ${position}%0D%0AName: ${name}%0D%0APhone: ${phone}%0D%0AEmail: ${email}%0D%0A%0D%0ACover Message:%0D%0A${cover}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=ibnsinatechofficial@gmail.com&su=Job Application: ${encodeURIComponent(position || 'Open Position')}&body=${body}`;
      window.open(gmailUrl, '_blank');
    });
  }

  // ===== APPOINTMENT FORM (iframe + doctor dropdown) =====
  const appointmentForm = document.getElementById('appointment-form');
  if (appointmentForm) {
    const deptSelect = document.getElementById('department');
    const docSelect = document.getElementById('preferred-doctor');
    const successDiv = document.getElementById('appointment-success');
    const departments = ['Cardiology','CTVS','Dental','Dermatology','Endocrinology','ENT','Gastroenterology','General Surgery','Gynaecology','Neurosurgery','Neurology','Ophthalmology','Orthopaedics','Pediatrics','Physiotherapy','Plastic Surgery','Psychiatry','Pulmonology','Rheumatology','Urology'];
    if (deptSelect) deptSelect.innerHTML = '<option value="">-- Select --</option>' + departments.map(d => `<option value="${d}">${d}</option>`).join('');
    async function populateDoctorsDropdown() {
      if (!docSelect) return;
      try {
        const doctors = await fetchSheet(SHEET_URLS.doctors);
        docSelect.innerHTML = '<option value="">-- Any Doctor --</option>' + doctors.map(d => `<option value="${d.name}">${d.name} (${d.specialty})</option>`).join('');
        const urlParams = new URLSearchParams(window.location.search);
        const preselected = urlParams.get('doctor');
        if (preselected) {
          const match = Array.from(docSelect.options).find(opt => opt.value === preselected);
          if (match) docSelect.value = preselected;
        }
      } catch (err) { docSelect.innerHTML = '<option value="">-- Any Doctor --</option>'; }
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

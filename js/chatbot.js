// =============================================
// IBN SINA BOT – Complete Chatbot (Improved)
// =============================================
(function () {
  // ---- CONFIGURATION ----
  const SHEET_URLS = {
    departments: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSY7cmsIsfCzFSfe6Gf6wG-XWffYscBhXHqnFqv0RvwuqbG7kNnPG7eSmSaR_E-ztlY8qLkHZ2yuL-t/pub?output=csv',
    doctors: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_H8Rgr6VOjrap91SR_3nbBQLVf7QOQOHqZSs-pT6SfoNpyHjpj-QD0nNtcHDr5ip439naZ0sTr62Y/pub?output=csv'
  };
  const APPOINTMENT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOmEFb0cu0rQ3IzRKrzP9wLNgjXZLUuvpZJWp2xEcZSvuknyppjiavPWST31QNEWoS/exec';
  const FETCH_TIMEOUT_MS = 8000;
  const BOT_REPLY_DELAY_MS = 400; // small delay + typing indicator feels more natural

  // ---- LANGUAGE PACKS ----
  const LANG = {
    en: {
      name: 'English',
      welcome: 'Hello! I am Ibn Sina Bot. How can I help you?',
      prompt: 'Ask me about OPD timings, location, services, departments, doctors, or book an appointment.',
      opd: 'Our OPD is open 24/7, every day of the year — along with Emergency, Pharmacy, and Laboratory services.',
      visitingHours: 'There\'s no fixed visiting-hours restriction — OPD, Emergency, Pharmacy, and Lab are all open 24/7. For ward-specific visiting rules, please check with reception: 9622552553.',
      pricing: 'Pricing depends on the specific test, procedure, or consultation. Please call reception at 9622552553 / 9419023501 for exact rates.',
      insurance: 'For insurance and cashless treatment queries, please call the administration at 9622392553 / 9149606115 so they can confirm what\'s accepted.',
      admission: 'For admission or ward-related queries, please call reception at 9622552553 — they can guide you through the process and bed availability.',
      parking: 'For parking availability, please check with the reception desk at 9622552553 when you arrive.',
      location: 'We are near Railway Station, Ompora Railway Station Road, Ompora, Budgam, J&K 191111.',
      emergency: 'For emergencies, call 9622552553 or 9419023501.',
      services: 'We offer Laboratory diagnostics, Pharmacy, Physiotherapy, Sigmoidoscopy, Dialysis, and Ambulance/Emergency services.',
      departments: 'Our departments:',
      doctors: 'Our doctors:',
      loadingData: 'One moment, fetching that for you...',
      dataUnavailable: 'That information isn\'t available right now. Please call 9622552553.',
      appointmentIntro: 'Sure, let\'s book an appointment. Type "cancel" anytime to stop.',
      appointmentName: 'Please type your full name.',
      appointmentPhone: 'Thanks! Now type your 10-digit phone number.',
      appointmentPhoneInvalid: 'That doesn\'t look like a valid phone number. Please enter 7–15 digits (numbers only).',
      appointmentDept: 'Which department would you like to visit? (Type the name, or type "skip" if you\'re not sure)',
      appointmentTime: 'What\'s your preferred date/time for the visit? (e.g. "Tomorrow 11 AM", or type "skip" if flexible)',
      appointmentSubmitting: 'Submitting your request...',
      appointmentDone: 'Appointment request submitted! We will call you shortly. If you don\'t hear from us soon, please call 9622552553.',
      appointmentCancelled: 'No problem, appointment request cancelled.',
      fallback: 'Sorry, I didn\'t understand. For urgent help, call 9622552553.',
      thanks: 'You\'re welcome! Is there anything else I can help with?',
      bye: 'Take care! Call 9622552553 anytime you need us.',
      faq_pharmacy: 'Yes. Ibn Sina Pharmacy operates 365 days a year, 24 hours a day — the only pharmacy of its kind in Budgam that never closes.',
      faq_lab: 'Yes, the lab provides round-the-clock service for inpatients and outpatients, with fast, accurate turnaround times.',
      faq_dialysis: 'Yes, dialysis services are available for patients with kidney failure. Please call to check availability and scheduling.',
      faq_ambulance: 'Yes, the hospital runs an ambulance service as part of its Emergency Medicine department.',
      faq_physiotherapy: 'Yes. Physiotherapy covers injury prevention, rehabilitation, and management of acute and chronic conditions.',
      faq_contact: 'Reception: 9622552553 / 9419023501. Administration: 9622392553 / 9149606115 / 7006272634. Email: weibnsina@gmail.com.',
      faq_sigmoidoscopy: 'Yes, the hospital performs sigmoidoscopy — a procedure using a flexible tube with a light to examine the sigmoid colon.',
      faq_unique: 'It combines a 24/7 in-house pharmacy, round-the-clock lab services, and multiple specialities (physiotherapy, dialysis, ambulance, diagnostics) under one roof.',
      quickReplies: ['OPD Timings', 'Services', 'Book Appointment', 'Contact Us']
    },
    hi: {
      name: 'Hinglish',
      welcome: 'Namaste! Main Ibn Sina Bot hoon. Aapki kya madad karoon?',
      prompt: 'Aap OPD timings, location, services, departments, doctors, ya appointment book karne ke baare mein pooch sakte hain.',
      opd: 'Hamara OPD 24/7 khula rehta hai, saal ke har din — Emergency, Pharmacy aur Laboratory ke saath.',
      visitingHours: 'Koi fixed visiting-hours restriction nahi hai — OPD, Emergency, Pharmacy aur Lab sab 24/7 khule hain. Ward-specific visiting rules ke liye reception se poochein: 9622552553.',
      pricing: 'Pricing test, procedure ya consultation par depend karti hai. Exact rates ke liye reception ko call karein: 9622552553 / 9419023501.',
      insurance: 'Insurance aur cashless treatment ke sawalon ke liye administration ko call karein: 9622392553 / 9149606115, taaki woh confirm kar sakein kya accepted hai.',
      admission: 'Admission ya ward se judi jaankari ke liye reception ko call karein: 9622552553 — woh process aur bed availability mein guide karenge.',
      parking: 'Parking availability ke liye jab aap pahunchein toh reception desk se poochein: 9622552553.',
      location: 'Hum Railway Station ke paas, Ompora Railway Station Road, Ompora, Budgam, J&K 191111 mein hain.',
      emergency: 'Emergency ke liye call karein: 9622552553 ya 9419023501.',
      services: 'Hum Laboratory diagnostics, Pharmacy, Physiotherapy, Sigmoidoscopy, Dialysis aur Ambulance/Emergency services provide karte hain.',
      departments: 'Humare departments:',
      doctors: 'Humare doctors:',
      loadingData: 'Ek minute, dhoondh raha hoon...',
      dataUnavailable: 'Yeh jaankari abhi uplabdh nahi hai. Kripya 9622552553 par call karein.',
      appointmentIntro: 'Theek hai, appointment book karte hain. Kabhi bhi "cancel" likh kar rok sakte hain.',
      appointmentName: 'Apna poora naam likhein.',
      appointmentPhone: 'Shukriya! Ab apna 10-digit phone number likhein.',
      appointmentPhoneInvalid: 'Yeh number sahi nahi lag raha. Kripya 7–15 digits (sirf numbers) daalein.',
      appointmentDept: 'Kis department mein jaana hai? (Naam likhein, ya "skip" likhein agar pata nahi)',
      appointmentTime: 'Aapka preferred date/time kya hai? (jaise "Kal 11 AM", ya "skip" likhein agar flexible hain)',
      appointmentSubmitting: 'Aapki request submit ho rahi hai...',
      appointmentDone: 'Appointment request submit ho gayi! Hum jald call karenge. Agar call na aaye toh 9622552553 par khud call karein.',
      appointmentCancelled: 'Koi baat nahi, appointment request cancel kar di gayi.',
      fallback: 'Maaf kijiye, samajh nahi aaya. Turant madad ke liye 9622552553 par call karein.',
      thanks: 'Aapka swagat hai! Aur kuch madad chahiye?',
      bye: 'Apna khayal rakhein! Zaroorat par 9622552553 par call karein.',
      faq_pharmacy: 'Haan. Ibn Sina Pharmacy 365 din, 24 ghante khuli rehti hai — Budgam ki ekmatra pharmacy jo kabhi band nahi hoti.',
      faq_lab: 'Haan, lab inpatients aur outpatients ke liye round-the-clock seva deta hai, fast aur accurate results ke saath.',
      faq_dialysis: 'Haan, dialysis seva kidney failure ke patients ke liye uplabdh hai. Kripya availability ke liye call karein.',
      faq_ambulance: 'Haan, hospital Emergency Medicine department ke tahat ambulance seva chalaata hai.',
      faq_physiotherapy: 'Haan. Physiotherapy injury prevention, rehabilitation, aur acute/chronic conditions ke management ko cover karti hai.',
      faq_contact: 'Reception: 9622552553 / 9419023501. Administration: 9622392553 / 9149606115 / 7006272634. Email: weibnsina@gmail.com.',
      faq_sigmoidoscopy: 'Haan, hospital sigmoidoscopy karta hai — ek flexible tube jisme light hoti hai, sigmoid colon ki jaanch ke liye.',
      faq_unique: 'Yeh 24/7 in-house pharmacy, round-the-clock lab, aur multiple specialities (physiotherapy, dialysis, ambulance, diagnostics) ko ek hi chhat ke neeche laata hai.',
      quickReplies: ['OPD Timings', 'Services', 'Appointment Book Karein', 'Contact']
    }
  };

  let currentLang = 'en';
  let appointmentStep = null;
  let appointmentData = { name: '', phone: '', department: '', preferredTime: '' };
  let cachedDepartments = [];
  let cachedDoctors = [];
  let departmentsLoading = false;
  let doctorsLoading = false;
  let isSubmittingAppointment = false;

  // ---- INJECT STYLES ----
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .ibn-bot-fab {
        position: fixed; bottom: 20px; right: 20px; z-index: 9999;
        background: #2d4a2b; color: #fff; border: none; border-radius: 50%;
        width: 60px; height: 60px; cursor: pointer; font-size: 28px;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      }
      .ibn-bot-fab:focus-visible, .ibn-bot-close:focus-visible, .ibn-bot-send:focus-visible,
      .ibn-bot-lang button:focus-visible, .ibn-bot-quick button:focus-visible {
        outline: 2px solid #8fd19e; outline-offset: 2px;
      }
      .ibn-bot-window {
        position: fixed; bottom: 90px; right: 20px; z-index: 9999;
        width: 350px; max-width: 90vw; height: 500px; max-height: 70vh;
        background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        display: none; flex-direction: column; overflow: hidden;
        font-family: 'Inter', sans-serif;
      }
      .ibn-bot-header {
        background: #2d4a2b; color: #fff; padding: 15px;
        display: flex; align-items: center; justify-content: space-between;
      }
      .ibn-bot-header h3 { margin: 0; font-size: 1rem; }
      .ibn-bot-close { background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; line-height: 1; }
      .ibn-bot-messages { flex: 1; padding: 15px; overflow-y: auto; background: #f9f9f4; }
      .ibn-bot-msg {
        margin-bottom: 10px; max-width: 80%; padding: 10px 14px;
        border-radius: 15px; line-height: 1.4; font-size: 0.95rem;
        white-space: pre-line; word-wrap: break-word;
      }
      .ibn-bot-msg.bot { background: #e0e0d0; color: #1a1a1a; border-bottom-left-radius: 5px; }
      .ibn-bot-msg.user { background: #2d4a2b; color: #fff; margin-left: auto; border-bottom-right-radius: 5px; }
      .ibn-bot-msg.typing { display: flex; gap: 4px; align-items: center; width: fit-content; }
      .ibn-bot-msg.typing span {
        width: 6px; height: 6px; border-radius: 50%; background: #777;
        animation: ibn-bot-blink 1.2s infinite ease-in-out;
      }
      .ibn-bot-msg.typing span:nth-child(2) { animation-delay: 0.2s; }
      .ibn-bot-msg.typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes ibn-bot-blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
      .ibn-bot-quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 15px 10px; background: #f9f9f4; }
      .ibn-bot-quick button {
        background: #fff; border: 1px solid #2d4a2b; color: #2d4a2b;
        border-radius: 15px; padding: 5px 12px; font-size: 0.8rem; cursor: pointer;
      }
      .ibn-bot-quick button:hover { background: #2d4a2b; color: #fff; }
      .ibn-bot-input-area { display: flex; padding: 10px; border-top: 1px solid #ddd; background: #fff; }
      .ibn-bot-input { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 20px; font-family: inherit; font-size: 0.9rem; }
      .ibn-bot-input:disabled { background: #f1f1f1; }
      .ibn-bot-send { background: #2d4a2b; color: #fff; border: none; border-radius: 20px; padding: 0 20px; margin-left: 8px; cursor: pointer; }
      .ibn-bot-send:disabled { opacity: 0.6; cursor: not-allowed; }
      .ibn-bot-lang { display: flex; gap: 5px; padding: 8px 15px; background: #f1f1f1; }
      .ibn-bot-lang button { background: #fff; border: 1px solid #ccc; border-radius: 15px; padding: 3px 10px; cursor: pointer; font-size: 0.8rem; }
      .ibn-bot-lang button.active { background: #2d4a2b; color: #fff; }
      @media (max-width: 400px) {
        .ibn-bot-window { right: 5vw; bottom: 80px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ---- INJECT HTML ----
  function injectHTML() {
    const div = document.createElement('div');
    div.innerHTML = `
      <button class="ibn-bot-fab" id="ibn-bot-fab" aria-label="Open chat with Ibn Sina Bot" aria-haspopup="dialog">💬</button>
      <div class="ibn-bot-window" id="ibn-bot-window" role="dialog" aria-modal="false" aria-label="Ibn Sina Bot chat window">
        <div class="ibn-bot-header">
          <h3>Ibn Sina Bot</h3>
          <button class="ibn-bot-close" id="ibn-bot-close" aria-label="Close chat">×</button>
        </div>
        <div class="ibn-bot-lang" role="group" aria-label="Choose language">
          <button data-lang="en" class="active" aria-pressed="true">English</button>
          <button data-lang="hi" aria-pressed="false">Hinglish</button>
        </div>
        <div class="ibn-bot-messages" id="ibn-bot-messages" role="log" aria-live="polite"></div>
        <div class="ibn-bot-quick" id="ibn-bot-quick"></div>
        <div class="ibn-bot-input-area">
          <input type="text" class="ibn-bot-input" id="ibn-bot-input" placeholder="Type here..." aria-label="Type your message">
          <button class="ibn-bot-send" id="ibn-bot-send">Send</button>
        </div>
      </div>
    `;
    document.body.appendChild(div);
  }

  // ---- ADD MESSAGE ----
  function addMessage(text, sender) {
    const messages = document.getElementById('ibn-bot-messages');
    if (!messages) return;
    const msg = document.createElement('div');
    msg.className = `ibn-bot-msg ${sender}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  // ---- TYPING INDICATOR ----
  function showTyping() {
    const messages = document.getElementById('ibn-bot-messages');
    if (!messages) return null;
    const typing = document.createElement('div');
    typing.className = 'ibn-bot-msg bot typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  function addBotMessageWithDelay(text) {
    const typing = showTyping();
    setTimeout(() => {
      if (typing) typing.remove();
      addMessage(text, 'bot');
    }, BOT_REPLY_DELAY_MS);
  }

  // ---- QUICK REPLIES ----
  function renderQuickReplies() {
    const container = document.getElementById('ibn-bot-quick');
    if (!container) return;
    container.innerHTML = '';
    LANG[currentLang].quickReplies.forEach(label => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.addEventListener('click', () => handleUserText(label));
      container.appendChild(btn);
    });
  }

  // ---- FETCH WITH TIMEOUT ----
  async function fetchWithTimeout(url, ms) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(url, { signal: controller.signal });
      return res;
    } finally {
      clearTimeout(id);
    }
  }

  // ---- FETCH CSV ----
  async function fetchCSV(url) {
    try {
      const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
      const csv = await res.text();
      const lines = csv.trim().split('\n');
      if (lines.length < 2) return [];
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1').replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').toLowerCase());
      return lines.slice(1).map(line => {
        const values = [];
        let current = '', inQuotes = false;
        for (const char of line) {
          if (char === '"') { inQuotes = !inQuotes; continue; }
          if (char === ',' && !inQuotes) { values.push(current.trim().replace(/^"(.*)"$/, '$1')); current = ''; }
          else { current += char; }
        }
        values.push(current.trim().replace(/^"(.*)"$/, '$1'));
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] || '');
        return obj;
      });
    } catch (e) {
      return [];
    }
  }

  // ---- PRELOAD DATA ----
  async function preloadData() {
    departmentsLoading = true;
    doctorsLoading = true;
    try {
      const [depts, docs] = await Promise.all([fetchCSV(SHEET_URLS.departments), fetchCSV(SHEET_URLS.doctors)]);
      cachedDepartments = depts;
      cachedDoctors = docs;
    } catch (e) {
      // leave caches empty; on-demand fetch will retry
    } finally {
      departmentsLoading = false;
      doctorsLoading = false;
    }
  }

  // ---- VALIDATION ----
  function isValidPhone(text) {
    const digitsOnly = text.replace(/[\s\-()+]/g, '');
    return /^\d{7,15}$/.test(digitsOnly);
  }

  // ---- SUBMIT APPOINTMENT ----
  function submitAppointment() {
    if (isSubmittingAppointment) return;
    isSubmittingAppointment = true;
    setInputEnabled(false);
    addMessage(LANG[currentLang].appointmentSubmitting, 'bot');

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = APPOINTMENT_SCRIPT_URL;
    form.target = 'ibn-bot-hidden-iframe';
    form.style.display = 'none';

    const fields = {
      patient_name: appointmentData.name,
      phone: appointmentData.phone,
      department: appointmentData.department || 'Not specified',
      preferred_date: appointmentData.preferredTime || 'Not specified',
      reason: 'Chatbot appointment'
    };
    for (const key in fields) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    }

    let iframe = document.getElementById('ibn-bot-hidden-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'ibn-bot-hidden-iframe';
      iframe.name = 'ibn-bot-hidden-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    document.body.appendChild(form);
    form.submit();
    form.remove();

    // The hidden-iframe technique can't confirm server-side success, so we
    // optimistically confirm after a short delay and always give the phone
    // number as a fallback in case the request didn't go through.
    setTimeout(() => {
      addBotMessageWithDelay(LANG[currentLang].appointmentDone);
      appointmentStep = null;
      appointmentData = { name: '', phone: '', department: '', preferredTime: '' };
      isSubmittingAppointment = false;
      setInputEnabled(true);
    }, 600);
  }

  function setInputEnabled(enabled) {
    const input = document.getElementById('ibn-bot-input');
    const send = document.getElementById('ibn-bot-send');
    if (input) input.disabled = !enabled;
    if (send) send.disabled = !enabled;
    if (enabled && input) input.focus();
  }

  // ---- PROCESS MESSAGE ----
  async function processMessage(text) {
    const L = LANG[currentLang];
    const lower = text.toLowerCase().trim();

    // Cancel appointment flow at any step
    if (appointmentStep && lower === 'cancel') {
      appointmentStep = null;
      appointmentData = { name: '', phone: '', department: '', preferredTime: '' };
      addBotMessageWithDelay(L.appointmentCancelled);
      return;
    }

    // Appointment flow
    if (appointmentStep === 'name') {
      appointmentData.name = text.trim();
      appointmentStep = 'phone';
      addBotMessageWithDelay(L.appointmentPhone);
      return;
    }
    if (appointmentStep === 'phone') {
      if (!isValidPhone(text)) {
        addBotMessageWithDelay(L.appointmentPhoneInvalid);
        return;
      }
      appointmentData.phone = text.trim();
      appointmentStep = 'dept';
      addBotMessageWithDelay(L.appointmentDept);
      return;
    }
    if (appointmentStep === 'dept') {
      appointmentData.department = lower === 'skip' ? '' : text.trim();
      appointmentStep = 'time';
      addBotMessageWithDelay(L.appointmentTime);
      return;
    }
    if (appointmentStep === 'time') {
      appointmentData.preferredTime = lower === 'skip' ? '' : text.trim();
      appointmentStep = null;
      submitAppointment();
      return;
    }

    // FAQ matching
    if (lower.includes('pharmacy') || lower.includes('medicine') || lower.includes('medical store')) {
      addBotMessageWithDelay(L.faq_pharmacy);
    } else if (lower.includes('lab') || lower.includes('laboratory') || lower.includes('diagnostic') || lower.includes('test')) {
      addBotMessageWithDelay(L.faq_lab);
    } else if (lower.includes('dialysis') || lower.includes('kidney')) {
      addBotMessageWithDelay(L.faq_dialysis);
    } else if (lower.includes('ambulance') || lower.includes('emergency')) {
      addBotMessageWithDelay(L.faq_ambulance);
      addBotMessageWithDelay(L.emergency);
    } else if (lower.includes('physiotherapy') || lower.includes('physio') || lower.includes('rehab')) {
      addBotMessageWithDelay(L.faq_physiotherapy);
    } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('call') || lower.includes('email')) {
      addBotMessageWithDelay(L.faq_contact);
    } else if (lower.includes('sigmoidoscopy') || lower.includes('colon') || lower.includes('endoscopy')) {
      addBotMessageWithDelay(L.faq_sigmoidoscopy);
    } else if (lower.includes('different') || lower.includes('unique') || lower.includes('special') || lower.includes('best')) {
      addBotMessageWithDelay(L.faq_unique);
    } else if (lower.includes('location') || lower.includes('address') || lower.includes('where')) {
      addBotMessageWithDelay(L.location);
    } else if (lower.includes('visiting hour') || lower.includes('visitor')) {
      addBotMessageWithDelay(L.visitingHours);
    } else if (lower.includes('opd') || lower.includes('timing') || lower.includes('hours') || lower.includes('open')) {
      addBotMessageWithDelay(L.opd);
    } else if (lower.includes('price') || lower.includes('cost') || lower.includes('fee') || lower.includes('charge') || lower.includes('rate')) {
      addBotMessageWithDelay(L.pricing);
    } else if (lower.includes('insurance') || lower.includes('cashless') || lower.includes('mediclaim')) {
      addBotMessageWithDelay(L.insurance);
    } else if (lower.includes('admission') || lower.includes('admit') || lower.includes('ward') || lower.includes('bed')) {
      addBotMessageWithDelay(L.admission);
    } else if (lower.includes('parking')) {
      addBotMessageWithDelay(L.parking);
    } else if (lower.includes('service') || lower.includes('treatment')) {
      addBotMessageWithDelay(L.services);
    } else if (lower.includes('department') || lower.includes('specialty')) {
      await respondWithDepartments();
    } else if (lower.includes('doctor') || lower.includes('dr')) {
      await respondWithDoctors();
    } else if (lower.includes('appointment') || lower.includes('book') || lower.includes('schedule')) {
      addBotMessageWithDelay(L.appointmentIntro);
      setTimeout(() => addBotMessageWithDelay(L.appointmentName), BOT_REPLY_DELAY_MS + 300);
      appointmentStep = 'name';
    } else if (lower.includes('thank')) {
      addBotMessageWithDelay(L.thanks);
    } else if (lower.includes('bye') || lower.includes('goodbye')) {
      addBotMessageWithDelay(L.bye);
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste') || lower.includes('salam')) {
      addBotMessageWithDelay(L.welcome);
      setTimeout(() => addBotMessageWithDelay(L.prompt), BOT_REPLY_DELAY_MS + 300);
    } else {
      addBotMessageWithDelay(L.fallback);
    }
  }

  async function respondWithDepartments() {
    const L = LANG[currentLang];
    if (cachedDepartments.length) {
      addBotMessageWithDelay(`${L.departments}\n${cachedDepartments.map(d => '• ' + d.name).join('\n')}`);
      return;
    }
    if (departmentsLoading) {
      addBotMessageWithDelay(L.loadingData);
      return;
    }
    addBotMessageWithDelay(L.loadingData);
    departmentsLoading = true;
    const depts = await fetchCSV(SHEET_URLS.departments);
    departmentsLoading = false;
    cachedDepartments = depts;
    if (depts.length) {
      addBotMessageWithDelay(`${L.departments}\n${depts.map(d => '• ' + d.name).join('\n')}`);
    } else {
      addBotMessageWithDelay(L.dataUnavailable);
    }
  }

  async function respondWithDoctors() {
    const L = LANG[currentLang];
    if (cachedDoctors.length) {
      addBotMessageWithDelay(`${L.doctors}\n${cachedDoctors.slice(0, 10).map(d => `• ${d.name} (${d.specialty})`).join('\n')}`);
      return;
    }
    if (doctorsLoading) {
      addBotMessageWithDelay(L.loadingData);
      return;
    }
    addBotMessageWithDelay(L.loadingData);
    doctorsLoading = true;
    const docs = await fetchCSV(SHEET_URLS.doctors);
    doctorsLoading = false;
    cachedDoctors = docs;
    if (docs.length) {
      addBotMessageWithDelay(`${L.doctors}\n${docs.slice(0, 10).map(d => `• ${d.name} (${d.specialty})`).join('\n')}`);
    } else {
      addBotMessageWithDelay(L.dataUnavailable);
    }
  }

  // ---- SET LANGUAGE ----
  function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.ibn-bot-lang button').forEach(btn => {
      const active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('ibn-bot-messages').innerHTML = '';
    addMessage(LANG[lang].welcome, 'bot');
    addMessage(LANG[lang].prompt, 'bot');
    renderQuickReplies();
  }

  // ---- SEND HANDLER ----
  function handleUserText(text) {
    const msg = text.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    processMessage(msg);
  }

  // ---- INIT ----
  function init() {
    injectStyles();
    injectHTML();
    renderQuickReplies();

    const fab = document.getElementById('ibn-bot-fab');
    const win = document.getElementById('ibn-bot-window');
    const close = document.getElementById('ibn-bot-close');
    const send = document.getElementById('ibn-bot-send');
    const input = document.getElementById('ibn-bot-input');
    const langBtns = document.querySelectorAll('.ibn-bot-lang button');

    function openWindow() {
      win.style.display = 'flex';
      if (document.getElementById('ibn-bot-messages').children.length === 0) {
        addMessage(LANG[currentLang].welcome, 'bot');
        addMessage(LANG[currentLang].prompt, 'bot');
      }
      input.focus();
    }

    function closeWindow() {
      win.style.display = 'none';
      fab.focus();
    }

    fab.addEventListener('click', () => {
      const isVisible = win.style.display === 'flex';
      if (isVisible) closeWindow(); else openWindow();
    });

    close.addEventListener('click', closeWindow);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && win.style.display === 'flex') closeWindow();
    });

    langBtns.forEach(btn => btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang'))));

    send.addEventListener('click', () => {
      handleUserText(input.value);
      input.value = '';
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') send.click();
    });

    preloadData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

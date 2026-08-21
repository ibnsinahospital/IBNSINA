// =============================================
// IBN SINA BOT – Stable Intelligent Chatbot
// =============================================
(function () {
  // ---- CONFIGURATION ----
  const SHEET_URLS = {
    departments: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSY7cmsIsfCzFSfe6Gf6wG-XWffYscBhXHqnFqv0RvwuqbG7kNnPG7eSmSaR_E-ztlY8qLkHZ2yuL-t/pub?output=csv',
    doctors: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_H8Rgr6VOjrap91SR_3nbBQLVf7QOQOHqZSs-pT6SfoNpyHjpj-QD0nNtcHDr5ip439naZ0sTr62Y/pub?output=csv'
  };
  const APPOINTMENT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOmEFb0cu0rQ3IzRKrzP9wLNgjXZLUuvpZJWp2xEcZSvuknyppjiavPWST31QNEWoS/exec';
  const FETCH_TIMEOUT_MS = 8000;
  const BOT_REPLY_DELAY_MS = 400;

  // ---- LANGUAGE PACKS (EN + HI) ----
  const LANG = {
    en: {
      name: 'English',
      welcome: 'Hello! I am Ibn Sina Bot. How can I help you?',
      prompt: 'You can ask me about OPD timings, location, services, departments, doctors, or book an appointment.',
      opd: 'Our OPD is open 24/7, every day of the year — along with Emergency, Pharmacy, and Laboratory services.',
      visitingHours: 'There\'s no fixed visiting-hours restriction — OPD, Emergency, Pharmacy, and Lab are all open 24/7. For ward-specific visiting rules, please check with reception: 9622552553.',
      pricing: 'Pricing depends on the specific test, procedure, or consultation. Please call reception at 9622552553 / 9419023501 for exact rates.',
      insurance: 'For insurance and cashless treatment queries, please call the administration at 9622392553 / 9149606115 so they can confirm what\'s accepted.',
      admission: 'For admission or ward-related queries, please call reception at 9622552553 — they can guide you through the process and bed availability.',
      parking: 'For parking availability, please check with the reception desk at 9622552553 when you arrive.',
      location: 'We are near Railway Station, Ompora Railway Station Road, Ompora, Budgam, J&K 191111.',
      emergency: 'For emergencies, call 9622552553 or 9419023501.',
      services: 'We offer a wide range of services including Laboratory diagnostics, Pharmacy, Physiotherapy, Sigmoidoscopy, Dialysis, Ambulance/Emergency services, TMT, Holter monitoring, ABPM, Endoscopy, Colonoscopy, Digital X-ray, Ultrasound, and Vaccinations.',
      departments: 'Our departments:',
      doctors: 'Our doctors:',
      doctors_specialty: 'Doctors in {specialty}:',
      no_doctors_specialty: 'We couldn\'t find doctors for that specialty. You can call 9622552553 for assistance.',
      loadingData: 'One moment, fetching that for you...',
      dataUnavailable: 'That information isn\'t available right now. Please call 9622552553.',
      appointmentIntro: 'Sure, let\'s book an appointment. Type "cancel" anytime to stop.',
      appointmentName: 'Please type your full name.',
      appointmentPhone: 'Thanks! Now type your 10-digit phone number.',
      appointmentPhoneInvalid: 'That doesn\'t look like a valid phone number. Please enter 7–15 digits (numbers only).',
      appointmentDept: 'Which department would you like to visit? (Type the name, or type "skip" if you\'re not sure)',
      appointmentTime: 'What\'s your preferred date/time for the visit? (e.g. "Tomorrow 11 AM", "Monday morning", or type "skip" if flexible)',
      appointmentSubmitting: 'Submitting your request...',
      appointmentDone: 'Appointment request submitted! We will call you shortly. If you don\'t hear from us soon, please call 9622552553.',
      appointmentCancelled: 'No problem, appointment request cancelled.',
      appointmentConfirm: 'Please confirm your appointment details:\nName: {name}\nPhone: {phone}\nDepartment: {dept}\nPreferred time: {time}\n\nType "confirm" to submit or "cancel" to abort.',
      appointmentConfirmed: 'Thank you! Your appointment request is confirmed. We will call you shortly.',
      fallback: 'I\'m still learning. Could you rephrase that? For urgent help, call 9622552553.',
      thanks: 'You\'re welcome! Is there anything else I can help with?',
      bye: 'Take care! Call 9622552553 anytime you need us.',
      help: 'I can help you with:\n- OPD timings & location\n- Services & departments\n- Doctors list (including by specialty)\n- Booking an appointment\n- Answering common health questions\nJust type your question!',
      symptom_chest_pain: 'Chest pain could be serious. Please call 9622552553 immediately or visit our emergency department right away.',
      symptom_breath: 'Difficulty breathing is an emergency. Call 9622552553 now or come to the emergency department immediately.',
      symptom_headache: 'For persistent or severe headaches, we recommend a consultation. You can book an appointment or call 9622552553.',
      symptom_fever: 'Fever can have many causes. For high fever or persistent fever, please visit our OPD or call 9622552553.',
      symptom_stomach: 'For stomach pain or digestive issues, you may need a consultation or endoscopy. Call 9622552553 for guidance.',
      symptom_back_pain: 'Back pain can be due to many reasons. We have orthopaedics and physiotherapy departments. Call 9622552553 to book a consultation.',
      tmt_description: 'TMT (Treadmill Test) checks how your heart performs under physical exertion. It helps detect issues like reduced blood flow to the heart during activity. Available at Ibn Sina Hospital. Call to book.',
      holter_description: 'Holter monitoring continuously records your heart\'s rhythm for 24-48 hours as you go about your normal day. It catches irregular heartbeats that a standard ECG might miss. Available here.',
      abpm_description: 'ABPM measures your blood pressure at regular intervals over 24 hours, including while you sleep. It gives a complete picture of your blood pressure patterns. Available at Ibn Sina Hospital.',
      endoscopy_description: 'Endoscopy and colonoscopy allow doctors to examine your digestive tract. Available at Ibn Sina Hospital. Call 9622552553 to schedule.',
      xray_description: 'Digital X-ray and ultrasound provide high-resolution imaging with same-day results. Available at Ibn Sina Hospital.',
      faq_pharmacy: 'Yes. Ibn Sina Pharmacy operates 365 days a year, 24 hours a day — the only pharmacy of its kind in Budgam that never closes.',
      faq_lab: 'Yes, the lab provides round-the-clock service for inpatients and outpatients, with fast, accurate turnaround times.',
      faq_dialysis: 'Yes, dialysis services are available for patients with kidney failure. Please call to check availability and scheduling.',
      faq_ambulance: 'Yes, the hospital runs an ambulance service as part of its Emergency Medicine department.',
      faq_physiotherapy: 'Yes. Physiotherapy covers injury prevention, rehabilitation, and management of acute and chronic conditions.',
      faq_contact: 'Reception: 9622552553 / 9419023501. Administration: 9622392553 / 9149606115 / 7006272634. Email: weibnsina@gmail.com.',
      faq_sigmoidoscopy: 'Yes, the hospital performs sigmoidoscopy — a procedure using a flexible tube with a light to examine the sigmoid colon.',
      faq_unique: 'It combines a 24/7 in-house pharmacy, round-the-clock lab services, and multiple specialities (physiotherapy, dialysis, ambulance, diagnostics) under one roof.',
      quickReplies: ['OPD Timings', 'Services', 'Book Appointment', 'Contact Us', 'Doctors'],
      unknown_name: 'I don\'t know that doctor. Would you like to see the list of doctors?'
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
      services: 'Hum Laboratory diagnostics, Pharmacy, Physiotherapy, Sigmoidoscopy, Dialysis, Ambulance/Emergency services, TMT, Holter, ABPM, Endoscopy, Colonoscopy, Digital X-ray, Ultrasound aur Vaccinations provide karte hain.',
      departments: 'Humare departments:',
      doctors: 'Humare doctors:',
      doctors_specialty: '{specialty} ke doctors:',
      no_doctors_specialty: 'Us specialty ke liye doctors nahi mile. Madad ke liye 9622552553 call karein.',
      loadingData: 'Ek minute, dhoondh raha hoon...',
      dataUnavailable: 'Yeh jaankari abhi uplabdh nahi hai. Kripya 9622552553 par call karein.',
      appointmentIntro: 'Theek hai, appointment book karte hain. Kabhi bhi "cancel" likh kar rok sakte hain.',
      appointmentName: 'Apna poora naam likhein.',
      appointmentPhone: 'Shukriya! Ab apna 10-digit phone number likhein.',
      appointmentPhoneInvalid: 'Yeh number sahi nahi lag raha. Kripya 7–15 digits (sirf numbers) daalein.',
      appointmentDept: 'Kis department mein jaana hai? (Naam likhein, ya "skip" likhein agar pata nahi)',
      appointmentTime: 'Aapka preferred date/time kya hai? (jaise "Kal 11 AM", "Somvaar subah", ya "skip" likhein agar flexible hain)',
      appointmentSubmitting: 'Aapki request submit ho rahi hai...',
      appointmentDone: 'Appointment request submit ho gayi! Hum jald call karenge. Agar call na aaye toh 9622552553 par khud call karein.',
      appointmentCancelled: 'Koi baat nahi, appointment request cancel kar di gayi.',
      appointmentConfirm: 'Kripya apni appointment details confirm karein:\nNaam: {name}\nPhone: {phone}\nDepartment: {dept}\nPreferred time: {time}\n\nSubmit karne ke liye "confirm" likhein ya "cancel" likhein.',
      appointmentConfirmed: 'Dhanyavaad! Aapki appointment request confirm ho gayi. Hum jald call karenge.',
      fallback: 'Maaf kijiye, samajh nahi aaya. Turant madad ke liye 9622552553 par call karein.',
      thanks: 'Aapka swagat hai! Aur kuch madad chahiye?',
      bye: 'Apna khayal rakhein! Zaroorat par 9622552553 par call karein.',
      help: 'Main aapki madad kar sakta hoon:\n- OPD timings & location\n- Services & departments\n- Doctors list (specialty ke saath)\n- Appointment booking\n- Common health questions\nBas apna sawal likhein!',
      symptom_chest_pain: 'Chest pain serious ho sakta hai. Turant 9622552553 par call karein ya emergency department aayein.',
      symptom_breath: 'Saans lene mein dikkat emergency hai. Abhi 9622552553 call karein ya emergency aayein.',
      symptom_headache: 'Lagaatar ya severe headache ke liye consultation ki salah di jaati hai. Appointment book karein ya 9622552553 call karein.',
      symptom_fever: 'Bukhar ke kai kaaran ho sakte hain. Tez bukhar ya lagaatar bukhar ke liye OPD aayein ya 9622552553 call karein.',
      symptom_stomach: 'Pet dard ya digestive issues ke liye consultation ya endoscopy ki zaroorat ho sakti hai. Guidance ke liye 9622552553 call karein.',
      symptom_back_pain: 'Back pain ke kai kaaran ho sakte hain. Humare paas orthopaedics aur physiotherapy departments hain. Consultation book karne ke liye 9622552553 call karein.',
      tmt_description: 'TMT (Treadmill Test) exercise ke dauran dil ki performance check karta hai. Yeh Ibn Sina Hospital mein uplabdh hai. Book karne ke liye call karein.',
      holter_description: 'Holter monitoring 24-48 ghante tak dil ki rhythm record karta hai. Yeh yahan uplabdh hai.',
      abpm_description: 'ABPM 24 ghante tak blood pressure measure karta hai. Yeh yahan uplabdh hai.',
      endoscopy_description: 'Endoscopy aur colonoscopy digestive tract ki jaanch ke liye uplabdh hain. Schedule karne ke liye 9622552553 call karein.',
      xray_description: 'Digital X-ray aur ultrasound same-day results ke saath uplabdh hain. Call karein 9622552553.',
      faq_pharmacy: 'Haan. Ibn Sina Pharmacy 365 din, 24 ghante khuli rehti hai — Budgam ki ekmatra pharmacy jo kabhi band nahi hoti.',
      faq_lab: 'Haan, lab inpatients aur outpatients ke liye round-the-clock seva deta hai, fast aur accurate results ke saath.',
      faq_dialysis: 'Haan, dialysis seva kidney failure ke patients ke liye uplabdh hai. Kripya availability ke liye call karein.',
      faq_ambulance: 'Haan, hospital Emergency Medicine department ke tahat ambulance seva chalaata hai.',
      faq_physiotherapy: 'Haan. Physiotherapy injury prevention, rehabilitation, aur acute/chronic conditions ke management ko cover karti hai.',
      faq_contact: 'Reception: 9622552553 / 9419023501. Administration: 9622392553 / 9149606115 / 7006272634. Email: weibnsina@gmail.com.',
      faq_sigmoidoscopy: 'Haan, hospital sigmoidoscopy karta hai — ek flexible tube jisme light hoti hai, sigmoid colon ki jaanch ke liye.',
      faq_unique: 'Yeh 24/7 in-house pharmacy, round-the-clock lab, aur multiple specialities (physiotherapy, dialysis, ambulance, diagnostics) ko ek hi chhat ke neeche laata hai.',
      quickReplies: ['OPD Timings', 'Services', 'Appointment Book Karein', 'Contact', 'Doctors'],
      unknown_name: 'Mujhe yeh doctor nahi pata. Kya aap doctors ki list dekhna chahenge?'
    }
  };

  // ---- CONTEXT & STATE ----
  let currentLang = 'en';
  let appointmentStep = null;
  let appointmentData = { name: '', phone: '', department: '', preferredTime: '' };
  let cachedDepartments = [];
  let cachedDoctors = [];
  let departmentsLoading = false;
  let doctorsLoading = false;
  let isSubmittingAppointment = false;
  let contextQuickReplies = [];

  // ---- SYNONYM MAPPING FOR SPECIALTIES ----
  const specialtySynonyms = {
    'cardiology': ['cardiology', 'heart', 'cardiologist', 'cardiac'],
    'ctvs': ['ctvs', 'cardiothoracic', 'vascular surgery'],
    'dental': ['dental', 'dentist', 'teeth'],
    'dermatology': ['dermatology', 'skin', 'dermatologist'],
    'endocrinology': ['endocrinology', 'diabetes', 'thyroid', 'hormone'],
    'ent': ['ent', 'ear nose throat', 'otolaryngology', 'ear', 'nose', 'throat'],
    'gastroenterology': ['gastroenterology', 'stomach', 'digestive', 'gastro', 'gastroenterologist'],
    'general surgery': ['general surgery', 'surgeon'],
    'gynaecology': ['gynaecology', 'gynecology', 'gynecologist', 'obstetrics', 'obgyn', 'gynae', 'gyn', 'gynaecologist'],
    'neurosurgery': ['neurosurgery', 'brain surgery', 'spine surgery'],
    'neurology': ['neurology', 'neurologist', 'brain', 'nerves'],
    'ophthalmology': ['ophthalmology', 'eye', 'ophthalmologist'],
    'orthopaedics': ['orthopaedics', 'orthopedics', 'bone', 'joint', 'ortho', 'orthopedic'],
    'pediatrics': ['pediatrics', 'paediatrics', 'child', 'children', 'pediatrician'],
    'physiotherapy': ['physiotherapy', 'physio', 'rehab', 'physical therapy'],
    'plastic surgery': ['plastic surgery', 'cosmetic surgery'],
    'psychiatry': ['psychiatry', 'psychiatrist', 'mental health'],
    'pulmonology': ['pulmonology', 'chest', 'respiratory', 'pulmonologist', 'lungs'],
    'rheumatology': ['rheumatology', 'arthritis', 'rheumatologist'],
    'urology': ['urology', 'urologist', 'kidney', 'urinary']
  };

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
        transition: transform 0.2s;
      }
      .ibn-bot-fab:hover { transform: scale(1.05); }
      .ibn-bot-fab:focus-visible, .ibn-bot-close:focus-visible, .ibn-bot-send:focus-visible,
      .ibn-bot-lang button:focus-visible, .ibn-bot-quick button:focus-visible,
      .ibn-bot-call:focus-visible, .ibn-bot-clear:focus-visible {
        outline: 2px solid #8fd19e; outline-offset: 2px;
      }
      .ibn-bot-window {
        position: fixed; bottom: 90px; right: 20px; z-index: 9999;
        width: 380px; max-width: 94vw; height: 600px; max-height: 80vh;
        background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        display: none; flex-direction: column; overflow: hidden;
        font-family: 'Nunito', 'Inter', sans-serif;
      }
      .ibn-bot-header {
        background: #2d4a2b; color: #fff; padding: 15px;
        display: flex; align-items: center; justify-content: space-between;
      }
      .ibn-bot-header h3 { margin: 0; font-size: 1rem; }
      .ibn-bot-header-actions { display: flex; gap: 8px; }
      .ibn-bot-call, .ibn-bot-clear {
        background: none; border: none; color: #fff; cursor: pointer; font-size: 1.1rem;
      }
      .ibn-bot-close { background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; line-height: 1; }
      .ibn-bot-lang { display: flex; gap: 5px; padding: 8px 15px; background: #f1f1f1; }
      .ibn-bot-lang button { background: #fff; border: 1px solid #ccc; border-radius: 15px; padding: 3px 10px; cursor: pointer; font-size: 0.8rem; }
      .ibn-bot-lang button.active { background: #2d4a2b; color: #fff; }
      .ibn-bot-messages { flex: 1; padding: 15px; overflow-y: auto; background: #f9f9f4; display: flex; flex-direction: column; gap: 10px; }
      .ibn-bot-msg {
        max-width: 85%; padding: 10px 14px; border-radius: 15px; line-height: 1.4; font-size: 0.95rem;
        white-space: pre-line; word-wrap: break-word; position: relative;
      }
      .ibn-bot-msg.bot { background: #e0e0d0; color: #1a1a1a; border-bottom-left-radius: 5px; align-self: flex-start; }
      .ibn-bot-msg.user { background: #2d4a2b; color: #fff; border-bottom-right-radius: 5px; align-self: flex-end; }
      .ibn-bot-msg .timestamp { display: block; font-size: 0.7rem; opacity: 0.6; margin-top: 4px; text-align: right; }
      .ibn-bot-msg.typing { display: flex; gap: 4px; align-items: center; width: fit-content; align-self: flex-start; }
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
        border-radius: 15px; padding: 6px 12px; font-size: 0.8rem; cursor: pointer;
        transition: background 0.2s;
      }
      .ibn-bot-quick button:hover { background: #2d4a2b; color: #fff; }
      .ibn-bot-input-area { display: flex; padding: 10px; border-top: 1px solid #ddd; background: #fff; }
      .ibn-bot-input { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 20px; font-family: inherit; font-size: 0.9rem; }
      .ibn-bot-input:disabled { background: #f1f1f1; }
      .ibn-bot-send { background: #2d4a2b; color: #fff; border: none; border-radius: 20px; padding: 0 20px; margin-left: 8px; cursor: pointer; }
      .ibn-bot-send:disabled { opacity: 0.6; cursor: not-allowed; }
      @media (max-width: 400px) {
        .ibn-bot-window { right: 5vw; bottom: 80px; width: 95vw; }
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
          <div class="ibn-bot-header-actions">
            <button class="ibn-bot-call" id="ibn-bot-call" aria-label="Call emergency">📞</button>
            <button class="ibn-bot-clear" id="ibn-bot-clear" aria-label="Clear chat">🗑️</button>
            <button class="ibn-bot-close" id="ibn-bot-close" aria-label="Close chat">×</button>
          </div>
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
    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msg.appendChild(timestamp);
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

  function addBotMessageWithDelay(text, delay = BOT_REPLY_DELAY_MS) {
    const typing = showTyping();
    setTimeout(() => {
      if (typing) typing.remove();
      addMessage(text, 'bot');
    }, delay);
  }

  // ---- QUICK REPLIES ----
  function renderQuickReplies(replies) {
    const container = document.getElementById('ibn-bot-quick');
    if (!container) return;
    container.innerHTML = '';
    const list = replies || contextQuickReplies.length ? (replies || contextQuickReplies) : LANG[currentLang].quickReplies;
    list.forEach(label => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.addEventListener('click', () => handleUserText(label));
      container.appendChild(btn);
    });
  }

  function setContextQuickReplies(replies) {
    contextQuickReplies = replies;
    renderQuickReplies();
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csv = await res.text();
      return parseCSV(csv);
    } catch (e) {
      console.error('Chatbot CSV fetch error:', e);
      return [];
    }
  }

  // CSV Parser (handles quotes, multi-line)
  function parseCSV(csvText) {
    if (!csvText) return [];
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < csvText.length; i++) {
      const c = csvText[i];
      const next = csvText[i + 1];
      if (inQuotes) {
        if (c === '"' && next === '"') { field += '"'; i++; }
        else if (c === '"') { inQuotes = false; }
        else { field += c; }
      } else {
        if (c === '"') { inQuotes = true; }
        else if (c === ',') { row.push(field.trim()); field = ''; }
        else if (c === '\n' || c === '\r') {
          if (c === '\r' && next === '\n') i++;
          row.push(field.trim());
          if (row.length > 0 && row.some(f => f !== '')) rows.push(row);
          row = []; field = '';
        } else { field += c; }
      }
    }
    if (field !== '') row.push(field.trim());
    if (row.length > 0) rows.push(row);
    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').toLowerCase());
    return rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || '');
      return obj;
    });
  }

  // ---- PRELOAD DATA ----
  async function preloadData() {
    departmentsLoading = true;
    doctorsLoading = true;
    try {
      const [depts, docs] = await Promise.all([
        fetchCSV(SHEET_URLS.departments),
        fetchCSV(SHEET_URLS.doctors)
      ]);
      cachedDepartments = depts;
      cachedDoctors = docs;
      console.log('Chatbot data loaded:', { departments: depts.length, doctors: docs.length });
    } catch (e) {
      console.error('Chatbot data preload failed:', e);
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

  // ---- NATURAL LANGUAGE DATE/TIME PARSING ----
  function parsePreferredTime(text) {
    const lower = text.toLowerCase();
    let result = text;
    const dayMap = {
      'today': 'Today',
      'tomorrow': 'Tomorrow',
      'day after tomorrow': 'Day after tomorrow',
      'next monday': 'Next Monday',
      'next tuesday': 'Next Tuesday',
      'next wednesday': 'Next Wednesday',
      'next thursday': 'Next Thursday',
      'next friday': 'Next Friday',
      'next saturday': 'Next Saturday',
      'next sunday': 'Next Sunday',
      'monday': 'Monday',
      'tuesday': 'Tuesday',
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday',
      'sunday': 'Sunday'
    };
    for (const [key, value] of Object.entries(dayMap)) {
      if (lower.includes(key)) {
        result = value;
        break;
      }
    }
    if (lower.includes('morning')) result += ' morning';
    else if (lower.includes('afternoon')) result += ' afternoon';
    else if (lower.includes('evening')) result += ' evening';
    else if (lower.includes('night')) result += ' night';
    else if (lower.includes('am') || lower.includes('pm')) result += ' ' + text.match(/\d{1,2}:\d{2}\s?(?:am|pm)/i)?.[0] || '';
    return result.trim() || text;
  }

  // ---- SUBMIT APPOINTMENT ----
  function submitAppointment() {
    if (isSubmittingAppointment) return;
    isSubmittingAppointment = true;
    setInputEnabled(false);
    addBotMessageWithDelay(LANG[currentLang].appointmentSubmitting);

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

    setTimeout(() => {
      addBotMessageWithDelay(LANG[currentLang].appointmentDone);
      appointmentStep = null;
      appointmentData = { name: '', phone: '', department: '', preferredTime: '' };
      isSubmittingAppointment = false;
      setInputEnabled(true);
      setContextQuickReplies(LANG[currentLang].quickReplies);
    }, 600);
  }

  function setInputEnabled(enabled) {
    const input = document.getElementById('ibn-bot-input');
    const send = document.getElementById('ibn-bot-send');
    if (input) input.disabled = !enabled;
    if (send) send.disabled = !enabled;
    if (enabled && input) input.focus();
  }

  // ---- EXTRACT SPECIALTY FROM QUERY (simple includes) ----
  function extractSpecialty(query) {
    const lower = query.toLowerCase();
    // First check exact department name from cached departments
    if (cachedDepartments.length) {
      for (const dept of cachedDepartments) {
        const deptName = dept.name ? dept.name.toLowerCase() : '';
        if (deptName && lower.includes(deptName)) {
          return dept.name;
        }
      }
    }
    // Check synonyms (simple includes, but we only consider full word for single-word synonyms)
    for (const [specialty, synonyms] of Object.entries(specialtySynonyms)) {
      for (const syn of synonyms) {
        // For single-word synonyms, ensure it's a whole word (not substring)
        if (syn.includes(' ')) {
          if (lower.includes(syn)) {
            // Multi-word: use includes
            if (cachedDepartments.length) {
              const foundDept = cachedDepartments.find(d => d.name && d.name.toLowerCase().includes(specialty.toLowerCase()));
              if (foundDept) return foundDept.name;
            }
            return specialty.charAt(0).toUpperCase() + specialty.slice(1);
          }
        } else {
          // Single word: check with word boundaries using split
          if (new RegExp(`\\b${syn}\\b`).test(lower)) {
            if (cachedDepartments.length) {
              const foundDept = cachedDepartments.find(d => d.name && d.name.toLowerCase().includes(specialty.toLowerCase()));
              if (foundDept) return foundDept.name;
            }
            return specialty.charAt(0).toUpperCase() + specialty.slice(1);
          }
        }
      }
    }
    return null;
  }

  // ---- FILTER DOCTORS BY SPECIALTY ----
  function filterDoctorsBySpecialty(specialty) {
    if (!specialty || !cachedDoctors.length) return [];
    const lowerSpecialty = specialty.toLowerCase();
    return cachedDoctors.filter(d => {
      const docSpecialty = d.specialty ? d.specialty.toLowerCase() : '';
      const docDept = d.department ? d.department.toLowerCase() : '';
      return docSpecialty.includes(lowerSpecialty) || docDept.includes(lowerSpecialty);
    });
  }

  // ---- DETECT INTENT ----
  function detectIntent(text) {
    const lower = text.toLowerCase();
    const scores = {
      greeting: 0,
      opd_timing: 0,
      location: 0,
      services: 0,
      departments: 0,
      doctors: 0,
      appointment: 0,
      pharmacy: 0,
      lab: 0,
      dialysis: 0,
      ambulance: 0,
      physiotherapy: 0,
      tmt: 0,
      holter: 0,
      abpm: 0,
      endoscopy: 0,
      xray: 0,
      contact: 0,
      pricing: 0,
      insurance: 0,
      admission: 0,
      parking: 0,
      visiting: 0,
      unique: 0,
      symptom_chest_pain: 0,
      symptom_breath: 0,
      symptom_headache: 0,
      symptom_fever: 0,
      symptom_stomach: 0,
      symptom_back_pain: 0,
      thanks: 0,
      bye: 0,
      help: 0,
      fallback: 0
    };

    const patterns = {
      greeting: ['hello', 'hi', 'hey', 'namaste', 'salam', 'good morning', 'good afternoon', 'good evening'],
      opd_timing: ['opd', 'timing', 'hours', 'open', 'close', 'working hours'],
      location: ['location', 'address', 'where', 'direction', 'route'],
      services: ['service', 'treatment', 'facility', 'facilities'],
      departments: ['department', 'specialty', 'speciality', 'dept', 'departments'],
      doctors: ['doctor', 'dr', 'physician', 'specialist', 'consultant', 'gynaecologist', 'gynecologist', 'cardiologist', 'neurologist', 'pediatrician', 'orthopedician', 'urologist', 'dermatologist', 'ophthalmologist', 'ent specialist', 'psychiatrist', 'endocrinologist', 'gastroenterologist', 'rheumatologist', 'pulmonologist', 'nephrologist', 'surgeon', 'gynaecologists', 'gynecologists'],
      appointment: ['appointment', 'book', 'schedule', 'visit', 'consult'],
      pharmacy: ['pharmacy', 'medicine', 'medical store', 'drug'],
      lab: ['lab', 'laboratory', 'diagnostic', 'test', 'blood test'],
      dialysis: ['dialysis', 'kidney', 'renal'],
      ambulance: ['ambulance', 'emergency', 'urgent'],
      physiotherapy: ['physiotherapy', 'physio', 'rehab', 'physical therapy'],
      tmt: ['tmt', 'treadmill', 'stress test'],
      holter: ['holter'],
      abpm: ['abpm', 'blood pressure', 'bp'],
      endoscopy: ['endoscopy', 'colonoscopy', 'sigmoidoscopy', 'scope'],
      xray: ['xray', 'x-ray', 'ultrasound', 'ultrasonography', 'radiology', 'imaging'],
      contact: ['contact', 'phone', 'call', 'email', 'number'],
      pricing: ['price', 'cost', 'fee', 'charge', 'rate', 'how much'],
      insurance: ['insurance', 'cashless', 'mediclaim', 'policy'],
      admission: ['admission', 'admit', 'ward', 'bed', 'inpatient'],
      parking: ['parking', 'car park'],
      visiting: ['visiting hour', 'visitor', 'visit hour'],
      unique: ['different', 'unique', 'special', 'best', 'why choose'],
      symptom_chest_pain: ['chest pain', 'heart pain', 'chest ache', 'angina'],
      symptom_breath: ['breathing', 'breath', 'shortness of breath', 'saans', 'dyspnea'],
      symptom_headache: ['headache', 'migraine', 'head pain'],
      symptom_fever: ['fever', 'bukhar', 'temperature', 'pyrexia'],
      symptom_stomach: ['stomach pain', 'abdominal pain', 'digestive', 'pet dard', 'gastro'],
      symptom_back_pain: ['back pain', 'backache', 'spine'],
      thanks: ['thank', 'thanks', 'shukriya', 'dhanyavad'],
      bye: ['bye', 'goodbye', 'see you', 'alvida'],
      help: ['help', 'assist', 'what can you do', 'options'],
    };

    for (const [intent, keywords] of Object.entries(patterns)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          scores[intent] += 1;
        }
      }
    }

    let maxScore = 0;
    let topIntent = 'fallback';
    for (const [intent, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        topIntent = intent;
      }
    }
    return topIntent;
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
      setContextQuickReplies(L.quickReplies);
      return;
    }

    // Appointment confirmation step
    if (appointmentStep === 'confirm') {
      if (lower === 'confirm' || lower === 'yes' || lower === 'haan') {
        appointmentStep = null;
        submitAppointment();
        return;
      } else if (lower === 'cancel') {
        appointmentStep = null;
        appointmentData = { name: '', phone: '', department: '', preferredTime: '' };
        addBotMessageWithDelay(L.appointmentCancelled);
        setContextQuickReplies(L.quickReplies);
        return;
      } else {
        addBotMessageWithDelay('Please type "confirm" or "cancel".');
        return;
      }
    }

    // Appointment flow steps
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
      if (cachedDepartments.length) {
        const deptNames = cachedDepartments.map(d => d.name).slice(0, 10);
        setContextQuickReplies([...deptNames, 'skip']);
        addBotMessageWithDelay(`${L.appointmentDept}\nAvailable departments:\n${deptNames.map((d,i)=>`${i+1}. ${d}`).join('\n')}`);
      } else {
        setContextQuickReplies(['skip']);
        addBotMessageWithDelay(L.appointmentDept);
      }
      return;
    }
    if (appointmentStep === 'dept') {
      appointmentData.department = lower === 'skip' ? '' : text.trim();
      appointmentStep = 'time';
      setContextQuickReplies(['skip']);
      addBotMessageWithDelay(L.appointmentTime);
      return;
    }
    if (appointmentStep === 'time') {
      appointmentData.preferredTime = lower === 'skip' ? '' : parsePreferredTime(text.trim());
      appointmentStep = 'confirm';
      const confirmMsg = L.appointmentConfirm
        .replace('{name}', appointmentData.name)
        .replace('{phone}', appointmentData.phone)
        .replace('{dept}', appointmentData.department || 'Not specified')
        .replace('{time}', appointmentData.preferredTime || 'Flexible');
      setContextQuickReplies(['confirm', 'cancel']);
      addBotMessageWithDelay(confirmMsg);
      return;
    }

    // Detect intent first
    const intent = detectIntent(lower);

    // Special handling for doctor-related queries with specialty
    if (intent === 'doctors' || lower.includes('doctor') || lower.includes('dr') || lower.includes('specialist') || lower.includes('consultant')) {
      const specialty = extractSpecialty(lower);
      if (specialty && cachedDoctors.length) {
        const docs = filterDoctorsBySpecialty(specialty);
        if (docs.length) {
          const list = docs.map((d, i) => `${i + 1}. ${d.name} (${d.specialty})`).join('\n');
          addBotMessageWithDelay(`${L.doctors_specialty.replace('{specialty}', specialty)}\n${list}`);
          setContextQuickReplies(['Book Appointment', 'All Doctors']);
          return;
        } else {
          addBotMessageWithDelay(L.no_doctors_specialty);
          setContextQuickReplies(['All Doctors', 'Contact Us']);
          return;
        }
      }
    }

    switch (intent) {
      case 'greeting':
        addBotMessageWithDelay(L.welcome);
        setTimeout(() => addBotMessageWithDelay(L.prompt), BOT_REPLY_DELAY_MS + 300);
        setContextQuickReplies(L.quickReplies);
        break;
      case 'opd_timing':
        addBotMessageWithDelay(L.opd);
        setContextQuickReplies(['Book Appointment', 'Contact Us']);
        break;
      case 'location':
        addBotMessageWithDelay(L.location);
        setContextQuickReplies(['Contact Us', 'OPD Timings']);
        break;
      case 'services':
        addBotMessageWithDelay(L.services);
        setContextQuickReplies(['Departments', 'Doctors', 'Book Appointment']);
        break;
      case 'departments':
        await respondWithDepartments();
        break;
      case 'doctors':
        await respondWithDoctors();
        break;
      case 'appointment':
        addBotMessageWithDelay(L.appointmentIntro);
        setTimeout(() => addBotMessageWithDelay(L.appointmentName), BOT_REPLY_DELAY_MS + 300);
        appointmentStep = 'name';
        setContextQuickReplies(['cancel']);
        break;
      case 'pharmacy':
        addBotMessageWithDelay(L.faq_pharmacy);
        setContextQuickReplies(['Lab Services', 'Book Appointment']);
        break;
      case 'lab':
        addBotMessageWithDelay(L.faq_lab);
        setContextQuickReplies(['Pharmacy', 'Book Appointment']);
        break;
      case 'dialysis':
        addBotMessageWithDelay(L.faq_dialysis);
        setContextQuickReplies(['Book Appointment', 'Departments']);
        break;
      case 'ambulance':
        addBotMessageWithDelay(L.faq_ambulance);
        addBotMessageWithDelay(L.emergency);
        setContextQuickReplies(['Emergency', 'Contact Us']);
        break;
      case 'physiotherapy':
        addBotMessageWithDelay(L.faq_physiotherapy);
        setContextQuickReplies(['Book Appointment', 'Doctors']);
        break;
      case 'tmt':
        addBotMessageWithDelay(L.tmt_description);
        setContextQuickReplies(['Book Appointment', 'Holter', 'ABPM']);
        break;
      case 'holter':
        addBotMessageWithDelay(L.holter_description);
        setContextQuickReplies(['TMT', 'ABPM', 'Book Appointment']);
        break;
      case 'abpm':
        addBotMessageWithDelay(L.abpm_description);
        setContextQuickReplies(['TMT', 'Holter', 'Book Appointment']);
        break;
      case 'endoscopy':
        addBotMessageWithDelay(L.endoscopy_description);
        setContextQuickReplies(['Book Appointment', 'Departments']);
        break;
      case 'xray':
        addBotMessageWithDelay(L.xray_description);
        setContextQuickReplies(['Book Appointment', 'Lab Services']);
        break;
      case 'contact':
        addBotMessageWithDelay(L.faq_contact);
        setContextQuickReplies(['Call Us', 'Book Appointment']);
        break;
      case 'pricing':
        addBotMessageWithDelay(L.pricing);
        setContextQuickReplies(['Contact Us', 'Book Appointment']);
        break;
      case 'insurance':
        addBotMessageWithDelay(L.insurance);
        setContextQuickReplies(['Contact Us']);
        break;
      case 'admission':
        addBotMessageWithDelay(L.admission);
        setContextQuickReplies(['Contact Us', 'Book Appointment']);
        break;
      case 'parking':
        addBotMessageWithDelay(L.parking);
        break;
      case 'visiting':
        addBotMessageWithDelay(L.visitingHours);
        break;
      case 'unique':
        addBotMessageWithDelay(L.faq_unique);
        setContextQuickReplies(['About Us', 'Services']);
        break;
      case 'symptom_chest_pain':
        addBotMessageWithDelay(L.symptom_chest_pain);
        setContextQuickReplies(['Emergency', 'Book Appointment']);
        break;
      case 'symptom_breath':
        addBotMessageWithDelay(L.symptom_breath);
        setContextQuickReplies(['Emergency', 'Book Appointment']);
        break;
      case 'symptom_headache':
        addBotMessageWithDelay(L.symptom_headache);
        setContextQuickReplies(['Book Appointment', 'Doctors']);
        break;
      case 'symptom_fever':
        addBotMessageWithDelay(L.symptom_fever);
        setContextQuickReplies(['OPD Timings', 'Book Appointment']);
        break;
      case 'symptom_stomach':
        addBotMessageWithDelay(L.symptom_stomach);
        setContextQuickReplies(['Endoscopy', 'Book Appointment']);
        break;
      case 'symptom_back_pain':
        addBotMessageWithDelay(L.symptom_back_pain);
        setContextQuickReplies(['Orthopaedics', 'Physiotherapy', 'Book Appointment']);
        break;
      case 'thanks':
        addBotMessageWithDelay(L.thanks);
        setContextQuickReplies(L.quickReplies);
        break;
      case 'bye':
        addBotMessageWithDelay(L.bye);
        setContextQuickReplies(L.quickReplies);
        break;
      case 'help':
        addBotMessageWithDelay(L.help);
        setContextQuickReplies(L.quickReplies);
        break;
      default:
        // Try to handle doctor name query
        if (cachedDoctors.length) {
          const docMatch = cachedDoctors.find(d => lower.includes(d.name.toLowerCase()));
          if (docMatch) {
            const doctorInfo = `${docMatch.name} (${docMatch.specialty})\nQualifications: ${docMatch.qualifications || 'N/A'}\nDepartment: ${docMatch.department || 'N/A'}`;
            addBotMessageWithDelay(doctorInfo);
            setContextQuickReplies(['Book Appointment', 'Doctors']);
            return;
          }
        }
        addBotMessageWithDelay(L.fallback);
        setContextQuickReplies(['Help', 'Book Appointment', 'Contact Us']);
        break;
    }
  }

  async function respondWithDepartments() {
    const L = LANG[currentLang];
    if (cachedDepartments.length) {
      const list = cachedDepartments.map(d => d.name).join('\n');
      addBotMessageWithDelay(`${L.departments}\n${list}`);
      setContextQuickReplies(['Book Appointment', 'Doctors']);
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
      const list = depts.map(d => d.name).join('\n');
      addBotMessageWithDelay(`${L.departments}\n${list}`);
      setContextQuickReplies(['Book Appointment', 'Doctors']);
    } else {
      addBotMessageWithDelay(L.dataUnavailable);
    }
  }

  async function respondWithDoctors() {
    const L = LANG[currentLang];
    if (cachedDoctors.length) {
      const list = cachedDoctors.map((d, i) => `${i + 1}. ${d.name} (${d.specialty})`).join('\n');
      addBotMessageWithDelay(`${L.doctors}\n${list}`);
      setContextQuickReplies(['Book Appointment', 'Departments']);
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
      const list = docs.map((d, i) => `${i + 1}. ${d.name} (${d.specialty})`).join('\n');
      addBotMessageWithDelay(`${L.doctors}\n${list}`);
      setContextQuickReplies(['Book Appointment', 'Departments']);
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
    renderQuickReplies(LANG[lang].quickReplies);
  }

  // ---- SEND HANDLER ----
  function handleUserText(text) {
    const msg = text.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    processMessage(msg);
  }

  // ---- CLEAR CHAT ----
  function clearChat() {
    document.getElementById('ibn-bot-messages').innerHTML = '';
    addMessage(LANG[currentLang].welcome, 'bot');
    addMessage(LANG[currentLang].prompt, 'bot');
    renderQuickReplies(LANG[currentLang].quickReplies);
    appointmentStep = null;
    appointmentData = { name: '', phone: '', department: '', preferredTime: '' };
  }

  // ---- INIT ----
  function init() {
    injectStyles();
    injectHTML();
    renderQuickReplies(LANG[currentLang].quickReplies);

    const fab = document.getElementById('ibn-bot-fab');
    const win = document.getElementById('ibn-bot-window');
    const close = document.getElementById('ibn-bot-close');
    const send = document.getElementById('ibn-bot-send');
    const input = document.getElementById('ibn-bot-input');
    const langBtns = document.querySelectorAll('.ibn-bot-lang button');
    const callBtn = document.getElementById('ibn-bot-call');
    const clearBtn = document.getElementById('ibn-bot-clear');

    function openWindow() {
      win.style.display = 'flex';
      if (document.getElementById('ibn-bot-messages').children.length === 0) {
        addMessage(LANG[currentLang].welcome, 'bot');
        addMessage(LANG[currentLang].prompt, 'bot');
        renderQuickReplies(LANG[currentLang].quickReplies);
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
    callBtn.addEventListener('click', () => { window.location.href = 'tel:9622552553'; });
    clearBtn.addEventListener('click', clearChat);

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

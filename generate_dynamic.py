import csv
import io
import urllib.request
from pathlib import Path
import datetime
import re
import json
import hashlib
import html as html_mod
from urllib.parse import quote

# ========== CONFIGURATION ==========
INDEXNOW_KEY = "78ee931b79be4739af08e1e0b0af036f"
HOST = "ibnsinahospital.in"
INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

DOCTORS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_H8Rgr6VOjrap91SR_3nbBQLVf7QOQOHqZSs-pT6SfoNpyHjpj-QD0nNtcHDr5ip439naZ0sTr62Y/pub?output=csv"
BLOG_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRyksX4tU5UEPKPVbRGUiCe7lXxS-Z0WqSgB1vghBBqEvddzZ9M5ZSMtvfoCFPXRZoLojgWjIEmbQH8/pub?output=csv"
DEPARTMENTS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSY7cmsIsfCzFSfe6Gf6wG-XWffYscBhXHqnFqv0RvwuqbG7kNnPG7eSmSaR_E-ztlY8qLkHZ2yuL-t/pub?output=csv"
GALLERY_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3ipvIHQSd0uvYjhDFrlMhG7nF5J9FKMPxB60sb9mrGWd-PiiTrmeMwqhPEUOXn8KI-MPov0hbAjSu/pub?output=csv"
UPDATES_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZW6V9At9Nb8LCupYha92UshFV5P6sbSKAOJmDoaZR6IbZyFoJorhEyJPcq5zscDdTSC_B39-j1RW5/pub?output=csv"

SITE_URL = "https://ibnsinahospital.in"
LASTMOD_CACHE_FILE = Path("lastmod_cache.json")
GALLERY_TEMPLATE_PATH = Path('gallery_template.html')

# Department name (from Google Sheet) -> actual department-pages/*.html slug
# Fixes common data-source typos so doctor pages don't link to 404 pages.
DEPT_SLUG_OVERRIDES = {
    'optholmology': 'ophthalmology',
    'ophthalmology': 'ophthalmology',
    'orthropedics & joint replacement': 'orthopaedics',
    'orthropedics-joint-replacement': 'orthopaedics',
    'orthopedics & joint replacement': 'orthopaedics',
    'orthopedics': 'orthopaedics',
    'orthopaedics': 'orthopaedics',
    'gynecology': 'gynaecology',
    'gynaecology': 'gynaecology',
    'pediatric surgery': 'pediatric-surgery',
    'pediatrics': 'pediatric-surgery',
    'general surgery': 'general-surgery',
    'general medicine': 'general-medicine',
    'plastic surgery': 'plastic-surgery',
    'ent': 'ent',
    'urology': 'urology',
    'gastroenterology': 'gastroenterology',
    'cardiology': 'cardiology',
    'nephrology': 'nephrology',
    'radiology': 'radiology',
    'dermatology': 'dermatology',
    'pulmonology': 'pulmonology',
    'rheumatology': 'rheumatology',
    'physiotherapy': 'physiotherapy',
    'dentistry': 'dentistry',
}

# ========== FETCH CSV ==========
def fetch_csv(url):
    with urllib.request.urlopen(url) as response:
        content = response.read().decode('utf-8')
    return list(csv.DictReader(io.StringIO(content)))

# ========== HELPERS ==========
def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text

def resolve_dept_slug(dept_name):
    """Map data-source department spellings to actual department page slug."""
    key = (dept_name or '').strip().lower()
    if key in DEPT_SLUG_OVERRIDES:
        return DEPT_SLUG_OVERRIDES[key]
    return slugify(dept_name)

def clean_name(raw_name):
    name = (raw_name or '').strip().rstrip('.')
    name = re.sub(r'^dr\.?\s*', '', name, flags=re.IGNORECASE).strip()
    name = ' '.join(w.capitalize() for w in name.split())
    return f"Dr. {name}" if name else "Doctor"

def first_name_of(full_clean_name):
    parts = full_clean_name.replace('Dr.', '').strip().split()
    return parts[0] if parts else "the doctor"

def build_about(doc, full_name):
    about = (doc.get('about') or '').strip()
    if about:
        return about

    first_name = first_name_of(full_name)
    specialty = (doc.get('specialty') or '').strip().lower()
    department = (doc.get('department') or '').strip().title()
    qualifications = (doc.get('qualifications') or '').strip()
    qual_line = f" ({qualifications})" if qualifications else ""

    return (
        f"{full_name}{qual_line} is a {specialty} at Ibn Sina Hospital, Budgam, "
        f"heading the {department} department. {first_name} combines clinical "
        f"precision with a warm, patient-first approach, providing dependable "
        f"{specialty} care to patients across the Kashmir Valley."
    )

# ========== LASTMOD CACHE (content-based) ==========
def load_lastmod_cache():
    if LASTMOD_CACHE_FILE.exists():
        return json.loads(LASTMOD_CACHE_FILE.read_text(encoding='utf-8'))
    return {}

def save_lastmod_cache(cache):
    LASTMOD_CACHE_FILE.write_text(json.dumps(cache, indent=2), encoding='utf-8')

def get_lastmod(url, content, cache, today):
    content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
    entry = cache.get(url)
    if entry and entry.get('hash') == content_hash:
        return entry['lastmod']
    cache[url] = {'hash': content_hash, 'lastmod': today}
    return today

# ========== SAVE JSON DATA ==========
def save_json_data(doctors, departments, posts, gallery_items, updates):
    data_dir = Path('data')
    data_dir.mkdir(exist_ok=True)
    (data_dir / 'doctors.json').write_text(json.dumps(doctors, ensure_ascii=False), encoding='utf-8')
    (data_dir / 'departments.json').write_text(json.dumps(departments, ensure_ascii=False), encoding='utf-8')
    (data_dir / 'blog.json').write_text(json.dumps(posts, ensure_ascii=False), encoding='utf-8')
    (data_dir / 'gallery.json').write_text(json.dumps(gallery_items, ensure_ascii=False), encoding='utf-8')
    (data_dir / 'updates.json').write_text(json.dumps(updates, ensure_ascii=False), encoding='utf-8')
    print(f"Wrote JSON data files: {len(doctors)} doctors, {len(departments)} departments, "
          f"{len(posts)} blog posts, {len(gallery_items)} gallery items, {len(updates)} updates.")

# ========== GENERATE DOCTOR PAGES (PREMIUM, SEO-COMPLETE) ==========
def generate_doctor_pages(doctors, departments_by_name):
    output_dir = Path('doctors')
    output_dir.mkdir(exist_ok=True)
    dept_dir = Path('department-pages')
    urls = []
    pages = []

    for doc in doctors:
        full_name = clean_name(doc.get('name', ''))
        slug = slugify(doc.get('name', ''))
        filename = f'doctor-{slug}.html'
        dept_name = (doc.get('department') or '').strip()
        dept_slug = resolve_dept_slug(dept_name)
        specialty = (doc.get('specialty') or 'Doctor').strip()
        qualifications = (doc.get('qualifications') or '').strip()
        photo_url = (doc.get('photo_url') or 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp').strip()
        about_text = build_about(doc, full_name)

        # ---- HTML-escape every value inserted into visible HTML ----
        full_name_e = html_mod.escape(full_name)
        specialty_e = html_mod.escape(specialty)
        specialty_title_e = html_mod.escape(specialty.title())
        qualifications_e = html_mod.escape(qualifications)
        dept_name_title_e = html_mod.escape(dept_name.title())
        about_text_e = html_mod.escape(about_text)
        photo_url_e = html_mod.escape(photo_url, quote=True)

        title = f"{full_name} | {specialty.title()} | Ibn Sina Hospital, Budgam"
        description = (
            f"{full_name} is a {specialty} at Ibn Sina Hospital, Budgam. "
            f"View qualifications, department and book an appointment."
        )
        page_url = f'{SITE_URL}/doctors/{filename}'
        appointment_link = f"../appointment.html?doctor={quote(full_name)}"

        # ---- Photo block (precomputed to avoid nested f-strings) ----
        has_photo = bool(photo_url) and photo_url != 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp'
        if has_photo:
            photo_block = (
                f'<img src="{photo_url_e}" '
                f'alt="{full_name_e} - {specialty_e} at Ibn Sina Hospital" '
                f'width="180" height="180" loading="eager">'
            )
        else:
            photo_block = '<div class="no-img">👨‍⚕️</div>'

        # ---- Department link (only render if the page actually exists) ----
        dept_link_html = ""
        dept_page_file = dept_dir / f'{dept_slug}.html'
        if dept_name and dept_page_file.exists():
            dept_link_html = (
                f'<div class="hero-dept">Department: '
                f'<a href="../department-pages/{dept_slug}.html">{dept_name_title_e}</a>'
                f'</div>'
            )
        elif dept_name:
            # Fallback — no link if the page doesn't exist yet
            dept_link_html = f'<div class="hero-dept">Department: {dept_name_title_e}</div>'

        # ---- Related doctors in same department ----
        same_dept_doctors = [
            d for d in doctors
            if (d.get('department') or '').strip().lower() == dept_name.lower()
            and (d.get('name') or '') != doc.get('name', '')
        ][:4]

        related_doctors_html = ""
        if same_dept_doctors:
            items = "".join(
                f'''
                <div class="related-doctor-card">
                    <a href="doctor-{slugify(d.get('name',''))}.html">
                        <div class="related-avatar">👨‍⚕️</div>
                        <div>
                            <strong>{html_mod.escape(clean_name(d.get('name','')))}</strong>
                            <span class="related-specialty">{html_mod.escape((d.get('specialty') or '').title())}</span>
                        </div>
                    </a>
                </div>
                '''
                for d in same_dept_doctors
            )
            related_doctors_html = f'''
            <div class="related-doctors-section">
                <h3>Other {dept_name_title_e} Specialists</h3>
                <div class="related-doctors-grid">{items}</div>
            </div>
            '''

        # ---- JSON-LD: Physician ----
        json_ld_physician = {
            "@context": "https://schema.org",
            "@type": "Physician",
            "name": full_name,
            "medicalSpecialty": specialty,
            "worksFor": {
                "@type": "Hospital",
                "name": "Ibn Sina Hospital",
                "url": SITE_URL,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Near Railway Station, Ompora Railway Station Road, Ompora",
                    "addressLocality": "Budgam",
                    "addressRegion": "Jammu and Kashmir",
                    "postalCode": "191111",
                    "addressCountry": "IN"
                },
                "telephone": "+919622552553",
                "areaServed": [
                    {"@type": "City", "name": "Budgam"},
                    {"@type": "City", "name": "Srinagar"},
                    {"@type": "City", "name": "Ompora"},
                    {"@type": "City", "name": "Ganderbal"},
                    {"@type": "City", "name": "Pulwama"},
                    {"@type": "City", "name": "Shopian"},
                    {"@type": "City", "name": "Kulgam"},
                    {"@type": "City", "name": "Baramulla"},
                    {"@type": "City", "name": "Anantnag"}
                ]
            },
            "url": page_url,
            "image": photo_url,
            "description": about_text[:160]
        }
        if qualifications:
            json_ld_physician["hasCredential"] = qualifications

        # ---- JSON-LD: BreadcrumbList ----
        json_ld_breadcrumb = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_URL}/"},
                {"@type": "ListItem", "position": 2, "name": "Doctors", "item": f"{SITE_URL}/doctors.html"},
                {"@type": "ListItem", "position": 3, "name": full_name, "item": page_url}
            ]
        }

        # ======================= PREMIUM HTML TEMPLATE =======================
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="{page_url}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:type" content="profile">
    <meta property="og:url" content="{page_url}">
    <meta property="og:image" content="{photo_url_e}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{photo_url_e}">
    <link rel="icon" type="image/webp" href="https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/mobile-fix.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">{json.dumps(json_ld_physician, ensure_ascii=False)}</script>
    <script type="application/ld+json">{json.dumps(json_ld_breadcrumb, ensure_ascii=False)}</script>

    <!-- ========== PREMIUM DOCTOR PROFILE STYLES ========== -->
    <style>
        .doctor-profile-page {{
            --doc-green: #2d4a2b;
            --doc-gold: #c9b99a;
            --doc-bg: #f8faf6;
        }}

        .doctor-profile-page .breadcrumb-premium {{
            font-size: 0.85rem;
            font-weight: 500;
            color: #71806d;
            padding: 1rem 0;
        }}
        .doctor-profile-page .breadcrumb-premium a {{
            color: var(--doc-green);
            text-decoration: none;
        }}
        .doctor-profile-page .breadcrumb-premium a:hover {{
            text-decoration: underline;
        }}
        .doctor-profile-page .breadcrumb-premium span {{
            margin: 0 6px;
            color: #a4ac86;
        }}

        .doctor-profile-page .profile-hero {{
            display: flex;
            flex-wrap: wrap;
            gap: 40px;
            background: linear-gradient(145deg, #f5f8f2, #eaf1e6);
            border-radius: 28px;
            padding: 40px 40px 30px;
            margin: 0 0 30px 0;
            border: 1px solid rgba(164, 172, 134, 0.2);
            box-shadow: 0 10px 40px rgba(45, 74, 43, 0.04);
            align-items: center;
        }}
        .doctor-profile-page .profile-hero .hero-image {{
            flex: 0 0 180px;
            text-align: center;
        }}
        .doctor-profile-page .profile-hero .hero-image img {{
            width: 180px;
            height: 180px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #ffffff;
            box-shadow: 0 12px 30px rgba(45, 74, 43, 0.12);
        }}
        .doctor-profile-page .profile-hero .hero-image .no-img {{
            width: 180px;
            height: 180px;
            border-radius: 50%;
            background: linear-gradient(135deg, #eaf1e6, #d4dfcd);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            border: 4px solid #ffffff;
            box-shadow: 0 12px 30px rgba(45, 74, 43, 0.12);
            margin: 0 auto;
        }}
        .doctor-profile-page .profile-hero .hero-text {{
            flex: 1;
        }}
        .doctor-profile-page .profile-hero .hero-text h1 {{
            font-family: 'Poppins', sans-serif;
            font-size: clamp(1.8rem, 3.5vw, 2.8rem);
            color: var(--doc-green);
            margin-bottom: 0.2rem;
            letter-spacing: -0.02em;
        }}
        .doctor-profile-page .profile-hero .hero-text .hero-specialty {{
            font-size: 1.1rem;
            font-weight: 700;
            color: #82907d;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.3rem;
        }}
        .doctor-profile-page .profile-hero .hero-text .hero-qual {{
            font-size: 0.95rem;
            color: #5a6b4a;
            margin-bottom: 0.5rem;
        }}
        .doctor-profile-page .profile-hero .hero-text .hero-dept {{
            font-size: 0.9rem;
            color: #4e5c4a;
            margin-bottom: 1rem;
        }}
        .doctor-profile-page .profile-hero .hero-text .hero-dept a {{
            color: var(--doc-green);
            font-weight: 700;
            text-decoration: none;
            border-bottom: 2px solid var(--doc-gold);
            padding-bottom: 2px;
        }}
        .doctor-profile-page .profile-hero .hero-text .hero-dept a:hover {{
            border-bottom-color: var(--doc-green);
        }}
        .doctor-profile-page .profile-hero .hero-text .hero-actions {{
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 0.5rem;
        }}
        .doctor-profile-page .profile-hero .hero-text .btn-appointment-hero {{
            display: inline-block;
            padding: 12px 32px;
            border-radius: 60px;
            background: var(--doc-green);
            color: #ffffff;
            text-decoration: none;
            font-weight: 700;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }}
        .doctor-profile-page .profile-hero .hero-text .btn-appointment-hero:hover {{
            background: #1d321c;
            transform: scale(1.02);
            box-shadow: 0 8px 20px rgba(45, 74, 43, 0.2);
        }}
        .doctor-profile-page .profile-hero .hero-text .btn-secondary-hero {{
            display: inline-block;
            padding: 12px 32px;
            border-radius: 60px;
            background: transparent;
            color: var(--doc-green);
            border: 2px solid var(--doc-green);
            text-decoration: none;
            font-weight: 700;
            transition: all 0.3s ease;
        }}
        .doctor-profile-page .profile-hero .hero-text .btn-secondary-hero:hover {{
            background: var(--doc-green);
            color: #ffffff;
        }}

        .doctor-profile-page .profile-layout {{
            display: grid;
            grid-template-columns: minmax(0, 1fr) 300px;
            gap: 40px;
            margin: 30px 0;
            align-items: start;
        }}
        .doctor-profile-page .profile-content {{
            min-width: 0;
        }}
        .doctor-profile-page .profile-sidebar {{
            position: sticky;
            top: 100px;
        }}

        .doctor-profile-page .bio-card {{
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 30px rgba(45, 74, 43, 0.04);
            margin-bottom: 30px;
        }}
        .doctor-profile-page .bio-card h2 {{
            font-family: 'Poppins', sans-serif;
            color: var(--doc-green);
            font-size: 1.4rem;
            margin-bottom: 0.5rem;
            position: relative;
        }}
        .doctor-profile-page .bio-card h2::after {{
            content: '';
            display: block;
            width: 40px;
            height: 4px;
            background: var(--doc-gold);
            border-radius: 4px;
            margin-top: 6px;
        }}
        .doctor-profile-page .bio-card p {{
            color: #4e5c4a;
            line-height: 1.8;
            font-size: 1.02rem;
        }}
        .doctor-profile-page .bio-card .dept-link {{
            color: var(--doc-green);
            font-weight: 700;
            text-decoration: none;
            border-bottom: 2px solid var(--doc-gold);
            padding-bottom: 2px;
        }}
        .doctor-profile-page .bio-card .dept-link:hover {{
            border-bottom-color: var(--doc-green);
        }}

        .doctor-profile-page .related-doctors-section {{
            background: rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(4px);
            border-radius: 16px;
            padding: 24px;
            border: 1px solid #edf3e9;
        }}
        .doctor-profile-page .related-doctors-section h3 {{
            font-family: 'Poppins', sans-serif;
            color: var(--doc-green);
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }}
        .doctor-profile-page .related-doctors-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }}
        .doctor-profile-page .related-doctor-card {{
            background: #ffffff;
            border-radius: 12px;
            padding: 12px;
            border: 1px solid #edf3e9;
            transition: all 0.25s ease;
        }}
        .doctor-profile-page .related-doctor-card:hover {{
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(45, 74, 43, 0.06);
            border-color: var(--doc-green);
        }}
        .doctor-profile-page .related-doctor-card a {{
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            color: #2d4a2b;
        }}
        .doctor-profile-page .related-doctor-card .related-avatar {{
            font-size: 2rem;
            flex-shrink: 0;
        }}
        .doctor-profile-page .related-doctor-card strong {{
            display: block;
            font-size: 0.85rem;
            line-height: 1.2;
        }}
        .doctor-profile-page .related-doctor-card .related-specialty {{
            display: block;
            font-size: 0.7rem;
            color: #82907d;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }}

        .doctor-profile-page .sidebar-card {{
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 8px 30px rgba(45, 74, 43, 0.04);
        }}
        .doctor-profile-page .sidebar-card h3 {{
            font-family: 'Poppins', sans-serif;
            color: var(--doc-green);
            font-size: 1.05rem;
            margin-bottom: 0.8rem;
        }}
        .doctor-profile-page .sidebar-card .cta-btn {{
            display: block;
            width: 100%;
            padding: 14px;
            border-radius: 60px;
            background: var(--doc-green);
            color: #ffffff;
            text-align: center;
            text-decoration: none;
            font-weight: 700;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }}
        .doctor-profile-page .sidebar-card .cta-btn:hover {{
            background: #1d321c;
            transform: scale(1.02);
            box-shadow: 0 8px 20px rgba(45, 74, 43, 0.2);
        }}
        .doctor-profile-page .sidebar-card .emergency-phone {{
            display: block;
            text-align: center;
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--doc-green);
            text-decoration: none;
            margin-top: 0.5rem;
        }}
        .doctor-profile-page .sidebar-card .emergency-phone:hover {{
            text-decoration: underline;
        }}
        .doctor-profile-page .sidebar-card .quick-links {{
            list-style: none;
            padding: 0;
            margin: 0;
        }}
        .doctor-profile-page .sidebar-card .quick-links li {{
            padding: 8px 0;
            border-bottom: 1px solid #edf3e9;
        }}
        .doctor-profile-page .sidebar-card .quick-links li:last-child {{
            border-bottom: none;
        }}
        .doctor-profile-page .sidebar-card .quick-links a {{
            color: #4e5c4a;
            text-decoration: none;
            transition: color 0.2s ease;
        }}
        .doctor-profile-page .sidebar-card .quick-links a:hover {{
            color: var(--doc-green);
            text-decoration: underline;
        }}

        /* --- Explore Section --- */
        .doctor-profile-page .explore-section {{
            padding: 30px 0 10px;
        }}
        .doctor-profile-page .explore-section h2 {{
            font-family: 'Poppins', sans-serif;
            color: var(--doc-green);
            text-align: center;
            margin-bottom: 0.5rem;
        }}
        .doctor-profile-page .explore-section .section-subtitle {{
            text-align: center;
            color: #4e5c4a;
            max-width: 700px;
            margin: 0 auto 1.5rem;
        }}
        .doctor-profile-page .explore-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
        }}
        .doctor-profile-page .explore-card {{
            background: #fff;
            border: 1px solid #e2e8df;
            border-radius: 14px;
            padding: 18px 20px;
            transition: all 0.3s ease;
            text-decoration: none;
            display: block;
            box-shadow: 0 4px 12px rgba(45, 74, 43, 0.03);
        }}
        .doctor-profile-page .explore-card:hover {{
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(45, 74, 43, 0.08);
            border-color: #a4ac86;
        }}
        .doctor-profile-page .explore-card h3 {{
            color: #2d4a2b;
            font-size: 1rem;
            margin-bottom: 0.3rem;
            font-family: 'Poppins', sans-serif;
        }}
        .doctor-profile-page .explore-card p {{
            color: #5a6b4a;
            font-size: 0.85rem;
            line-height: 1.5;
            margin-bottom: 0;
        }}
        .doctor-profile-page .explore-card .explore-icon {{
            font-size: 1.4rem;
            margin-bottom: 0.4rem;
            display: block;
        }}

        /* --- Areas We Serve --- */
        .doctor-profile-page .areas-serve-premium {{
            background: linear-gradient(145deg, #f5f8f2, #ecf2e8);
            border-radius: 24px;
            padding: 30px 24px;
            border: 1px solid #e2e8df;
            margin: 30px 0;
            text-align: center;
        }}
        .doctor-profile-page .areas-serve-premium .badge-list {{
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
        }}
        .doctor-profile-page .areas-serve-premium .badge-list span {{
            background: #ffffff;
            padding: 8px 22px;
            border-radius: 60px;
            font-size: 0.85rem;
            font-weight: 600;
            color: #2d4a2b;
            border: 1px solid #dce4d6;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }}
        .doctor-profile-page .areas-serve-premium .badge-list span.strong-badge {{
            background: #2d4a2b;
            color: #ffffff;
            border-color: #2d4a2b;
        }}

        @media (max-width: 900px) {{
            .doctor-profile-page .profile-layout {{
                grid-template-columns: 1fr;
            }}
            .doctor-profile-page .profile-sidebar {{
                position: static;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }}
            .doctor-profile-page .profile-hero {{
                flex-direction: column;
                text-align: center;
                padding: 30px 20px;
            }}
            .doctor-profile-page .profile-hero .hero-image {{
                flex: 0 0 auto;
            }}
            .doctor-profile-page .profile-hero .hero-text .hero-actions {{
                justify-content: center;
            }}
            .doctor-profile-page .related-doctors-grid {{
                grid-template-columns: 1fr;
            }}
        }}
        @media (max-width: 650px) {{
            .doctor-profile-page .profile-sidebar {{
                grid-template-columns: 1fr;
            }}
            .doctor-profile-page .profile-hero .hero-image img {{
                width: 140px;
                height: 140px;
            }}
            .doctor-profile-page .bio-card {{
                padding: 20px;
            }}
        }}
    </style>

</head>
<body class="doctor-profile-page">

    <!-- ===== HEADER ===== -->
    <header class="site-header" id="site-header">
        <div class="header-inner container">
            <a href="../index.html" class="logo" aria-label="Ibn Sina Hospital Home">
                <img src="https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp" alt="Ibn Sina Hospital Logo" class="logo-img" style="height: 40px; width: auto;">
                <span class="logo-text">Ibn Sina <strong>Hospital</strong></span>
            </a>
            <nav class="main-nav" id="main-nav" aria-label="Main navigation">
                <ul class="nav-list">
                    <li><a href="../index.html" class="nav-link">Home</a></li>
                    <li><a href="../about.html" class="nav-link">About</a></li>
                    <li><a href="../services.html" class="nav-link">Services</a></li>
                    <li><a href="../health-checkup-packages.html" class="nav-link">Health Checkups</a></li>
                    <li><a href="../doctors.html" class="nav-link active">Doctors</a></li>
                    <li><a href="../gallery.html" class="nav-link">Gallery</a></li>
                    <li><a href="../insurance-pmjay.html" class="nav-link">PM-JAY / Insurance</a></li>
                    <li><a href="../blog.html" class="nav-link">Blog</a></li>
                    <li><a href="../careers.html" class="nav-link">Careers</a></li>
                    <li><a href="../faq.html" class="nav-link">FAQ</a></li>
                    <li><a href="../contact.html" class="nav-link">Contact</a></li>
                </ul>
            </nav>
            <div class="header-actions">
                <a href="tel:9622552553" class="emergency-badge" aria-label="Emergency call: 9622552553">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z"/></svg>
                    <span>Emergency: 9622552553</span>
                </a>
                <a href="../appointment.html" class="btn btn-primary btn-book">Book Appointment</a>
                <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                    <span class="hamburger-line"></span>
                </button>
            </div>
        </div>
    </header>

    <!-- ===== MAIN CONTENT ===== -->
    <main id="main-content" class="container" style="padding: 0 20px;">

        <!-- Breadcrumb -->
        <nav class="breadcrumb-premium" aria-label="Breadcrumb">
            <a href="../index.html">Home</a>
            <span>›</span>
            <a href="../doctors.html">Doctors</a>
            <span>›</span>
            <span>{full_name_e}</span>
        </nav>

        <!-- ===== PROFILE HERO ===== -->
        <section class="profile-hero">
            <div class="hero-image">
                {photo_block}
            </div>
            <div class="hero-text">
                <h1>{full_name_e}</h1>
                <div class="hero-specialty">{specialty_title_e}</div>
                <div class="hero-qual">{qualifications_e}</div>
                {dept_link_html}
                <div class="hero-actions">
                    <a href="{appointment_link}" class="btn-appointment-hero">📅 Book Appointment</a>
                    <a href="tel:9622552553" class="btn-secondary-hero">📞 Call Hospital</a>
                </div>
            </div>
        </section>

        <!-- ===== PROFILE LAYOUT ===== -->
        <div class="profile-layout">

            <!-- CONTENT COLUMN -->
            <div class="profile-content">

                <div class="bio-card">
                    <h2>About {full_name_e}</h2>
                    <p>{about_text_e}</p>
                    {f'<p style="margin-top: 1rem;"><a href="../department-pages/{dept_slug}.html" class="dept-link">View {dept_name_title_e} Department →</a></p>' if (dept_name and dept_page_file.exists()) else ''}
                </div>

                {related_doctors_html}

            </div>

            <!-- SIDEBAR -->
            <aside class="profile-sidebar">

                <div class="sidebar-card" style="background: linear-gradient(145deg, #2d4a2b, #1d321c); color: #ffffff; border: none;">
                    <h3 style="color: #ffffff;">📋 Book an Appointment</h3>
                    <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">
                        Consult with {full_name_e} at Ibn Sina Hospital, Budgam.
                    </p>
                    <a href="{appointment_link}" class="cta-btn" style="background: #ffffff; color: #2d4a2b; display: block; text-align: center; padding: 14px; border-radius: 60px; font-weight: 700; text-decoration: none;">Book Now</a>
                </div>

                <div class="sidebar-card">
                    <h3>🚑 Emergency</h3>
                    <p style="color: #4e5c4a; font-size: 0.9rem; margin-bottom: 0.5rem;">
                        For urgent medical help, call:
                    </p>
                    <a href="tel:9622552553" class="emergency-phone">📞 9622552553</a>
                    <p style="font-size: 0.75rem; color: #82907d; margin-top: 0.5rem; text-align: center;">Available 24/7, 365 days</p>
                </div>

                <div class="sidebar-card">
                    <h3>Quick Links</h3>
                    <ul class="quick-links">
                        <li><a href="../doctors.html">All Doctors</a></li>
                        <li><a href="../department-pages/specialties-directory.html">All Specialties</a></li>
                        <li><a href="../services.html">Our Services</a></li>
                        <li><a href="../health-checkup-packages.html">Health Checkups</a></li>
                        <li><a href="../insurance-pmjay.html">PM-JAY / Insurance</a></li>
                        <li><a href="../appointment.html">Book Appointment</a></li>
                        <li><a href="../contact.html">Contact Us</a></li>
                        <li><a href="../faq.html">FAQs</a></li>
                    </ul>
                </div>

            </aside>

        </div>

        <!-- ===== EXPLORE IBN SINA HOSPITAL (Internal Linking) ===== -->
        <section class="explore-section">
            <h2>Explore Ibn Sina Hospital</h2>
            <p class="section-subtitle">
                Learn more about our doctors, departments, and patient resources.
            </p>
            <div class="explore-grid">
                <a href="../doctors.html" class="explore-card">
                    <span class="explore-icon">👨‍⚕️</span>
                    <h3>All Doctors</h3>
                    <p>Browse our consultant-led team across 20+ specialties.</p>
                </a>
                <a href="../department-pages/specialties-directory.html" class="explore-card">
                    <span class="explore-icon">📋</span>
                    <h3>All Departments</h3>
                    <p>Explore clinical, surgical, and diagnostic specialties.</p>
                </a>
                <a href="../services.html" class="explore-card">
                    <span class="explore-icon">🩺</span>
                    <h3>Hospital Services</h3>
                    <p>Diagnostics, emergency care, dialysis, and inpatient facilities.</p>
                </a>
                <a href="../health-checkup-packages.html" class="explore-card">
                    <span class="explore-icon">💊</span>
                    <h3>Health Checkups</h3>
                    <p>Preventive packages to detect health risks early.</p>
                </a>
                <a href="../insurance-pmjay.html" class="explore-card">
                    <span class="explore-icon">📄</span>
                    <h3>PM-JAY / Insurance</h3>
                    <p>Cashless treatment under Ayushman Bharat PM-JAY.</p>
                </a>
                <a href="../blog.html" class="explore-card">
                    <span class="explore-icon">📰</span>
                    <h3>Health Blog</h3>
                    <p>Trusted health articles from our medical team.</p>
                </a>
            </div>
        </section>

        <!-- ===== AREAS WE SERVE ===== -->
        <section class="areas-serve-premium">
            <p style="font-weight: 700; color: #2d4a2b; margin: 0 0 12px; font-size: 1.1rem;">
                🌍 Serving Families Across J&amp;K &amp; India
            </p>
            <div class="badge-list">
                <span>Budgam</span>
                <span>Srinagar</span>
                <span>Ompora</span>
                <span>Ganderbal</span>
                <span>Pulwama</span>
                <span>Shopian</span>
                <span>Kulgam</span>
                <span class="strong-badge">Jammu &amp; Kashmir</span>
                <span class="strong-badge">India</span>
            </div>
            <div style="margin-top: 14px; font-size: 0.9rem;">
                <a href="../service-areas.html" style="color: #2d4a2b; text-decoration: underline;">View all service areas</a>
                <span style="margin:0 0.5rem;">|</span>
                <a href="../contact.html" style="color: #2d4a2b; text-decoration: underline;">Get directions</a>
            </div>
        </section>

    </main>

    <!-- ===== FOOTER ===== -->
    <footer class="site-footer">
        <div class="footer-wave" aria-hidden="true">
            <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0 25 C360 50 720 0 1080 25 C1260 38 1380 20 1440 25 L1440 0 L0 0 Z" fill="#2d4a2b"/></svg>
        </div>
        <div class="footer-main container">
            <div class="footer-col">
                <h3 class="footer-logo">Ibn Sina <strong>Hospital</strong></h3>
                <address>Near Railway Station, Ompora Railway Station Road, Ompora, Budgam, J&K 191111</address>
                <p><a href="tel:9622552553">📞 9622552553 / 9419023501</a></p>
                <p><a href="mailto:weibnsina@gmail.com">✉ weibnsina@gmail.com</a></p>
                <p style="margin-top:0.5rem; font-size:0.85rem; color:#71806d;">
                    <strong>Service Areas:</strong> Budgam, Srinagar, Ompora, Ganderbal, Pulwama, Shopian, Kulgam –
                    across <strong>Jammu &amp; Kashmir</strong> &amp; <strong>India</strong>
                </p>
            </div>
            <div class="footer-col">
                <h4>OPD &amp; Emergency</h4>
                <p class="footer-note"><strong>OPD, Pharmacy, Lab &amp; Emergency:</strong> 24/7, 365 days</p>
            </div>
            <div class="footer-col">
                <h4>Quick Links</h4>
                <ul class="footer-links">
                    <li><a href="../index.html">Home</a></li>
                    <li><a href="../about.html">About Us</a></li>
                    <li><a href="../services.html">Services</a></li>
                    <li><a href="../health-checkup-packages.html">Health Checkup Packages</a></li>
                    <li><a href="../doctors.html">Doctors</a></li>
                    <li><a href="../gallery.html">Gallery</a></li>
                    <li><a href="../insurance-pmjay.html">PM-JAY / Insurance</a></li>
                    <li><a href="../blog.html">Blog</a></li>
                    <li><a href="../careers.html">Careers</a></li>
                    <li><a href="../faq.html">FAQ</a></li>
                    <li><a href="../contact.html">Contact</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Stay Connected</h4>
                <div class="social-icons">
                    <a href="https://www.facebook.com/share/1HSWNC9UEy/" target="_blank" rel="noopener" aria-label="Facebook" class="social-icon">FB</a>
                    <a href="https://www.instagram.com/ibn_sinahospital?igsi=MWhmaXljcWFyOXV4eQ==" target="_blank" rel="noopener" aria-label="Instagram" class="social-icon">IG</a>
                    <a href="https://youtube.com/@ibnsinahospitalkashmir?si=PYC_n1XvWVmxhS8r" target="_blank" rel="noopener" aria-label="YouTube" class="social-icon">YT</a>
                </div>
            </div>
        </div>
        <div class="footer-bottom container">
            <p>&copy; 2025 Ibn Sina Hospital. All rights reserved. | Operating since 2018</p>
            <p class="google-review-note">See our latest reviews on <a href="https://maps.google.com/?q=IBN+SINA+HOSPITAL+Ompora+Budgam" target="_blank" rel="noopener">Google Maps</a></p>
        </div>
    </footer>

    <script src="../js/main.js" defer></script>
    <script src="../js/chatbot.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
    <script src="../js/animations.js" defer></script>

</body>
</html>"""
        output_path = output_dir / filename
        output_path.write_text(html, encoding='utf-8')
        urls.append(page_url)
        pages.append((page_url, html))
        print(f"Generated premium doctor profile: {filename}")

    return urls, pages

# ========== GENERATE BLOG PAGES ==========
def generate_blog_pages(posts):
    output_dir = Path('blog')
    output_dir.mkdir(exist_ok=True)
    urls = []
    pages = []

    for post in posts:
        if post.get('is_published', '').strip().lower() not in ['true', 'yes', '1']:
            continue
        slug = slugify(post.get('slug') or post.get('title', ''))
        filename = f'blog-{slug}.html'
        page_url = f'{SITE_URL}/blog/{filename}'
        title = post.get('title', 'Blog Post')
        summary = post.get('short_summary', title)
        image = post.get('cover_image_url', 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp')

        title_e = html_mod.escape(title)
        summary_e = html_mod.escape(summary)
        image_e = html_mod.escape(image, quote=True)
        body = post.get('body', '')

        json_ld = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": summary,
            "image": image,
            "publisher": {
                "@type": "Hospital",
                "name": "Ibn Sina Hospital",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Budgam",
                    "addressRegion": "Jammu and Kashmir",
                    "addressCountry": "IN"
                }
            },
            "datePublished": post.get('published_at', '')
        }

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title_e} | Ibn Sina Hospital</title>
    <meta name="description" content="{summary_e}">
    <link rel="canonical" href="{page_url}">
    <meta property="og:title" content="{title_e} | Ibn Sina Hospital">
    <meta property="og:description" content="{summary_e}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{page_url}">
    <meta property="og:image" content="{image_e}">
    <link rel="stylesheet" href="../css/style.css">
    <script type="application/ld+json">{json.dumps(json_ld, ensure_ascii=False)}</script>
</head>
<body>
    <header class="site-header">
        <div class="header-inner container">
            <a href="../index.html" class="logo">Ibn Sina <strong>Hospital</strong></a>
            <nav class="main-nav"><ul class="nav-list">
                <li><a href="../index.html">Home</a></li>
                <li><a href="../blog.html">Blog</a></li>
                <li><a href="../contact.html">Contact</a></li>
            </ul></nav>
        </div>
    </header>
    <main class="section">
        <div class="container">
            <article>
                <h1>{title_e}</h1>
                <time>{post.get('published_at', '')}</time>
                <div class="blog-body">{body}</div>
            </article>
        </div>
    </main>
    <footer class="site-footer">
        <div class="footer-main container">
            <p>&copy; 2025 Ibn Sina Hospital, Budgam. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>"""
        output_path = output_dir / filename
        output_path.write_text(html, encoding='utf-8')
        urls.append(page_url)
        pages.append((page_url, html))

    return urls, pages

# ========== GENERATE DEPARTMENT PAGES ==========
def generate_department_pages(departments, doctors):
    output_dir = Path('departments')
    manual_dir = Path('department-pages')
    urls = []
    pages = []

    for dept in departments:
        dept_name = (dept.get('name') or '').strip()
        slug = resolve_dept_slug(dept.get('slug') or dept_name)

        # Skip the thin auto-generated page entirely when a hand-built,
        # fuller page already exists in department-pages/ for this slug.
        if (manual_dir / f'{slug}.html').exists():
            continue

        output_dir.mkdir(exist_ok=True)
        filename = f'department-{slug}.html'
        page_url = f'{SITE_URL}/departments/{filename}'
        title = f"{dept_name.title()} Department | Ibn Sina Hospital, Budgam"
        description = f"{dept_name.title()} department at Ibn Sina Hospital, Budgam — serving patients across Jammu and Kashmir with expert specialists."

        dept_doctors = [d for d in doctors if (d.get('department') or '').strip().lower() == dept_name.lower()]
        doctor_list_html = ""
        if dept_doctors:
            items = "".join(
                f'<li><a href="../doctors/doctor-{slugify(d.get("name",""))}.html">{clean_name(d.get("name",""))} — {(d.get("specialty") or "").title()}</a></li>'
                for d in dept_doctors
            )
            doctor_list_html = f'<div class="dept-doctors"><h2>Our {dept_name.title()} Specialists</h2><ul>{items}</ul></div>'

        json_ld = {
            "@context": "https://schema.org",
            "@type": "MedicalClinic",
            "name": f"{dept_name.title()} Department, Ibn Sina Hospital",
            "medicalSpecialty": dept_name.title(),
            "url": page_url,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Budgam",
                "addressRegion": "Jammu and Kashmir",
                "addressCountry": "IN"
            }
        }

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <link rel="canonical" href="{page_url}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <link rel="stylesheet" href="../css/style.css">
    <script type="application/ld+json">{json.dumps(json_ld, ensure_ascii=False)}</script>
</head>
<body>
    <header class="site-header">
        <div class="header-inner container">
            <a href="../index.html" class="logo">Ibn Sina <strong>Hospital</strong></a>
            <nav class="main-nav"><ul class="nav-list">
                <li><a href="../index.html">Home</a></li>
                <li><a href="../services.html">Services</a></li>
                <li><a href="../contact.html">Contact</a></li>
            </ul></nav>
        </div>
    </header>
    <main class="section">
        <div class="container">
            <h1>{dept_name.title()} Department</h1>
            <p>The {dept_name.title()} department at Ibn Sina Hospital, Budgam provides expert care to patients across Jammu and Kashmir.</p>
            {doctor_list_html}
            <a href="../doctors.html" class="btn btn-primary">View All Doctors</a>
        </div>
    </main>
    <footer class="site-footer">
        <div class="footer-main container">
            <p>&copy; 2025 Ibn Sina Hospital, Budgam. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>"""
        output_path = output_dir / filename
        output_path.write_text(html, encoding='utf-8')
        urls.append(page_url)
        pages.append((page_url, html))

    return urls, pages

# ========== GENERATE GALLERY PAGE ==========
def build_photo_items(items):
    html_items = []
    for item in items:
        img_url = (item.get('image_url') or '').strip()
        if not img_url:
            continue
        title = (item.get('title') or '').strip()
        alt_text = (item.get('alt_text') or '').strip() or title or "Ibn Sina Hospital, Budgam"
        html_items.append(
            f'<div class="photo-item">\n'
            f'    <img src="{html_mod.escape(img_url, quote=True)}" alt="{html_mod.escape(alt_text, quote=True)}" loading="lazy" width="400" height="300">\n'
            f'    <div class="photo-caption">{html_mod.escape(title)}</div>\n'
            f'</div>'
        )
    return '\n'.join(html_items)

def generate_gallery_page(gallery_items):
    def sort_key(item):
        try:
            return int(item.get('display_order') or 0)
        except ValueError:
            return 0

    sorted_items = sorted(gallery_items, key=sort_key)
    photo_html = build_photo_items(sorted_items)

    template = GALLERY_TEMPLATE_PATH.read_text(encoding='utf-8')
    output_html = template.replace('<!--PHOTO_ITEMS-->', photo_html)

    Path('gallery.html').write_text(output_html, encoding='utf-8')
    return f'{SITE_URL}/gallery.html', output_html

# ========== COLLECT MANUAL DEPARTMENT PAGES ==========
def collect_manual_department_pages():
    pages = []
    dept_dir = Path('department-pages')
    if not dept_dir.exists():
        return pages

    for html_file in dept_dir.glob('*.html'):
        content = html_file.read_text(encoding='utf-8')
        url = f"{SITE_URL}/department-pages/{html_file.name}"
        pages.append((url, content))
    return pages

# ========== UPDATE SITEMAP (content-aware lastmod) ==========
def update_sitemap(all_pages_with_content):
    cache = load_lastmod_cache()
    today = datetime.date.today().isoformat()

    static_urls = [
        f'{SITE_URL}/',
        f'{SITE_URL}/about.html',
        f'{SITE_URL}/services.html',
        f'{SITE_URL}/doctors.html',
        f'{SITE_URL}/gallery.html',
        f'{SITE_URL}/blog.html',
        f'{SITE_URL}/careers.html',
        f'{SITE_URL}/faq.html',
        f'{SITE_URL}/contact.html',
        f'{SITE_URL}/appointment.html',
    ]

    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>',
                 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']

    for url in static_urls:
        priority = "1.0" if url == f'{SITE_URL}/' else "0.7"
        xml_parts.append(
            f'  <url>\n    <loc>{url}</loc>\n    <lastmod>{today}</lastmod>'
            f'\n    <changefreq>weekly</changefreq>\n    <priority>{priority}</priority>\n  </url>'
        )

    for url, content in all_pages_with_content:
        lastmod = get_lastmod(url, content, cache, today)
        xml_parts.append(
            f'  <url>\n    <loc>{url}</loc>\n    <lastmod>{lastmod}</lastmod>'
            f'\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>'
        )

    xml_parts.append('</urlset>')
    Path('sitemap.xml').write_text('\n'.join(xml_parts), encoding='utf-8')
    save_lastmod_cache(cache)

# ========== INDEXNOW SUBMISSION ==========
def submit_to_indexnow(url_list):
    if not url_list:
        return
    data = {
        "host": HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": f"https://{HOST}/{INDEXNOW_KEY}.txt",
        "urlList": url_list
    }
    req = urllib.request.Request(
        INDEXNOW_ENDPOINT,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as response:
            print(f"IndexNow submitted {len(url_list)} URLs. Status: {response.status}")
    except Exception as e:
        print(f"IndexNow submission failed: {e}")

# ========== MAIN ==========
if __name__ == "__main__":
    print("Fetching doctors...")
    doctors = fetch_csv(DOCTORS_URL)
    print(f"Found {len(doctors)} doctors.")

    print("Fetching departments...")
    departments = fetch_csv(DEPARTMENTS_URL)
    print(f"Found {len(departments)} departments.")

    print("Fetching blog posts...")
    posts = fetch_csv(BLOG_URL)
    print(f"Found {len(posts)} blog posts.")

    print("Fetching gallery items...")
    gallery_items = fetch_csv(GALLERY_URL)
    print(f"Found {len(gallery_items)} gallery items.")

    print("Fetching updates...")
    updates = fetch_csv(UPDATES_URL)
    print(f"Found {len(updates)} updates.")

    save_json_data(doctors, departments, posts, gallery_items, updates)

    departments_by_name = {(d.get('name') or '').strip().lower(): d for d in departments}

    doctor_urls, doctor_pages = generate_doctor_pages(doctors, departments_by_name)
    blog_urls, blog_pages = generate_blog_pages(posts)
    dept_urls, dept_pages = generate_department_pages(departments, doctors)
    gallery_url, gallery_html = generate_gallery_page(gallery_items)

    manual_dept_pages = collect_manual_department_pages()
    print(f"Found {len(manual_dept_pages)} manual department pages.")

    all_dynamic_urls = doctor_urls + blog_urls + dept_urls + [gallery_url] + [url for url, _ in manual_dept_pages]
    all_pages_with_content = doctor_pages + blog_pages + dept_pages + [(gallery_url, gallery_html)] + manual_dept_pages

    update_sitemap(all_pages_with_content)
    submit_to_indexnow(all_dynamic_urls)

    print("Generation, sitemap update, and IndexNow submission complete.")
import csv
import io
import urllib.request
from pathlib import Path
import datetime
import re
import json
import hashlib
from urllib.parse import quote
from html import escape

# ========== CONFIGURATION ==========
INDEXNOW_KEY = "78ee931b79be4739af08e1e0b0af036f"
HOST = "ibnsinahospital.in"
INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

DOCTORS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_H8Rgr6VOjrap91SR_3nbBQLVf7QOQOHqZSs-pT6SfoNpyHjpj-QD0nNtcHDr5ip439naZ0sTr62Y/pub?output=csv"
BLOG_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRyksX4tU5UEPKPVbRGUiCe7lXxS-Z0WqSgB1vghBBqEvddzZ9M5ZSMtvfoCFPXRZoLojgWjIEmbQH8/pub?output=csv"
DEPARTMENTS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSY7cmsIsfCzFSfe6Gf6wG-XWffYscBhXHqnFqv0RvwuqbG7kNnPG7eSmSaR_E-ztlY8qLkHZ2yuL-t/pub?output=csv"
GALLERY_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3ipvIHQSd0uvYjhDFrlMhG7nF5J9FKMPxB60sb9mrGWd-PiiTrmeMwqhPEUOXn8KI-MPov0hbAjSu/pub?output=csv"

SITE_URL = "https://ibnsinahospital.in"
LASTMOD_CACHE_FILE = Path("lastmod_cache.json")
GALLERY_TEMPLATE_PATH = Path('gallery_template.html')

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

def clean_name(raw_name):
    """Normalize inconsistent name formatting from the sheet."""
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

# ========== BLOG SEO HELPERS ==========
def meta_description(text, fallback):
    """Create a clean, bounded description suitable for search snippets."""
    text = re.sub(r'\s+', ' ', (text or '').strip())
    text = re.sub(r'<[^>]+>', ' ', text)
    text = text.strip(' -–—|') or fallback
    if len(text) > 158:
        text = text[:155].rsplit(' ', 1)[0].rstrip(' ,;:-') + '...'
    return text

def seo_title(title):
    """Keep the generated search title useful without changing the article H1."""
    title = (title or 'Blog Post').strip()
    suffix = ' | Ibn Sina Hospital, Budgam'
    if len(title) + len(suffix) <= 60:
        return title + suffix
    shorter_suffix = ' | Ibn Sina Hospital'
    if len(title) + len(shorter_suffix) <= 60:
        return title + shorter_suffix
    return title

def normalize_date(value):
    """Return an ISO date/datetime when possible; otherwise leave the source value out of schema."""
    value = (value or '').strip()
    if not value:
        return ''
    if re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
        return value
    if re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})?', value):
        return value
    for fmt in ('%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y', '%Y/%m/%d'):
        try:
            return datetime.datetime.strptime(value, fmt).date().isoformat()
        except ValueError:
            pass
    return ''

def blog_body_html(body):
    """Convert Sheet text into safe, crawlable semantic HTML with predictable headings."""
    raw = (body or '').strip()
    if not raw:
        return '<p>Medical information from Ibn Sina Hospital, Budgam.</p>'

    # The Sheet is treated as plain text. This prevents arbitrary HTML/JS from
    # being published directly to the website through a spreadsheet cell.
    raw = re.sub(r'<[^>]*>', ' ', raw)
    blocks = re.split(r'\n\s*\n+', raw)
    rendered = []
    for block in blocks:
        text = re.sub(r'\s*\n\s*', ' ', block).strip()
        if not text:
            continue
        safe = escape(text)
        is_heading = (
            len(text) <= 90
            and not re.search(r'[.!?]$', text)
            and (
                re.match(r'^\d+[.)]\s+', text)
                or re.match(r'^(what|when|who|why|how|our|specialist|still|when to|common|understanding|tmt|holter|abpm|specialist care|to book|symptoms to watch for|the risks of leaving it unchecked|how we can help|when should you|when to see a doctor)', text, flags=re.IGNORECASE)
            )
        )
        if is_heading:
            safe = re.sub(r'^\d+[.)]\s+', '', safe)
            rendered.append(f'<h2>{safe}</h2>')
        else:
            rendered.append(f'<p>{safe}</p>')
    return '\n'.join(rendered) or '<p>Medical information from Ibn Sina Hospital, Budgam.</p>'

# Only high-confidence topic → department relationships are automated.
# Ambiguous topics intentionally receive no department link rather than a wrong one.
BLOG_DEPARTMENT_LINKS = [
    (r'\b(kidney|kidneys|renal|dialysis|nephrology)\b', '../department-pages/nephrology.html', 'Nephrology'),
    (r'\b(heart|cardiac|cardiology|tmt|holter|abpm|blood pressure)\b', '../department-pages/cardiology.html', 'Cardiology'),
    (r'\b(eye|eyes|vision|ophthalmology|cataract)\b', '../department-pages/ophthalmology.html', 'Ophthalmology'),
    (r'\b(lung|lungs|respiratory|asthma|bronchitis|pulmonology|breathing)\b', '../department-pages/pulmonology.html', 'Pulmonology'),
    (r'\b(joint|bone|bones|arthritis|orthopaedic|orthopaedics)\b', '../department-pages/orthopaedics.html', 'Orthopaedics'),
    (r'\b(women|woman|pregnan|gynaec|gynec|pcos|pcod|fertility)\b', '../department-pages/gynaecology.html', 'Gynaecology'),
    (r'\b(skin|dermatology|acne|rash)\b', '../department-pages/dermatology.html', 'Dermatology'),
    (r'\b(stomach|digestive|gastro|liver|endoscopy)\b', '../department-pages/gastroenterology.html', 'Gastroenterology'),
    (r'\b(ear|nose|throat|ent)\b', '../department-pages/ent.html', 'ENT'),
]

def related_blog_links(title, summary, body, department_slug=''):
    """Build relevant internal links, preferring an explicit Sheet department slug."""
    links = []
    seen = set()
    if department_slug:
        slug = slugify(department_slug)
        allowed = {
            'cardiology': ('../department-pages/cardiology.html', 'Cardiology'),
            'nephrology': ('../department-pages/nephrology.html', 'Nephrology'),
            'ophthalmology': ('../department-pages/ophthalmology.html', 'Ophthalmology'),
            'pulmonology': ('../department-pages/pulmonology.html', 'Pulmonology'),
            'orthopaedics': ('../department-pages/orthopaedics.html', 'Orthopaedics'),
            'gynaecology': ('../department-pages/gynaecology.html', 'Gynaecology'),
            'dermatology': ('../department-pages/dermatology.html', 'Dermatology'),
            'gastroenterology': ('../department-pages/gastroenterology.html', 'Gastroenterology'),
            'ent': ('../department-pages/ent.html', 'ENT'),
        }
        if slug in allowed:
            href, label = allowed[slug]
            links.append(f'<li><a href="{href}">{label} Department</a></li>')
            seen.add(href)
    if not links:
        text = f"{title} {summary} {body}"
        for pattern, href, label in BLOG_DEPARTMENT_LINKS:
            if re.search(pattern, text, flags=re.IGNORECASE) and href not in seen:
                links.append(f'<li><a href="{href}">{label} Department</a></li>')
                break
    links.extend([
        '<li><a href="../doctors.html">Meet Our Doctors &amp; Specialists</a></li>',
        '<li><a href="../appointment.html">Book an Appointment</a></li>',
    ])
    return '<aside class="blog-related-links"><h2>Related Care at Ibn Sina Hospital</h2><ul>' + ''.join(links[:3]) + '</ul></aside>'

# ========== LASTMOD CACHE (content-based) ==========
def load_lastmod_cache():
    if LASTMOD_CACHE_FILE.exists():
        try:
            return json.loads(LASTMOD_CACHE_FILE.read_text(encoding='utf-8'))
        except (json.JSONDecodeError, OSError):
            return {}
    return {}

def save_lastmod_cache(cache):
    LASTMOD_CACHE_FILE.write_text(json.dumps(cache, indent=2), encoding='utf-8')

def get_lastmod(url, content, cache, today):
    """Only bump lastmod if the page content actually changed."""
    content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
    entry = cache.get(url)
    if entry and entry.get('hash') == content_hash:
        return entry['lastmod']
    cache[url] = {'hash': content_hash, 'lastmod': today}
    return today

# ========== SAVE JSON DATA (fixes CORS issue for client-side fetches) ==========
def save_json_data(doctors, departments, posts, gallery_items):
    """
    Writes server-fetched sheet data to static JSON files in /data.
    main.js and chatbot.js should fetch these local files instead of
    hitting Google Sheets CSV URLs directly from the browser, which
    fails intermittently due to CORS.
    """
    data_dir = Path('data')
    data_dir.mkdir(exist_ok=True)
    (data_dir / 'doctors.json').write_text(json.dumps(doctors, ensure_ascii=False), encoding='utf-8')
    (data_dir / 'departments.json').write_text(json.dumps(departments, ensure_ascii=False), encoding='utf-8')
    (data_dir / 'blog.json').write_text(json.dumps(posts, ensure_ascii=False), encoding='utf-8')
    (data_dir / 'gallery.json').write_text(json.dumps(gallery_items, ensure_ascii=False), encoding='utf-8')
    print(f"Wrote JSON data files: {len(doctors)} doctors, {len(departments)} departments, "
          f"{len(posts)} blog posts, {len(gallery_items)} gallery items.")

# ========== GENERATE DOCTOR PAGES ==========

# Folder of hand-built, "better look" department pages. When a department has
# a page here, doctor pages should link to it instead of the auto-generated
# departments/ page, so internal links and SEO signal consolidate on one URL.
MANUAL_DEPARTMENT_PAGES_DIR = Path('department-pages')

def resolve_department_link(dept_name, dept_slug):
    """
    Decide which URL a doctor page should link to for a given department:
    - department-pages/{slug}.html if that manually-built page exists
    - otherwise fall back to the auto-generated departments/department-{slug}.html
    """
    manual_file = MANUAL_DEPARTMENT_PAGES_DIR / f'{dept_slug}.html'
    if manual_file.exists():
        return f'../department-pages/{dept_slug}.html'
    return f'../departments/department-{dept_slug}.html'

def generate_doctor_pages(doctors, departments_by_name):
    output_dir = Path('doctors')
    output_dir.mkdir(exist_ok=True)
    urls = []
    pages = []

    for doc in doctors:
        full_name = clean_name(doc.get('name', ''))
        slug = slugify(doc.get('name', ''))
        filename = f'doctor-{slug}.html'
        dept_name = (doc.get('department') or '').strip()
        # Prefer the department's own registered slug (from the Departments
        # sheet) over re-slugifying the doctor's free-text department field —
        # this is what caused mismatches like "general-medicine" vs "medicine"
        # and "plastic-surgery" vs "plastic" producing dead links.
        dept_record = departments_by_name.get(dept_name.lower())
        dept_slug = (dept_record.get('slug') if dept_record else None) or slugify(dept_name)
        specialty = (doc.get('specialty') or 'Doctor').strip()
        qualifications = (doc.get('qualifications') or '').strip()
        photo_url = (doc.get('photo_url') or 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp').strip()
        about_text = build_about(doc, full_name)

        title = f"{full_name} | {specialty.title()} | Ibn Sina Hospital, Budgam"
        description = f"{full_name} is a {specialty} at Ibn Sina Hospital, Budgam. View qualifications, department and book an appointment."
        page_url = f'{SITE_URL}/doctors/{filename}'
        appointment_link = f"../appointment.html?doctor={quote(full_name)}"

        related_links = ""
        same_dept_doctors = [
            d for d in doctors
            if (d.get('department') or '').strip().lower() == dept_name.lower()
            and (d.get('name') or '') != doc.get('name', '')
        ][:4]
        if same_dept_doctors:
            items = "".join(
                f'<li><a href="doctor-{slugify(d.get("name",""))}.html">{clean_name(d.get("name",""))}</a></li>'
                for d in same_dept_doctors
            )
            related_links = f'<div class="related-doctors"><strong>Other {dept_name.title()} Specialists:</strong><ul>{items}</ul></div>'

        dept_link_html = ""
        if dept_name:
            dept_href = resolve_department_link(dept_name, dept_slug)
            dept_link_html = f'<p><a href="{dept_href}">View {dept_name.title()} Department →</a></p>'

        json_ld = {
            "@context": "https://schema.org",
            "@type": "Physician",
            "name": full_name,
            "medicalSpecialty": specialty,
            "worksFor": {
                "@type": "Hospital",
                "name": "Ibn Sina Hospital",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Budgam",
                    "addressRegion": "Jammu and Kashmir",
                    "addressCountry": "IN"
                }
            },
            "url": page_url,
            "image": photo_url
        }
        if qualifications:
            json_ld["hasCredential"] = qualifications

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
    <meta property="og:type" content="profile">
    <meta property="og:url" content="{page_url}">
    <meta property="og:image" content="{photo_url}">
    <link rel="stylesheet" href="../css/style.css">
    <script type="application/ld+json">{json.dumps(json_ld, ensure_ascii=False)}</script>
</head>
<body>
    <header class="site-header">
        <div class="header-inner container">
            <a href="../index.html" class="logo">Ibn Sina <strong>Hospital</strong></a>
            <nav class="main-nav"><ul class="nav-list">
                <li><a href="../index.html">Home</a></li>
                <li><a href="../doctors.html">Doctors</a></li>
                <li><a href="../services.html">Services</a></li>
                <li><a href="../contact.html">Contact</a></li>
            </ul></nav>
        </div>
    </header>
    <main class="section">
        <div class="container">
            <img src="{photo_url}" alt="{full_name} - {specialty} at Ibn Sina Hospital" class="doctor-photo" width="200">
            <h1>{full_name}</h1>
            <p><strong>Specialty:</strong> {specialty.title()}</p>
            <p><strong>Department:</strong> {dept_name.title()}</p>
            <p><strong>Qualifications:</strong> {qualifications or 'N/A'}</p>
            {dept_link_html}
            <div class="doctor-bio"><strong>About:</strong><br>{about_text}</div>
            {related_links}
            <a href="{appointment_link}" class="btn btn-primary">Book Appointment</a>
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

# ========== GENERATE BLOG PAGES ==========
def generate_blog_pages(posts):
    output_dir = Path('blog')
    output_dir.mkdir(exist_ok=True)
    urls = []
    pages = []
    seen_slugs = set()

    for post in posts:
        if post.get('is_published', '').strip().lower() not in ['true', 'yes', '1']:
            continue

        slug = slugify(post.get('slug') or post.get('title', ''))
        if not slug:
            raise ValueError('Published blog post is missing a usable slug/title.')
        if slug in seen_slugs:
            raise ValueError(f'Duplicate published blog slug detected: {slug}')
        seen_slugs.add(slug)

        filename = f'blog-{slug}.html'
        page_url = f'{SITE_URL}/blog/{filename}'
        title = (post.get('title') or 'Blog Post').strip()
        summary_source = post.get('short summary') or post.get('short_summary') or title
        summary = meta_description(summary_source, title)
        image = (post.get('cover_image_url') or 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp').strip()
        body = post.get('body') or ''
        published_at = (post.get('published_at') or '').strip()
        published_iso = normalize_date(published_at)
        body_html = blog_body_html(body)
        department_slug = (post.get('department_slug') or post.get('department') or '').strip()
        related_links = related_blog_links(title, summary, body, department_slug)
        full_title = seo_title(title)

        article_ld = {
            "@type": "Article",
            "@id": f"{page_url}#article",
            "headline": title,
            "description": summary,
            "image": [image],
            "mainEntityOfPage": {"@id": f"{page_url}#webpage"},
            "author": {
                "@type": "Organization",
                "name": "Ibn Sina Hospital"
            },
            "publisher": {"@id": f"{SITE_URL}/#hospital"},
            "inLanguage": "en-IN"
        }
        if published_iso:
            article_ld["datePublished"] = published_iso
            article_ld["dateModified"] = published_iso

        webpage_ld = {
            "@type": "MedicalWebPage",
            "@id": f"{page_url}#webpage",
            "url": page_url,
            "name": full_title,
            "description": summary,
            "isPartOf": {"@id": f"{SITE_URL}/#website"},
            "about": {"@id": f"{SITE_URL}/#hospital"},
            "mainEntity": {"@id": f"{page_url}#article"},
            "inLanguage": "en-IN"
        }

        hospital_ld = {
            "@type": "Hospital",
            "@id": f"{SITE_URL}/#hospital",
            "name": "Ibn Sina Hospital",
            "url": SITE_URL,
            "telephone": "+91-9622552553",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Budgam",
                "addressRegion": "Jammu and Kashmir",
                "addressCountry": "IN"
            }
        }

        website_ld = {
            "@type": "WebSite",
            "@id": f"{SITE_URL}/#website",
            "url": SITE_URL,
            "name": "Ibn Sina Hospital",
            "publisher": {"@id": f"{SITE_URL}/#hospital"}
        }

        graph_ld = {
            "@context": "https://schema.org",
            "@graph": [article_ld, webpage_ld, hospital_ld, website_ld]
        }

        breadcrumb_ld = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_URL}/"},
                {"@type": "ListItem", "position": 2, "name": "Health Blog", "item": f"{SITE_URL}/blog.html"},
                {"@type": "ListItem", "position": 3, "name": title, "item": page_url}
            ]
        }

        html = f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(full_title)}</title>
    <meta name="description" content="{escape(summary)}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="{page_url}">
    <meta property="og:site_name" content="Ibn Sina Hospital">
    <meta property="og:title" content="{escape(full_title)}">
    <meta property="og:description" content="{escape(summary)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{page_url}">
    <meta property="og:image" content="{escape(image)}">
    <meta property="og:image:alt" content="{escape(title)} — Ibn Sina Hospital, Budgam">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{escape(full_title)}">
    <meta name="twitter:description" content="{escape(summary)}">
    <meta name="twitter:image" content="{escape(image)}">
    <meta name="twitter:image:alt" content="{escape(title)} — Ibn Sina Hospital, Budgam">
    <link rel="stylesheet" href="../css/style.css">
    <script type="application/ld+json">{json.dumps(graph_ld, ensure_ascii=False)}</script>
    <script type="application/ld+json">{json.dumps(breadcrumb_ld, ensure_ascii=False)}</script>
</head>
<body>
    <header class="site-header">
        <div class="header-inner container">
            <a href="../index.html" class="logo">Ibn Sina <strong>Hospital</strong></a>
            <nav class="main-nav"><ul class="nav-list">
                <li><a href="../index.html">Home</a></li>
                <li><a href="../blog.html">Blog</a></li>
                <li><a href="../doctors.html">Doctors</a></li>
                <li><a href="../services.html">Services</a></li>
                <li><a href="../contact.html">Contact</a></li>
            </ul></nav>
        </div>
    </header>
    <main class="section">
        <div class="container">
            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <a href="../index.html">Home</a> <span aria-hidden="true">›</span>
                <a href="../blog.html">Health Blog</a> <span aria-hidden="true">›</span>
                <span>{escape(title)}</span>
            </nav>
            <article>
                <header>
                    <p class="eyebrow">Health Blog · Ibn Sina Hospital, Budgam</p>
                    <h1>{escape(title)}</h1>
                    <time datetime="{escape(published_iso or published_at)}">{escape(published_at)}</time>
                </header>
                <div class="blog-body">{body_html}</div>
                {related_links}
                <p><strong>Need medical advice?</strong> <a href="../appointment.html">Book an appointment</a> or call <a href="tel:+919622552553">9622552553</a>. Ibn Sina Hospital in Budgam serves patients across the Kashmir Valley and Jammu &amp; Kashmir.</p>
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
    output_dir.mkdir(exist_ok=True)
    urls = []
    pages = []

    for dept in departments:
        dept_name = (dept.get('name') or '').strip()
        slug = slugify(dept.get('slug') or dept_name)
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
            f'    <img src="{img_url}" alt="{alt_text}" loading="lazy">\n'
            f'    <div class="photo-caption">{title}</div>\n'
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

# ========== NEW: COLLECT MANUAL DEPARTMENT PAGES ==========
def collect_manual_department_pages():
    """
    Scans department-pages/ for HTML files and returns (url, content) tuples.
    This ensures manually created department pages are included in sitemap.
    """
    pages = []
    dept_dir = Path('department-pages')
    if not dept_dir.exists():
        return pages

    for html_file in dept_dir.glob('*.html'):
        content = html_file.read_text(encoding='utf-8')
        url = f"{SITE_URL}/department-pages/{html_file.name}"
        pages.append((url, content))
    return pages

def collect_public_html_pages():
    """Discover only canonical, indexable HTML pages for automatic sitemap inclusion."""
    pages = []
    roots = [Path('doctors'), Path('departments'), Path('department-pages'), Path('blog')]
    excluded_names = {'404.html', 'google-site-verification.html'}
    seen_urls = set()

    for root in roots:
        if not root.exists():
            continue
        for html_file in root.glob('*.html'):
            if html_file.name in excluded_names:
                continue

            content = html_file.read_text(encoding='utf-8')
            url = f"{SITE_URL}/{html_file.parent.as_posix()}/{html_file.name}"
            canonical_match = re.search(
                r'<link\\s+rel=["\\\']canonical["\\\']\\s+href=["\\\']([^"\\\']+)["\\\']',
                content,
                flags=re.IGNORECASE
            )

            # Only add pages that explicitly identify this exact URL as canonical.
            # This prevents template shells and legacy/duplicate pages from entering
            # the sitemap merely because an HTML file happens to exist.
            if not canonical_match or canonical_match.group(1).rstrip('/') != url.rstrip('/'):
                continue

            if url in seen_urls:
                continue
            seen_urls.add(url)
            pages.append((url, content))

    return pages


# ========== UPDATE SITEMAP (content-aware lastmod) ==========
def update_sitemap(all_pages_with_content):
    cache = load_lastmod_cache()
    today = datetime.date.today().isoformat()

    static_paths = [
        '/',
        '/about.html',
        '/services.html',
        '/doctors.html',
        '/gallery.html',
        '/blog.html',
        '/careers.html',
        '/faq.html',
        '/contact.html',
        '/appointment.html',
    ]

    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>',
                 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']

    for path in static_paths:
        url = f'{SITE_URL}{path}'
        file_path = Path('index.html') if path == '/' else Path(path.lstrip('/'))
        if file_path.exists():
            content = file_path.read_text(encoding='utf-8')
            lastmod = get_lastmod(url, content, cache, today)
        else:
            lastmod = today
        priority = "1.0" if path == '/' else "0.7"
        xml_parts.append(
            f'  <url>\n    <loc>{url}</loc>\n    <lastmod>{lastmod}</lastmod>'
            f'\n    <changefreq>weekly</changefreq>\n    <priority>{priority}</priority>\n  </url>'
        )

    # Seed with static URLs so generated/auto-discovered pages cannot duplicate them.
    seen_urls = {f'{SITE_URL}{path}' for path in static_paths}
    for url, content in all_pages_with_content:
        if url in seen_urls:
            continue
        seen_urls.add(url)
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
    url_list = list(dict.fromkeys(url_list))
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

    save_json_data(doctors, departments, posts, gallery_items)

    departments_by_name = {(d.get('name') or '').strip().lower(): d for d in departments}

    doctor_urls, doctor_pages = generate_doctor_pages(doctors, departments_by_name)
    blog_urls, blog_pages = generate_blog_pages(posts)
    dept_urls, dept_pages = generate_department_pages(departments, doctors)
    gallery_url, gallery_html = generate_gallery_page(gallery_items)

    # Collect manually created department pages (e.g., department-pages/*.html)
    manual_dept_pages = collect_manual_department_pages()
    print(f"Found {len(manual_dept_pages)} manual department pages.")

    all_dynamic_urls = doctor_urls + blog_urls + dept_urls + [gallery_url] + [url for url, _ in manual_dept_pages]
    all_pages_with_content = doctor_pages + blog_pages + dept_pages + [(gallery_url, gallery_html)] + manual_dept_pages

    discovered_pages = collect_public_html_pages()
    discovered_urls = [url for url, _ in discovered_pages]
    discovered_by_url = {url: content for url, content in discovered_pages}
    all_pages_with_content.extend((url, content) for url, content in discovered_by_url.items())
    all_dynamic_urls.extend(url for url in discovered_urls if url not in all_dynamic_urls)

    update_sitemap(all_pages_with_content)
    submit_to_indexnow(all_dynamic_urls)

    print("Generation, sitemap update, and IndexNow submission complete.")

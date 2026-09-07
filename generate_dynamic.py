import csv
import io
import urllib.request
from pathlib import Path
import datetime
import re
import json
import hashlib
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

# ========== GENERATE DOCTOR PAGES ==========
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
        dept_slug = slugify(dept_name)
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
            dept_link_html = f'<p><a href="../departments/department-{dept_slug}.html">View {dept_name.title()} Department →</a></p>'

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
    """Generate polished, consistent article pages for every published Sheet post.

    The Google Sheet remains the CMS: authors only provide title, summary, body,
    date and cover image. This renderer turns plain text into readable sections,
    lists, callouts, internal navigation and related articles automatically.
    """
    output_dir = Path('blog')
    output_dir.mkdir(exist_ok=True)
    urls = []
    pages = []

    def esc(value):
        return html.escape(str(value or ''), quote=True)

    def format_body(raw):
        if not raw:
            return '<p>No article content is available yet.</p>'

        text = str(raw).replace('\r\n', '\n').replace('\r', '\n').strip()

        # Preserve author-supplied HTML when the Sheet already contains
        # structured article markup.
        if re.search(r'<(p|div|ul|ol|h2|h3|blockquote|table|br)\b', text, re.I):
            return text

        blocks = re.split(r'\n\s*\n+', text)
        out = []

        for block in blocks:
            lines = [line.strip() for line in block.split('\n') if line.strip()]
            if not lines:
                continue

            if all(re.match(r'^[-•*]\s+', line) for line in lines):
                items = ''.join(
                    f'<li>{esc(re.sub(r"^[-•*]\s+", "", line))}</li>'
                    for line in lines
                )
                out.append(f'<ul>{items}</ul>')
                continue

            if all(re.match(r'^\d+[.)]\s+', line) for line in lines):
                items = ''.join(
                    f'<li>{esc(re.sub(r"^\d+[.)]\s+", "", line))}</li>'
                    for line in lines
                )
                out.append(f'<ol>{items}</ol>')
                continue

            if len(lines) == 1:
                line = lines[0]

                # Numbered standalone section titles become H2s.
                numbered = re.match(r'^(\d+)[.)]\s+(.+)$', line)
                if numbered:
                    out.append(
                        f'<h2><span class="blog-section-number">{esc(numbered.group(1))}</span>'
                        f'{esc(numbered.group(2))}</h2>'
                    )
                    continue

                # Plain standalone section headings: short, no sentence-ending
                # punctuation, and not obvious contact/phone lines.
                looks_like_heading = (
                    len(line) <= 95
                    and not re.search(r'[.!;,]$', line)
                    and not re.match(r'^(Reception|Phone|Call|Email)\s*:', line, re.I)
                    and not re.search(r'@\S+\.\S+', line)
                    and not re.search(r'\b\d{7,}\b', line)
                )
                if looks_like_heading:
                    out.append(f'<h2>{esc(line)}</h2>')
                    continue

            paragraph = '<br>'.join(esc(line) for line in lines)
            out.append(f'<p>{paragraph}</p>')

        return '\n'.join(out)

    def internal_links_html(post):
        title_body = f"{post.get('title', '')} {post.get('body', '')}".lower()

        links = [
            ('Services & Departments', '../services.html', 'Explore the care available at Ibn Sina Hospital.'),
            ('Our Doctors', '../doctors.html', 'Meet our specialists and clinical team.'),
            ('Book an Appointment', '../appointment.html', 'Request a consultation with our team.'),
        ]

        if any(word in title_body for word in ['heart', 'cardio', 'tmt', 'holter', 'abpm', 'blood pressure']):
            links = [
                ('Cardiology & Heart Care', '../services.html', 'Explore our cardiac care and diagnostic services.'),
                ('Our Doctors', '../doctors.html', 'Find the right specialist for your concerns.'),
                ('Book an Appointment', '../appointment.html', 'Arrange a consultation or test.'),
            ]
        elif any(word in title_body for word in ['kidney', 'dialysis', 'renal']):
            links = [
                ('Kidney & Dialysis Care', '../services.html', 'Learn about available hospital services.'),
                ('Our Doctors', '../doctors.html', 'Meet our specialists.'),
                ('Book an Appointment', '../appointment.html', 'Arrange a consultation.'),
            ]
        elif any(word in title_body for word in ['pcos', 'pregnan', 'fertility', 'gynec', 'women']):
            links = [
                ("Women's Health Services", '../services.html', 'Explore women’s health and related services.'),
                ('Our Doctors', '../doctors.html', 'Meet our specialists.'),
                ('Book an Appointment', '../appointment.html', 'Arrange a consultation.'),
            ]

        cards = ''.join(
            f'<a class="blog-resource-link" href="{href}">'
            f'<span><strong>{esc(label)}</strong><small>{esc(description)}</small></span>'
            f'<span aria-hidden="true">→</span></a>'
            for label, href, description in links
        )

        return (
            '<aside class="blog-internal-links" aria-label="Related hospital resources">'
            '<div class="blog-internal-links-heading">'
            '<span class="blog-eyebrow">Explore More</span>'
            '<h2>Related Hospital Resources</h2>'
            '<p>Useful pages from Ibn Sina Hospital related to this article.</p>'
            '</div>'
            f'<div class="blog-resource-grid">{cards}</div>'
            '</aside>'
        )

    def related_html(current_slug, current_title):
        candidates = [
            p for p in posts
            if p.get('is_published', '').strip().lower() in ['true', 'yes', '1']
            and slugify(p.get('slug') or p.get('title', '')) != current_slug
        ]

        # Prefer topical overlap, then fall back to the most recent articles.
        current_words = {
            w for w in re.findall(r'[a-z]{4,}', current_title.lower())
            if w not in {'what', 'when', 'your', 'from', 'with', 'this', 'that', 'guide'}
        }

        def score(post):
            words = set(re.findall(r'[a-z]{4,}', post.get('title', '').lower()))
            overlap = len(current_words & words)
            try:
                date_score = datetime.datetime.fromisoformat(
                    str(post.get('published_at', '')).replace('Z', '+00:00')
                ).timestamp()
            except Exception:
                date_score = 0
            return overlap, date_score

        candidates.sort(key=score, reverse=True)
        cards = []

        for post in candidates[:3]:
            slug = slugify(post.get('slug') or post.get('title', ''))
            title = post.get('title', 'Health Article')
            summary = post.get('short_summary', '')
            image = post.get('cover_image_url', '')
            date = post.get('published_at', '')

            image_html = (
                f'<img src="{esc(image)}" alt="{esc(title)}" loading="lazy">'
                if image else
                '<div class="blog-related-placeholder" aria-hidden="true">Ibn Sina Hospital</div>'
            )

            cards.append(
                '<article class="blog-related-card">'
                f'<a class="blog-related-image" href="../blog-post.html?slug={esc(slug)}">{image_html}</a>'
                '<div class="blog-related-content">'
                f'<time datetime="{esc(date)}">{esc(date)}</time>'
                f'<h3><a href="../blog-post.html?slug={esc(slug)}">{esc(title)}</a></h3>'
                f'<p>{esc(summary[:150])}{"..." if len(summary) > 150 else ""}</p>'
                f'<a class="blog-related-read" href="../blog-post.html?slug={esc(slug)}">Read article →</a>'
                '</div></article>'
            )

        if not cards:
            return ''

        return (
            '<section class="blog-related-section" aria-labelledby="related-articles-heading">'
            '<div class="blog-section-heading">'
            '<span class="blog-eyebrow">Keep Reading</span>'
            '<h2 id="related-articles-heading">More Health Articles</h2>'
            '</div>'
            f'<div class="blog-related-grid">{"".join(cards)}</div>'
            '</section>'
        )

    for post in posts:
        if post.get('is_published', '').strip().lower() not in ['true', 'yes', '1']:
            continue

        slug = slugify(post.get('slug') or post.get('title', ''))
        filename = f'blog-{slug}.html'
        page_url = f'{SITE_URL}/blog/{filename}'
        title = post.get('title', 'Blog Post')
        summary = post.get('short_summary', title)
        image = post.get('cover_image_url', 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp')
        published = post.get('published_at', '')
        body_html = format_body(post.get('body', ''))

        word_count = len(re.findall(r'\b\w+\b', re.sub(r'<[^>]+>', ' ', body_html)))
        reading_time = max(1, (word_count + 199) // 200)

        json_ld = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": summary,
            "image": image,
            "mainEntityOfPage": {"@type": "WebPage", "@id": page_url},
            "author": {"@type": "Organization", "name": "Ibn Sina Hospital"},
            "publisher": {
                "@type": "Hospital",
                "name": "Ibn Sina Hospital",
                "url": SITE_URL,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Budgam",
                    "addressRegion": "Jammu and Kashmir",
                    "addressCountry": "IN"
                }
            },
            "datePublished": published
        }

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{esc(title)} | Ibn Sina Hospital</title>
    <meta name="description" content="{esc(summary)}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="{esc(page_url)}">
    <meta property="og:title" content="{esc(title)} | Ibn Sina Hospital">
    <meta property="og:description" content="{esc(summary)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{esc(page_url)}">
    <meta property="og:image" content="{esc(image)}">
    <link rel="icon" type="image/webp" href="https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script type="application/ld+json">{json.dumps(json_ld, ensure_ascii=False)}</script>
</head>
<body class="generated-blog-page">
    <header class="site-header">
        <div class="header-inner container">
            <a href="../index.html" class="logo" aria-label="Ibn Sina Hospital home">Ibn Sina <strong>Hospital</strong></a>
            <nav class="main-nav" aria-label="Main navigation">
                <ul class="nav-list">
                    <li><a href="../index.html">Home</a></li>
                    <li><a href="../about.html">About Us</a></li>
                    <li><a href="../doctors.html">Our Doctors</a></li>
                    <li><a href="../services.html">Services</a></li>
                    <li><a href="../blog.html" aria-current="page">Blogs</a></li>
                    <li><a href="../contact.html">Contact</a></li>
                </ul>
            </nav>
            <a class="btn btn-book" href="../appointment.html">Book Appointment</a>
        </div>
    </header>

    <main>
        <div class="generated-blog-shell container">
            <nav class="generated-blog-breadcrumbs" aria-label="Breadcrumb">
                <a href="../index.html">Home</a><span>/</span>
                <a href="../blog.html">Health Insights</a><span>/</span>
                <span aria-current="page">{esc(title)}</span>
            </nav>

            <article class="generated-blog-article">
                <header class="generated-blog-header">
                    <div class="generated-blog-label">Health Insights</div>
                    <h1>{esc(title)}</h1>
                    <p class="generated-blog-summary">{esc(summary)}</p>
                    <div class="generated-blog-meta">
                        <span>✦ Ibn Sina Hospital</span>
                        <time datetime="{esc(published)}">📅 {esc(published)}</time>
                        <span>⏱ {reading_time} min read</span>
                    </div>
                </header>

                <figure class="generated-blog-cover">
                    <img src="{esc(image)}" alt="{esc(title)}" loading="eager" fetchpriority="high">
                </figure>

                <div class="generated-blog-layout">
                    <aside class="generated-blog-sidebar" aria-label="Article navigation">
                        <div class="generated-sidebar-card">
                            <h2>In this article</h2>
                            <p>Use the section headings below to scan the key points.</p>
                            <a href="#article-content">Jump to article ↓</a>
                        </div>
                        <div class="generated-sidebar-card generated-sidebar-cta">
                            <strong>Need medical advice?</strong>
                            <p>Our team is here to help with consultations and appointments.</p>
                            <a href="../appointment.html">Book an Appointment →</a>
                        </div>
                    </aside>

                    <div class="generated-blog-main">
                        <div id="article-content" class="blog-body generated-blog-body">
                            {body_html}
                        </div>

                        {internal_links_html(post)}

                        <aside class="generated-medical-note">
                            <strong>Medical Disclaimer</strong>
                            <p>This article is for general educational purposes and is not a substitute for professional medical advice, diagnosis or treatment. If you have concerns about your health, please consult a qualified healthcare professional.</p>
                        </aside>
                    </div>
                </div>
            </article>

            {related_html(slug, title)}

            <section class="generated-blog-cta" aria-label="Appointment call to action">
                <div>
                    <span class="blog-eyebrow">Trusted care close to home</span>
                    <h2>Need expert medical advice?</h2>
                    <p>Speak with the healthcare team at Ibn Sina Hospital, Budgam.</p>
                </div>
                <div class="generated-blog-cta-actions">
                    <a class="btn btn-primary" href="../appointment.html">Book an Appointment</a>
                    <a class="btn btn-outline-light" href="tel:9622552553">Call 9622552553</a>
                </div>
            </section>
        </div>
    </main>

    <footer class="site-footer">
        <div class="footer-wave" aria-hidden="true">
            <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0 25 C360 50 720 0 1080 25 C1260 38 1380 20 1440 25 C1440 25 1440 0 1440 0 L0 0 Z" fill="#2d4a2b"/></svg>
        </div>
        <div class="footer-main container">
            <div class="footer-col">
                <h3 class="footer-logo">Ibn Sina <strong>Hospital</strong></h3>
                <address>Near Railway Station, Ompora Railway Station Road, Ompora, Budgam, J&K 191111</address>
                <p><a href="tel:9622552553">📞 9622552553 / 9419023501</a></p>
                <p><a href="mailto:weibnsina@gmail.com">✉ weibnsina@gmail.com</a></p>
            </div>
            <div class="footer-col">
                <h4>OPD & Emergency</h4>
                <p class="footer-note"><strong>OPD, Pharmacy, Lab & Emergency:</strong> 24/7, 365 days</p>
            </div>
            <div class="footer-col">
                <h4>Quick Links</h4>
                <ul class="footer-links">
                    <li><a href="../index.html">Home</a></li>
                    <li><a href="../about.html">About Us</a></li>
                    <li><a href="../services.html">Services</a></li>
                    <li><a href="../doctors.html">Doctors</a></li>
                    <li><a href="../gallery.html">Gallery</a></li>
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
            <p>&copy; 2026 Ibn Sina Hospital. All rights reserved. | Operating since 2018</p>
            <p class="google-review-note">See our latest reviews on <a href="https://maps.google.com/?q=IBN+SINA+HOSPITAL+Ompora+Budgam" target="_blank" rel="noopener">Google Maps</a></p>
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
        slug = slugify(dept.get('slug') or dept_name)

        # Skip the thin auto-generated page entirely when a hand-built,
        # fuller page already exists in department-pages/ for this slug.
        # WITHOUT THIS CHECK, this function unconditionally recreates
        # departments/department-{slug}.html on every workflow run,
        # reintroducing duplicate/competing URLs for departments that
        # already have a proper hand-built page. This exact regression
        # happened once already (Sep 2026) when this file was rewritten
        # without this guard -- do not remove it again.
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

    # Collect manually created department pages (e.g., department-pages/*.html)
    manual_dept_pages = collect_manual_department_pages()
    print(f"Found {len(manual_dept_pages)} manual department pages.")

    all_dynamic_urls = doctor_urls + blog_urls + dept_urls + [gallery_url] + [url for url, _ in manual_dept_pages]
    all_pages_with_content = doctor_pages + blog_pages + dept_pages + [(gallery_url, gallery_html)] + manual_dept_pages

    update_sitemap(all_pages_with_content)
    submit_to_indexnow(all_dynamic_urls)

    print("Generation, sitemap update, and IndexNow submission complete.")

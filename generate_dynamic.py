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

def format_blog_date(date_value):
    if not date_value:
        return ''
    try:
        dt = datetime.datetime.fromisoformat(date_value.replace('Z', '+00:00'))
        return dt.strftime('%d %B %Y')
    except:
        return date_value

def calculate_reading_time(text):
    if not text:
        return 1
    words = len(text.split())
    return max(1, round(words / 200))

def escape_html(text):
    if text is None:
        return ''
    return (str(text)
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&#39;'))

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

# ========== UPDATE CRAWLABLE BLOG LINKS ==========
def update_blog_index_links(posts):
    """Keep plain-HTML static blog links synchronized with published posts."""
    blog_index = Path('blog.html')
    if not blog_index.exists():
        print("blog.html not found; skipping crawlable blog links.")
        return

    published = [
        post for post in posts
        if (post.get('is_published') or '').strip().lower() in ['true', 'yes', '1']
    ]
    published.sort(
        key=lambda post: post.get('published_at') or post.get('date') or '',
        reverse=True
    )

    links = []
    for post in published:
        slug = slugify(post.get('slug') or post.get('title', ''))
        if not slug:
            continue
        title = (post.get('title') or 'Health Article').strip()
        title_html = (
            title.replace('&', '&amp;')
                 .replace('<', '&lt;')
                 .replace('>', '&gt;')
                 .replace('"', '&quot;')
                 .replace("'", '&#39;')
        )
        links.append(
            f'                    <li><a href="blog/blog-{slug}.html">{title_html}</a></li>'
        )

    if not links:
        links.append('                    <li><a href="blog.html">Health Articles</a></li>')

    start_marker = '                    <!-- STATIC_BLOG_LINKS_START -->'
    end_marker = '                    <!-- STATIC_BLOG_LINKS_END -->'
    pattern = re.compile(re.escape(start_marker) + r'.*?' + re.escape(end_marker), re.DOTALL)
    replacement = start_marker + '\n' + '\n'.join(links) + '\n' + end_marker

    current = blog_index.read_text(encoding='utf-8')
    updated, count = pattern.subn(replacement, current, count=1)

    if count != 1:
        print("Static blog link markers not found; blog.html was not changed.")
        return

    blog_index.write_text(updated, encoding='utf-8')
    print(f"Updated crawlable blog links in blog.html: {len(links)} published posts.")

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

        # Link to manual department page if it exists, else fallback to auto-generated
        dept_link_html = ""
        if dept_name:
            manual_path = Path(f'department-pages/{dept_slug}.html')
            if manual_path.exists():
                dept_link_html = f'<p><a href="../department-pages/{dept_slug}.html">View {dept_name.title()} Department →</a></p>'
            else:
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
            "image": photo_url,
            "description": about_text[:160]
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

# ========== GENERATE BLOG ARTICLES (Static) ==========
def generate_blog_pages(posts):
    """
    Generates fully styled static blog articles – preserves existing premium design.
    """
    output_dir = Path('blog')
    output_dir.mkdir(exist_ok=True)
    urls = []
    pages = []

    # We'll use a template from the existing blog-post.html or generate from scratch.
    # Since we already have a working template, we can reuse its design.
    # But for simplicity and consistency, we'll generate the same premium structure as before.
    for post in posts:
        if post.get('is_published', '').strip().lower() not in ['true', 'yes', '1']:
            continue

        slug = slugify(post.get('slug') or post.get('title', ''))
        if not slug:
            continue

        filename = f'blog-{slug}.html'
        page_url = f'{SITE_URL}/blog/{filename}'
        title = post.get('title', 'Health Article').strip()
        summary = post.get('short_summary', title).strip()
        image = post.get('cover_image_url', 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp').strip()
        body_html = post.get('body', '').strip() or '<p>No content available.</p>'
        published_date = post.get('published_at', '')
        formatted_date = format_blog_date(published_date)
        category = post.get('category', 'Health & Wellness').strip()
        reading_time = calculate_reading_time(body_html)

        # Related articles (links to other published posts)
        related_posts = [
            p for p in posts
            if p.get('is_published', '').strip().lower() in ['true', 'yes', '1']
            and p.get('slug', '') != slug
        ][:3]
        related_html = ""
        if related_posts:
            items = "".join(
                f'<li><a href="blog-{slugify(p.get("slug") or p.get("title", ""))}.html">{escape_html(p.get("title", "Health Article"))}</a></li>'
                for p in related_posts
            )
            related_html = f'''
            <section class="blog-related-articles" aria-labelledby="related-articles-heading">
                <h2 id="related-articles-heading">Related Health Insights</h2>
                <ul>{items}</ul>
            </section>
            '''

        # Build full HTML with premium design (same as before)
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape_html(title)} | Ibn Sina Hospital, Budgam, Jammu & Kashmir</title>
    <meta name="description" content="{escape_html(summary)}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="{page_url}">
    <meta property="og:title" content="{escape_html(title)} | Ibn Sina Hospital">
    <meta property="og:description" content="{escape_html(summary)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{page_url}">
    <meta property="og:image" content="{image}">
    <link rel="icon" type="image/webp" href="https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp">
    <link rel="stylesheet" href="../css/style.css">
    <!-- Article Schema -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "{escape_html(title)}",
      "description": "{escape_html(summary)}",
      "image": "{image}",
      "url": "{page_url}",
      "datePublished": "{published_date}",
      "publisher": {{
        "@type": "Hospital",
        "name": "Ibn Sina Hospital",
        "url": "https://ibnsinahospital.in/"
      }}
    }}
    </script>
    <!-- Premium styles inline -->
    <style>
        .article-page {{ background: #f8faf6; padding: 20px 0; }}
        .article-shell {{ max-width: 1180px; margin: 0 auto; padding: 20px; }}
        .article-hero {{ position:relative; border-radius: 24px; overflow:hidden; background:#263b25; min-height:300px; display:flex; align-items:flex-end; }}
        .article-hero-media {{ position:absolute; inset:0; }}
        .article-hero-media img {{ width:100%; height:100%; object-fit:cover; }}
        .article-hero-overlay {{ position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.7), transparent); }}
        .article-hero-content {{ position:relative; z-index:1; padding:40px; color:#fff; }}
        .article-category {{ display:inline-block; background:rgba(255,255,255,0.15); backdrop-filter:blur(4px); padding:6px 14px; border-radius:20px; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; }}
        .article-title {{ font-size:2.5rem; font-weight:700; margin:10px 0; }}
        .article-meta {{ display:flex; gap:16px; font-size:0.9rem; opacity:0.8; }}
        .article-layout {{ display:grid; grid-template-columns:1fr 300px; gap:40px; margin-top:30px; }}
        .blog-body {{ font-size:1.05rem; line-height:1.8; color:#333; }}
        .blog-body h2 {{ color:#2d4a2b; margin-top:2rem; }}
        .blog-body p {{ margin-bottom:1rem; }}
        .blog-related-articles {{ margin-top:2rem; padding:20px; background:#f1f5ee; border-radius:12px; }}
        .blog-related-articles ul {{ list-style:none; padding:0; }}
        .blog-related-articles li {{ margin:8px 0; }}
        .blog-related-articles a {{ color:#2d4a2b; font-weight:600; }}
        .article-sidebar {{ position:sticky; top:100px; }}
        .sidebar-card {{ background:#fff; border-radius:16px; padding:20px; margin-bottom:20px; box-shadow:0 4px 12px rgba(0,0,0,0.05); }}
        .sidebar-card h3 {{ font-size:1.1rem; color:#2d4a2b; margin-top:0; }}
        .article-share {{ display:flex; gap:8px; flex-wrap:wrap; }}
        .share-btn {{ padding:8px 16px; border-radius:30px; background:#f0f3ee; color:#2d4a2b; text-decoration:none; font-weight:600; font-size:0.8rem; }}
        .article-cta {{ display:inline-block; padding:12px 24px; background:#2d4a2b; color:#fff; border-radius:40px; text-decoration:none; font-weight:700; }}
        .article-bottom-cta {{ margin-top:40px; padding:30px; background:#2d4a2b; color:#fff; border-radius:20px; text-align:center; }}
        .article-bottom-cta a {{ color:#fff; background:rgba(255,255,255,0.2); padding:10px 24px; border-radius:40px; text-decoration:none; }}
        .medical-disclaimer {{ background:#f1f5ee; padding:20px; border-radius:12px; margin-top:30px; font-size:0.9rem; }}
        @media (max-width:768px) {{ .article-layout {{ grid-template-columns:1fr; }} .article-hero-content {{ padding:20px; }} .article-title {{ font-size:1.8rem; }} }}
    </style>
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <!-- Header (reuse from site) -->
    <header class="site-header" id="site-header">
        <div class="header-inner container">
            <a href="../index.html" class="logo" aria-label="Ibn Sina Hospital Home">
                <img src="https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp" alt="Ibn Sina Hospital Logo" class="logo-img" style="height:40px;width:auto;">
                <span class="logo-text">Ibn Sina <strong>Hospital</strong></span>
            </a>
            <nav class="main-nav" id="main-nav" aria-label="Main navigation">
                <ul class="nav-list">
                    <li><a href="../index.html" class="nav-link">Home</a></li>
                    <li><a href="../about.html" class="nav-link">About</a></li>
                    <li><a href="../services.html" class="nav-link">Services</a></li>
                    <li><a href="../doctors.html" class="nav-link">Doctors</a></li>
                    <li><a href="../gallery.html" class="nav-link">Gallery</a></li>
                    <li><a href="../blog.html" class="nav-link active">Blog</a></li>
                    <li><a href="../careers.html" class="nav-link">Careers</a></li>
                    <li><a href="../faq.html" class="nav-link">FAQ</a></li>
                    <li><a href="../contact.html" class="nav-link">Contact</a></li>
                </ul>
            </nav>
            <div class="header-actions">
                <a href="tel:9622552553" class="emergency-badge">📞 9622552553</a>
                <a href="../appointment.html" class="btn btn-primary">Book Appointment</a>
                <button class="hamburger" id="hamburger">☰</button>
            </div>
        </div>
    </header>

    <main id="main-content">
        <section class="article-page">
            <div class="article-shell">
                <nav class="article-breadcrumbs" style="margin-bottom:16px;">
                    <a href="../index.html">Home</a> / <a href="../blog.html">Health Insights</a> / <span>{escape_html(title)}</span>
                </nav>
                <div class="article-hero">
                    <div class="article-hero-media"><img src="{image}" alt="{escape_html(title)}" loading="eager"></div>
                    <div class="article-hero-overlay"></div>
                    <div class="article-hero-content">
                        <div class="article-category">{escape_html(category)}</div>
                        <h1 class="article-title">{escape_html(title)}</h1>
                        <div class="article-meta">
                            <span>📅 {formatted_date}</span>
                            <span>⏱ {reading_time} min read</span>
                            <span>Ibn Sina Hospital</span>
                        </div>
                    </div>
                </div>
                <div class="article-layout">
                    <div class="article-main">
                        <div class="blog-body">
                            {body_html}
                            {related_html}
                            <aside class="medical-disclaimer">
                                <strong>Medical Disclaimer</strong>
                                <p>The information provided is for educational purposes only. Consult a qualified healthcare professional.</p>
                            </aside>
                        </div>
                    </div>
                    <aside class="article-sidebar">
                        <div class="sidebar-card">
                            <h3>Share This Article</h3>
                            <div class="article-share">
                                <a href="https://wa.me/?text={escape_html(title)}%20-%20{page_url}" target="_blank" class="share-btn">WhatsApp</a>
                                <a href="https://www.facebook.com/sharer/sharer.php?u={page_url}" target="_blank" class="share-btn">Facebook</a>
                                <a href="#" onclick="navigator.clipboard?.writeText('{page_url}'); alert('Link copied!'); return false;" class="share-btn">Copy Link</a>
                            </div>
                        </div>
                        <div class="sidebar-card" style="background:#2d4a2b; color:#fff;">
                            <h3 style="color:#fff;">Need Medical Advice?</h3>
                            <p>Book an appointment with our experts.</p>
                            <a href="../appointment.html" class="article-cta" style="background:#fff; color:#2d4a2b;">Book Now</a>
                        </div>
                    </aside>
                </div>
                <div class="article-bottom-cta">
                    <h2>Have a health concern?</h2>
                    <p>Our team is here to help.</p>
                    <a href="../appointment.html">Book Appointment</a>
                </div>
                <div style="text-align:center; margin-top:30px;">
                    <a href="../blog.html">← Back to Health Insights</a>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer (reuse) -->
    <footer class="site-footer">
        <div class="footer-main container">
            <div class="footer-col">
                <h3>Ibn Sina <strong>Hospital</strong></h3>
                <address>Near Railway Station, Ompora, Budgam, J&K 191111</address>
                <p>📞 <a href="tel:9622552553">9622552553</a></p>
                <p>✉ <a href="mailto:weibnsina@gmail.com">weibnsina@gmail.com</a></p>
            </div>
            <div class="footer-col">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="../index.html">Home</a></li>
                    <li><a href="../about.html">About</a></li>
                    <li><a href="../services.html">Services</a></li>
                    <li><a href="../doctors.html">Doctors</a></li>
                    <li><a href="../blog.html">Blog</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 Ibn Sina Hospital. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>"""
        output_path = output_dir / filename
        output_path.write_text(html, encoding='utf-8')
        urls.append(page_url)
        pages.append((page_url, html))
        print(f"Generated blog article: {filename}")

    return urls, pages

# ========== GENERATE BLOG LISTING (blog.html) ==========
def generate_blog_listing(posts):
    """
    Generate blog.html with all published posts as static HTML cards.
    """
    published = [
        p for p in posts
        if (p.get('is_published') or '').strip().lower() in ['true', 'yes', '1']
    ]
    published.sort(
        key=lambda p: p.get('published_at') or p.get('date') or '',
        reverse=True
    )

    if not published:
        print("No published posts to generate blog listing.")
        return

    # Build HTML cards
    cards = []
    for idx, p in enumerate(posts):
        slug = slugify(p.get('slug') or p.get('title', ''))
        if not slug:
            continue
        title = escape_html(p.get('title', 'Health Article'))
        summary = escape_html(p.get('short_summary', ''))
        image = p.get('cover_image_url', 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp')
        date = format_blog_date(p.get('published_at') or p.get('date', ''))
        category = escape_html(p.get('category', 'Health & Wellness'))
        url = f"/blog/blog-{slug}.html"
        read_time = calculate_reading_time(p.get('body', ''))
        is_featured = idx == 0

        cards.append(f'''
        <article class="blog-preview-card blog-card fade-in{' blog-featured-card' if is_featured else ''}" data-category="{category}">
            <a href="{url}" class="blog-card-image-link" aria-label="Read {title}">
                <div class="blog-card-image-wrapper">
                    <img src="{image}" alt="{title}" class="blog-card-image" loading="{ 'eager' if is_featured else 'lazy' }" decoding="async">
                    <span class="blog-image-overlay">Read Article</span>
                </div>
            </a>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span class="blog-category">{category}</span>
                    <time datetime="{p.get('published_at') or ''}" class="blog-date">{date}</time>
                </div>
                <h2 class="blog-card-title"><a href="{url}">{title}</a></h2>
                <p>{summary}</p>
                <div class="blog-card-footer">
                    <span class="blog-reading-time">{read_time} min read</span>
                    <a href="{url}" class="read-more" aria-label="Read full article: {title}">Read Article →</a>
                </div>
            </div>
        </article>
        ''')

    cards_html = "\n".join(cards)

    # Now we need to read the existing blog.html template and replace the blog-grid content.
    blog_path = Path('blog.html')
    if not blog_path.exists():
        print("blog.html not found; cannot generate static listing.")
        return

    content = blog_path.read_text(encoding='utf-8')
    # Find the blog-grid container and replace its content
    start_marker = '<div class="blog-preview-grid" id="blog-grid"'
    end_marker = '</div>'  # we need to find the matching closing div

    # We'll replace everything between the opening <div> and the matching </div> that closes it.
    # Use a simple stack-based approach:
    import re
    pattern = re.compile(r'(<div\s+[^>]*id="blog-grid"[^>]*>)(.*?)(</div>)', re.DOTALL)
    def replacer(match):
        opening = match.group(1)
        # We keep the opening and closing tags, and replace the content with our cards
        return opening + '\n' + cards_html + '\n' + match.group(3)

    new_content = pattern.sub(replacer, content)
    blog_path.write_text(new_content, encoding='utf-8')
    print(f"Generated blog.html with {len(published)} posts.")

# ========== GENERATE DOCTOR LISTING (doctors.html) ==========
def generate_doctor_listing(doctors):
    """
    Generate doctors.html with all doctors as static HTML cards.
    """
    if not doctors:
        print("No doctors to generate listing.")
        return

    # Build HTML cards
    cards = []
    for d in doctors:
        name = escape_html(clean_name(d.get('name', '')))
        slug = slugify(d.get('name', ''))
        specialty = escape_html((d.get('specialty') or '').title())
        qualifications = escape_html(d.get('qualifications') or '')
        photo_url = d.get('photo_url') or 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp'
        dept = escape_html((d.get('department') or '').title())
        profile_url = f"/doctors/doctor-{slug}.html"
        appointment_url = f"/appointment.html?doctor={quote(d.get('name', ''))}"

        # Build placeholder or image
        if photo_url:
            img_html = f'<img src="{photo_url}" alt="{name}" style="width:80px;height:80px;object-fit:cover;border-radius:50%;margin:0 auto 1rem;display:block;" loading="lazy">'
        else:
            img_html = '<div class="doctor-card-img-placeholder" style="display:block;margin:0 auto 1rem;"><svg width="80" height="80" viewBox="0 0 60 60"><circle cx="30" cy="22" r="16" fill="#a4ac86" opacity="0.5"/><ellipse cx="30" cy="55" rx="22" ry="14" fill="#a4ac86" opacity="0.4"/></svg></div>'

        cards.append(f'''
        <div class="doctor-card fade-in" onclick="location.href='{profile_url}'" style="background:#fff;border:1px solid #e0e0d0;min-height:200px;">
            {img_html}
            <h3>{name}</h3>
            <p class="doctor-specialty">{specialty}</p>
            <p class="doctor-qual">{qualifications}</p>
            <a href="{appointment_url}" class="btn btn-outline btn-sm" aria-label="Book Appointment with {name}" onclick="event.stopPropagation();" style="margin-top:.8rem;color:#fff;background:#2d4a2b;">Book Appointment</a>
        </div>
        ''')

    cards_html = "\n".join(cards)

    doctors_path = Path('doctors.html')
    if not doctors_path.exists():
        print("doctors.html not found; cannot generate static listing.")
        return

    content = doctors_path.read_text(encoding='utf-8')
    # Replace content inside doctor-grid div
    import re
    pattern = re.compile(r'(<div\s+[^>]*id="doctor-grid"[^>]*>)(.*?)(</div>)', re.DOTALL)
    def replacer(match):
        return match.group(1) + '\n' + cards_html + '\n' + match.group(3)

    new_content = pattern.sub(replacer, content)
    doctors_path.write_text(new_content, encoding='utf-8')
    print(f"Generated doctors.html with {len(doctors)} doctors.")

# ========== GENERATE HOMEPAGE (index.html) ==========
def generate_homepage(posts, departments, doctors, updates):
    """
    Generate index.html with static content for Services, Departments, Featured Doctors, Blog Preview, Updates.
    """
    # Services are static – we'll just reuse the same STATIC_SERVICES list from main.js
    # but we need to embed them into index.html.
    # We'll generate the service cards HTML.
    service_cards_html = ""
    # Actually we need to import the STATIC_SERVICES list from main.js – but we can just define it here.
    STATIC_SERVICES = [
        {"title": "Ambulance Services", "description": "24/7 emergency ambulance service for transporting patients to and from the hospital.", "icon": "ambulance"},
        {"title": "Endoscopy", "description": "Advanced upper and lower GI endoscopy including colonoscopy for accurate internal diagnosis.", "icon": "endoscopy"},
        {"title": "Dialysis", "description": "In-house dialysis unit providing life-sustaining renal care with experienced nephrology support.", "icon": "dialysis"},
        {"title": "Digital X-Rays", "description": "High-resolution digital radiography with same-day results for fast, accurate diagnosis.", "icon": "digital-xray"},
        {"title": "Vaccinations", "description": "Complete immunization services for children and adults — routine, travel, and seasonal vaccines.", "icon": "vaccinations"},
        {"title": "TMT (Treadmill Test)", "description": "Cardiac stress testing for heart health assessment — conducted under expert supervision.", "icon": "tmt"},
        {"title": "Holter Monitoring", "description": "Continuous 24-hour ECG recording to detect irregular heart rhythms that may not appear during a routine ECG.", "icon": "holter"},
        {"title": "ABPM (Ambulatory Blood Pressure Monitoring)", "description": "24-hour blood pressure monitoring to assess hypertension patterns and adjust treatment accurately.", "icon": "abpm"},
        {"title": "Ultrasonography", "description": "Detailed ultrasound imaging for abdominal, obstetric, vascular, and soft-tissue evaluation.", "icon": "ultrasonography"},
        {"title": "Colonoscopy", "description": "Thorough colonoscopic screening and diagnostic procedures for gastrointestinal health.", "icon": "colonoscopy"},
        {"title": "24/7 Pharmacy", "description": "In-house pharmacy — we never close. Emergency medications and prescriptions anytime.", "icon": "pharmacy"},
        {"title": "24/7 Diagnostic Lab", "description": "Round-the-clock laboratory services for in-patients and out-patients, with rapid turnaround.", "icon": "lab"}
    ]
    # For each service, generate HTML (simplified, no icons for brevity, but we can add).
    service_cards = []
    for s in STATIC_SERVICES:
        service_cards.append(f'''
        <div class="service-card fade-in">
            <div class="service-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
            <h3>{escape_html(s['title'])}</h3>
            <p>{escape_html(s['description'])}</p>
        </div>
        ''')
    service_cards_html = "\n".join(service_cards)

    # Departments (first 6 for homepage)
    dept_cards_html = ""
    if departments:
        dept_cards = []
        for d in departments[:6]:
            name = escape_html(d.get('name', ''))
            slug = d.get('slug') or slugify(name)
            link = f"department-pages/{slug}.html"
            dept_cards.append(f'''
            <a href="{link}" class="service-card department-card" style="text-decoration:none;">
                <h3>{name}</h3>
            </a>
            ''')
        dept_cards_html = "\n".join(dept_cards)

    # Featured Doctors (first 6)
    featured_doctors_html = ""
    if doctors:
        doc_cards = []
        for d in doctors[:6]:
            name = escape_html(clean_name(d.get('name', '')))
            slug = slugify(d.get('name', ''))
            specialty = escape_html((d.get('specialty') or '').title())
            qual = escape_html(d.get('qualifications') or '')
            photo = d.get('photo_url') or ''
            img_html = f'<img src="{photo}" alt="{name}" style="width:80px;height:80px;object-fit:cover;border-radius:50%;margin:0 auto 1rem;display:block;" loading="lazy">' if photo else '<div class="doctor-card-img-placeholder"><svg width="80" height="80" viewBox="0 0 60 60"><circle cx="30" cy="22" r="16" fill="#a4ac86" opacity="0.5"/><ellipse cx="30" cy="55" rx="22" ry="14" fill="#a4ac86" opacity="0.4"/></svg></div>'
            profile_url = f"/doctors/doctor-{slug}.html"
            doc_cards.append(f'''
            <div class="doctor-card fade-in" onclick="location.href='{profile_url}'" style="background:#fff;border:1px solid #e0e0d0;min-height:200px;">
                {img_html}
                <h3>{name}</h3>
                <p class="doctor-specialty">{specialty}</p>
                <p class="doctor-qual">{qual}</p>
                <a href="/appointment.html?doctor={quote(d.get('name', ''))}" class="btn btn-outline btn-sm" onclick="event.stopPropagation();" style="margin-top:.8rem;color:#fff;background:#2d4a2b;">Book Appointment</a>
            </div>
            ''')
        featured_doctors_html = "\n".join(doc_cards)

    # Blog Preview (first 3)
    blog_preview_html = ""
    if posts:
        published = [p for p in posts if (p.get('is_published') or '').strip().lower() in ['true', 'yes', '1']]
        published.sort(key=lambda p: p.get('published_at') or p.get('date') or '', reverse=True)
        preview_posts = published[:3]
        blog_cards = []
        for p in preview_posts:
            slug = slugify(p.get('slug') or p.get('title', ''))
            title = escape_html(p.get('title', 'Health Article'))
            date = format_blog_date(p.get('published_at') or p.get('date', ''))
            summary = escape_html(p.get('short_summary', ''))
            image = p.get('cover_image_url', 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp')
            url = f"/blog/blog-{slug}.html"
            blog_cards.append(f'''
            <article class="blog-preview-card fade-in">
                <img src="{image}" alt="{title}" loading="lazy" style="width:100%;height:180px;object-fit:cover;border-radius:var(--radius);margin-bottom:0.8rem;">
                <h3><a href="{url}">{title}</a></h3>
                <time datetime="{p.get('published_at') or ''}">{date}</time>
                <p>{summary}</p>
            </article>
            ''')
        blog_preview_html = "\n".join(blog_cards)

    # Updates Carousel (first 3)
    updates_html = ""
    if updates:
        up_list = updates[:3]
        slides = []
        for u in up_list:
            media = u.get('media_url') or u.get('image_url') or u.get('link', '')
            title = escape_html(u.get('title', ''))
            desc = escape_html(u.get('description', ''))
            date = u.get('date', '')
            slides.append(f'''
            <div class="update-slide">
                <div class="update-media" style="background-image:url('{media}');"></div>
                <div class="update-caption">
                    <h3>{title}</h3>
                    <p>{desc}</p>
                    <small>{date}</small>
                </div>
            </div>
            ''')
        updates_html = "\n".join(slides)
        # Wrap in carousel structure
        updates_html = f'''
        <div class="carousel-wrapper">
            <div class="carousel-slides" id="carousel-slides">{updates_html}</div>
            <button class="carousel-prev" id="carousel-prev">❮</button>
            <button class="carousel-next" id="carousel-next">❯</button>
        </div>
        <div class="carousel-dots" id="carousel-dots">
            {''.join([f'<span class="dot" data-index="{i}"></span>' for i in range(len(up_list))])}
        </div>
        '''

    # Now read the current index.html template
    index_path = Path('index.html')
    if not index_path.exists():
        print("index.html not found; cannot generate homepage.")
        return

    content = index_path.read_text(encoding='utf-8')

    # Replace content inside each container with our generated HTML
    # We'll use regex to replace between the opening and closing tags of each container.
    # Services grid
    pattern_services = re.compile(r'(<div\s+[^>]*id="services-grid"[^>]*>)(.*?)(</div>)', re.DOTALL)
    content = pattern_services.sub(r'\g<1>\n' + service_cards_html + '\n\g<3>', content)

    # Departments grid
    pattern_dept = re.compile(r'(<div\s+[^>]*id="departments-grid"[^>]*>)(.*?)(</div>)', re.DOTALL)
    content = pattern_dept.sub(r'\g<1>\n' + dept_cards_html + '\n\g<3>', content)

    # Featured doctors grid
    pattern_feat = re.compile(r'(<div\s+[^>]*id="featured-doctor-cards"[^>]*>)(.*?)(</div>)', re.DOTALL)
    content = pattern_feat.sub(r'\g<1>\n' + featured_doctors_html + '\n\g<3>', content)

    # Blog preview grid
    pattern_blog = re.compile(r'(<div\s+[^>]*id="blog-preview-grid"[^>]*>)(.*?)(</div>)', re.DOTALL)
    content = pattern_blog.sub(r'\g<1>\n' + blog_preview_html + '\n\g<3>', content)

    # Updates carousel – we'll replace the entire contents inside updates-carousel div
    pattern_updates = re.compile(r'(<div\s+[^>]*id="updates-carousel"[^>]*>)(.*?)(</div>)', re.DOTALL)
    content = pattern_updates.sub(r'\g<1>\n' + updates_html + '\n\g<3>', content)

    # Write the updated index.html
    index_path.write_text(content, encoding='utf-8')
    print("Generated index.html with static content for all dynamic sections.")

# ========== GENERATE DEPARTMENT PAGES ==========
def generate_department_pages(departments, doctors):
    output_dir = Path('departments')
    manual_dir = Path('department-pages')
    urls = []
    pages = []

    for dept in departments:
        dept_name = (dept.get('name') or '').strip()
        slug = slugify(dept.get('slug') or dept_name)

        # Skip if a hand-built page exists
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
        f'{SITE_URL}/index.html',  # already covered by SITE_URL/
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

    # Generate static pages (unchanged)
    doctor_urls, doctor_pages = generate_doctor_pages(doctors, departments_by_name)
    blog_urls, blog_pages = generate_blog_pages(posts)
    dept_urls, dept_pages = generate_department_pages(departments, doctors)
    gallery_url, gallery_html = generate_gallery_page(gallery_items)

    # NEW: Generate static content for the main listing pages
    generate_blog_listing(posts)
    generate_doctor_listing(doctors)
    generate_homepage(posts, departments, doctors, updates)
    # Services page: we already have a static services.html, but we could also update it if needed.
    # For now, services are static in main.js, so we don't generate a separate services.html.

    # Collect manual department pages
    manual_dept_pages = collect_manual_department_pages()
    print(f"Found {len(manual_dept_pages)} manual department pages.")

    all_dynamic_urls = doctor_urls + blog_urls + dept_urls + [gallery_url] + [url for url, _ in manual_dept_pages]
    all_pages_with_content = doctor_pages + blog_pages + dept_pages + [(gallery_url, gallery_html)] + manual_dept_pages

    update_sitemap(all_pages_with_content)
    submit_to_indexnow(all_dynamic_urls)

    print("Generation, sitemap update, and IndexNow submission complete.")

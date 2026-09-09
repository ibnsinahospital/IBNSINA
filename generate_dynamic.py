import csv
import io
import urllib.request
from pathlib import Path
import datetime
import re
import json
import hashlib
import shutil
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
GENERATED_DIR = Path("generated-pages")

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

# ========== LASTMOD CACHE ==========
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

# ========== CREATE BACKUP ==========
def backup_file(file_path):
    """Create a backup of a file before we modify it."""
    if not Path(file_path).exists():
        return
    backup_dir = Path('backup')
    backup_dir.mkdir(exist_ok=True)
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = backup_dir / f'{Path(file_path).stem}_{timestamp}{Path(file_path).suffix}'
    shutil.copy2(file_path, backup_path)
    print(f"Created backup: {backup_path}")

# ========== ORPHAN CLEANUP ==========
def clean_orphaned_blog_files(posts):
    """Delete blog HTML files that no longer exist in the published posts list."""
    active_slugs = set()
    for p in posts:
        if (p.get('is_published') or '').strip().lower() in ['true', 'yes', '1']:
            slug = slugify(p.get('slug') or p.get('title', ''))
            if slug:
                active_slugs.add(f'blog-{slug}.html')

    blog_dir = Path('blog')
    if not blog_dir.exists():
        return

    removed = 0
    for file in blog_dir.glob('blog-*.html'):
        if file.name not in active_slugs:
            try:
                file.unlink()
                removed += 1
                print(f"Removed orphaned blog file: {file.name}")
            except Exception as e:
                print(f"Error removing {file.name}: {e}")

    if removed > 0:
        print(f"Cleaned up {removed} orphaned blog files.")

def clean_orphaned_doctor_files(doctors):
    """Delete doctor HTML files that no longer exist in the doctors list."""
    active_slugs = set()
    for d in doctors:
        slug = slugify(d.get('name', ''))
        if slug:
            active_slugs.add(f'doctor-{slug}.html')

    doc_dir = Path('doctors')
    if not doc_dir.exists():
        return

    removed = 0
    for file in doc_dir.glob('doctor-*.html'):
        if file.name not in active_slugs:
            try:
                file.unlink()
                removed += 1
                print(f"Removed orphaned doctor file: {file.name}")
            except Exception as e:
                print(f"Error removing {file.name}: {e}")

    if removed > 0:
        print(f"Cleaned up {removed} orphaned doctor files.")

def clean_orphaned_department_files(departments):
    """Delete auto-generated department HTML files that no longer exist in the departments list."""
    active_slugs = set()
    for d in departments:
        slug = slugify(d.get('slug') or d.get('name', ''))
        if slug:
            active_slugs.add(f'department-{slug}.html')

    dept_dir = Path('departments')
    if not dept_dir.exists():
        return

    removed = 0
    for file in dept_dir.glob('department-*.html'):
        if file.name not in active_slugs:
            try:
                file.unlink()
                removed += 1
                print(f"Removed orphaned department file: {file.name}")
            except Exception as e:
                print(f"Error removing {file.name}: {e}")

    if removed > 0:
        print(f"Cleaned up {removed} orphaned department files.")

# ========== UPDATE CRAWLABLE BLOG LINKS ==========
def update_blog_index_links(posts):
    blog_index = Path('blog.html')
    if not blog_index.exists():
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
        title_html = escape_html(title)
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
        return

    blog_index.write_text(updated, encoding='utf-8')
    print(f"Updated crawlable blog links in blog.html: {len(links)} published posts.")

# ========== REPLACE CONTAINER CONTENT (Safe) ==========
def replace_container_content(html, container_id, new_content):
    """
    Replaces the inside of a div with a specific ID. Uses a stack counter
    to handle nested divs safely.
    """
    import re
    pattern = re.compile(r'<div\s+[^>]*id="' + re.escape(container_id) + r'"[^>]*>', re.IGNORECASE)
    match = pattern.search(html)
    if not match:
        print(f"Warning: Container #{container_id} not found.")
        return html

    start = match.start()
    open_tag = match.group(0)
    pos = match.end()
    depth = 1

    while depth > 0 and pos < len(html):
        next_open = html.find('<', pos)
        if next_open == -1:
            break

        if html.startswith('</div>', next_open):
            depth -= 1
            if depth == 0:
                end_pos = next_open + len('</div>')
                break
            pos = next_open + len('</div>')
            continue

        if html.startswith('<div', next_open):
            depth += 1
            pos = next_open + len('<div')
            continue

        pos = next_open + 1

    if depth == 0:
        return html[:start + len(open_tag)] + '\n' + new_content + '\n' + html[end_pos:]
    else:
        print(f"Error: Could not find closing </div> for container '{container_id}'.")
        return html

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

        # Related doctors
        same_dept_doctors = [
            d for d in doctors
            if (d.get('department') or '').strip().lower() == dept_name.lower()
            and (d.get('name') or '') != doc.get('name', '')
        ][:4]
        related_links = ""
        if same_dept_doctors:
            items = "".join(
                f'<li><a href="doctor-{slugify(d.get("name",""))}.html">{clean_name(d.get("name",""))}</a></li>'
                for d in same_dept_doctors
            )
            related_links = f'<div class="related-doctors"><strong>Other {dept_name.title()} Specialists:</strong><ul>{items}</ul></div>'

        # Department link
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

# ========== GENERATE BLOG ARTICLES ==========
def generate_blog_pages(posts):
    output_dir = Path('blog')
    output_dir.mkdir(exist_ok=True)
    urls = []
    pages = []

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

        # Related articles
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

        # Premium blog article (simplified for brevity – your full template remains)
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape_html(title)} | Ibn Sina Hospital</title>
    <meta name="description" content="{escape_html(summary)}">
    <link rel="canonical" href="{page_url}">
    <meta property="og:title" content="{escape_html(title)}">
    <meta property="og:description" content="{escape_html(summary)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{page_url}">
    <meta property="og:image" content="{image}">
    <link rel="stylesheet" href="../css/style.css">
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
    <style>
        .article-page {{ background: #f8faf6; padding: 20px 0; }}
        .article-shell {{ max-width: 1180px; margin: 0 auto; padding: 20px; }}
        .article-hero {{ position:relative; border-radius: 24px; overflow:hidden; background:#263b25; min-height:300px; display:flex; align-items:flex-end; }}
        .article-hero-media {{ position:absolute; inset:0; }}
        .article-hero-media img {{ width:100%; height:100%; object-fit:cover; }}
        .article-hero-overlay {{ position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.7), transparent); }}
        .article-hero-content {{ position:relative; z-index:1; padding:40px; color:#fff; }}
        .article-category {{ display:inline-block; background:rgba(255,255,255,0.15); backdrop-filter:blur(4px); padding:6px 14px; border-radius:20px; font-size:0.8rem; text-transform:uppercase; }}
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

# ========== GENERATE BLOG LISTING ==========
def generate_blog_listing(posts):
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

    # Read template and replace container
    template_path = Path('blog.html')
    if not template_path.exists():
        print("blog.html not found; cannot generate static listing.")
        return

    content = template_path.read_text(encoding='utf-8')
    new_content = replace_container_content(content, "blog-grid", cards_html)

    # Write to generated-pages folder
    GENERATED_DIR.mkdir(exist_ok=True)
    output_path = GENERATED_DIR / 'blog.html'
    output_path.write_text(new_content, encoding='utf-8')
    print(f"Generated blog.html with {len(published)} posts → {output_path}")

# ========== GENERATE DOCTOR LISTING ==========
def generate_doctor_listing(doctors):
    if not doctors:
        print("No doctors to generate listing.")
        return

    cards = []
    for d in doctors:
        name = escape_html(clean_name(d.get('name', '')))
        slug = slugify(d.get('name', ''))
        specialty = escape_html((d.get('specialty') or '').title())
        qualifications = escape_html(d.get('qualifications') or '')
        photo_url = d.get('photo_url') or 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp'
        profile_url = f"/doctors/doctor-{slug}.html"
        appointment_url = f"/appointment.html?doctor={quote(d.get('name', ''))}"

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

    template_path = Path('doctors.html')
    if not template_path.exists():
        print("doctors.html not found; cannot generate static listing.")
        return

    content = template_path.read_text(encoding='utf-8')
    new_content = replace_container_content(content, "doctor-grid", cards_html)

    GENERATED_DIR.mkdir(exist_ok=True)
    output_path = GENERATED_DIR / 'doctors.html'
    output_path.write_text(new_content, encoding='utf-8')
    print(f"Generated doctors.html with {len(doctors)} doctors → {output_path}")

# ========== GENERATE HOMEPAGE ==========
def generate_homepage(posts, departments, doctors, updates):
    # Static Services
    STATIC_SERVICES = [
        {"title": "Ambulance Services", "description": "24/7 emergency ambulance service for transporting patients to and from the hospital."},
        {"title": "Endoscopy", "description": "Advanced upper and lower GI endoscopy including colonoscopy for accurate internal diagnosis."},
        {"title": "Dialysis", "description": "In-house dialysis unit providing life-sustaining renal care with experienced nephrology support."},
        {"title": "Digital X-Rays", "description": "High-resolution digital radiography with same-day results for fast, accurate diagnosis."},
        {"title": "Vaccinations", "description": "Complete immunization services for children and adults — routine, travel, and seasonal vaccines."},
        {"title": "TMT (Treadmill Test)", "description": "Cardiac stress testing for heart health assessment — conducted under expert supervision."},
        {"title": "Holter Monitoring", "description": "Continuous 24-hour ECG recording to detect irregular heart rhythms."},
        {"title": "ABPM (Ambulatory Blood Pressure Monitoring)", "description": "24-hour blood pressure monitoring to assess hypertension patterns."},
        {"title": "Ultrasonography", "description": "Detailed ultrasound imaging for abdominal, obstetric, vascular, and soft-tissue evaluation."},
        {"title": "Colonoscopy", "description": "Thorough colonoscopic screening and diagnostic procedures for gastrointestinal health."},
        {"title": "24/7 Pharmacy", "description": "In-house pharmacy — we never close. Emergency medications and prescriptions anytime."},
        {"title": "24/7 Diagnostic Lab", "description": "Round-the-clock laboratory services for in-patients and out-patients."}
    ]
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

    # Departments
    dept_cards_html = ""
    if departments:
        dept_cards = []
        for d in departments[:6]:
            name = escape_html(d.get('name', ''))
            slug = d.get('slug') or slugify(name)
            link = f"department-pages/{slug}.html"
            dept_cards.append(f'<a href="{link}" class="service-card department-card" style="text-decoration:none;"><h3>{name}</h3></a>')
        dept_cards_html = "\n".join(dept_cards)

    # Featured Doctors
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

    # Blog Preview
    blog_preview_html = ""
    if posts:
        published = [p for p in posts if (p.get('is_published') or '').strip().lower() in ['true', 'yes', '1']]
        published.sort(key=lambda p: p.get('published_at') or p.get('date') or '', reverse=True)
        for p in published[:3]:
            slug = slugify(p.get('slug') or p.get('title', ''))
            title = escape_html(p.get('title', 'Health Article'))
            date = format_blog_date(p.get('published_at') or p.get('date', ''))
            summary = escape_html(p.get('short_summary', ''))
            image = p.get('cover_image_url', 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp')
            url = f"/blog/blog-{slug}.html"
            blog_preview_html += f'''
            <article class="blog-preview-card fade-in">
                <img src="{image}" alt="{title}" loading="lazy" style="width:100%;height:180px;object-fit:cover;border-radius:var(--radius);margin-bottom:0.8rem;">
                <h3><a href="{url}">{title}</a></h3>
                <time datetime="{p.get('published_at') or ''}">{date}</time>
                <p>{summary}</p>
            </article>
            '''

    # Updates Carousel
    updates_html = ""
    if updates:
        slides = []
        for u in updates[:3]:
            media = u.get('media_url') or u.get('image_url') or u.get('link', '')
            title = escape_html(u.get('title', ''))
            desc = escape_html(u.get('description', ''))
            date = u.get('date', '')
            slides.append(f'''
            <div class="update-slide">
                <div class="update-media" style="background-image:url('{media}');"></div>
                <div class="update-caption"><h3>{title}</h3><p>{desc}</p><small>{date}</small></div>
            </div>
            ''')
        updates_html = f'''
        <div class="carousel-wrapper">
            <div class="carousel-slides">{''.join(slides)}</div>
            <button class="carousel-prev">❮</button>
            <button class="carousel-next">❯</button>
        </div>
        <div class="carousel-dots">{''.join([f'<span class="dot" data-index="{i}"></span>' for i in range(len(updates[:3]))])}</div>
        '''

    template_path = Path('index.html')
    if not template_path.exists():
        print("index.html not found; cannot generate homepage.")
        return

    content = template_path.read_text(encoding='utf-8')
    content = replace_container_content(content, "services-grid", service_cards_html)
    content = replace_container_content(content, "departments-grid", dept_cards_html)
    content = replace_container_content(content, "featured-doctor-cards", featured_doctors_html)
    content = replace_container_content(content, "blog-preview-grid", blog_preview_html)
    content = replace_container_content(content, "updates-carousel", updates_html)

    GENERATED_DIR.mkdir(exist_ok=True)
    output_path = GENERATED_DIR / 'index.html'
    output_path.write_text(content, encoding='utf-8')
    print(f"Generated index.html with static content → {output_path}")

# ========== GENERATE DEPARTMENT PAGES ==========
def generate_department_pages(departments, doctors):
    output_dir = Path('departments')
    manual_dir = Path('department-pages')
    urls = []
    pages = []

    for dept in departments:
        dept_name = (dept.get('name') or '').strip()
        slug = slugify(dept.get('slug') or dept_name)

        if (manual_dir / f'{slug}.html').exists():
            continue

        output_dir.mkdir(exist_ok=True)
        filename = f'department-{slug}.html'
        page_url = f'{SITE_URL}/departments/{filename}'
        title = f"{dept_name.title()} Department | Ibn Sina Hospital, Budgam"
        description = f"{dept_name.title()} department at Ibn Sina Hospital, Budgam — serving patients across Jammu and Kashmir."

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

# ========== UPDATE SITEMAP ==========
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
    print("=" * 50)
    print("IBN SINA HOSPITAL – STATIC GENERATOR")
    print("=" * 50)

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

    # Save JSON data for main.js
    save_json_data(doctors, departments, posts, gallery_items, updates)

    # Clean orphaned files BEFORE generating new ones
    print("\nCleaning orphaned files...")
    clean_orphaned_blog_files(posts)
    clean_orphaned_doctor_files(doctors)
    clean_orphaned_department_files(departments)

    departments_by_name = {(d.get('name') or '').strip().lower(): d for d in departments}

    # Generate individual pages (unchanged)
    print("\nGenerating individual pages...")
    doctor_urls, doctor_pages = generate_doctor_pages(doctors, departments_by_name)
    blog_urls, blog_pages = generate_blog_pages(posts)
    dept_urls, dept_pages = generate_department_pages(departments, doctors)
    gallery_url, gallery_html = generate_gallery_page(gallery_items)

    # Generate static listing pages (NOW in generated-pages/)
    print("\nGenerating static listing pages...")
    generate_blog_listing(posts)
    generate_doctor_listing(doctors)
    generate_homepage(posts, departments, doctors, updates)

    # Update blog.html static links (for SEO)
    update_blog_index_links(posts)

    # Collect manual department pages
    manual_dept_pages = collect_manual_department_pages()
    print(f"Found {len(manual_dept_pages)} manual department pages.")

    all_dynamic_urls = doctor_urls + blog_urls + dept_urls + [gallery_url] + [url for url, _ in manual_dept_pages]
    all_pages_with_content = doctor_pages + blog_pages + dept_pages + [(gallery_url, gallery_html)] + manual_dept_pages

    # Update sitemap
    update_sitemap(all_pages_with_content)

    # Submit to IndexNow
    submit_to_indexnow(all_dynamic_urls)

    print("\n" + "=" * 50)
    print("GENERATION COMPLETE!")
    print(f"✅ Generated pages saved to: {GENERATED_DIR}/")
    print(f"✅ Individual blog articles: /blog/")
    print(f"✅ Individual doctor profiles: /doctors/")
    print(f"✅ Sitemap updated: sitemap.xml")
    print("=" * 50)

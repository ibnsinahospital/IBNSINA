import csv
import io
import urllib.request
from pathlib import Path
import datetime
import re
import os

# ========== CONFIGURATION ==========
DOCTORS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_H8Rgr6VOjrap91SR_3nbBQLVf7QOQOHqZSs-pT6SfoNpyHjpj-QD0nNtcHDr5ip439naZ0sTr62Y/pub?output=csv"
BLOG_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRyksX4tU5UEPKPVbRGUiCe7lXxS-Z0WqSgB1vghBBqEvddzZ9M5ZSMtvfoCFPXRZoLojgWjIEmbQH8/pub?output=csv"
DEPARTMENTS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSY7cmsIsfCzFSfe6Gf6wG-XWffYscBhXHqnFqv0RvwuqbG7kNnPG7eSmSaR_E-ztlY8qLkHZ2yuL-t/pub?output=csv"

SITE_URL = "https://ibnsinahospital.in"

# ========== FETCH CSV ==========
def fetch_csv(url):
    with urllib.request.urlopen(url) as response:
        content = response.read().decode('utf-8')
    return list(csv.DictReader(io.StringIO(content)))

# ========== HELPER: SLUGIFY ==========
def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text

# ========== GENERATE DOCTOR PAGES ==========
def generate_doctor_pages(doctors):
    output_dir = Path('doctors')
    output_dir.mkdir(exist_ok=True)
    urls = []
    for doc in doctors:
        doc_id = doc.get('id') or slugify(doc.get('name', ''))
        slug = slugify(doc.get('name', ''))
        filename = f'doctor-{slug}.html'
        output_path = output_dir / filename
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{doc.get('name', 'Doctor')} | Ibn Sina Hospital</title>
    <meta name="description" content="View profile of {doc.get('name', 'Doctor')} – {doc.get('specialty', 'Doctor')} at Ibn Sina Hospital, Budgam.">
    <link rel="canonical" href="{SITE_URL}/doctors/{filename}">
    <meta property="og:title" content="{doc.get('name', 'Doctor')} | Ibn Sina Hospital">
    <meta property="og:description" content="View profile of {doc.get('name', 'Doctor')} – {doc.get('specialty', 'Doctor')} at Ibn Sina Hospital, Budgam.">
    <meta property="og:type" content="profile">
    <meta property="og:url" content="{SITE_URL}/doctors/{filename}">
    <meta property="og:image" content="https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp">
    <link rel="stylesheet" href="../css/style.css">
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
            <h1>{doc.get('name', 'Doctor')}</h1>
            <p><strong>Specialty:</strong> {doc.get('specialty', 'N/A')}</p>
            <p><strong>Department:</strong> {doc.get('department', 'N/A')}</p>
            <p><strong>Qualifications:</strong> {doc.get('qualifications', 'N/A')}</p>
            <div class="doctor-bio"><strong>About:</strong><br>{doc.get('about', 'No biography available.')}</div>
            <a href="../appointment.html?doctor={doc.get('name', '')}" class="btn btn-primary">Book Appointment</a>
        </div>
    </main>
    <footer class="site-footer">
        <div class="footer-main container">
            <p>&copy; 2025 Ibn Sina Hospital. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>"""
        output_path.write_text(html, encoding='utf-8')
        urls.append(f'{SITE_URL}/doctors/{filename}')
    return urls

# ========== GENERATE BLOG POST PAGES ==========
def generate_blog_pages(posts):
    output_dir = Path('blog')
    output_dir.mkdir(exist_ok=True)
    urls = []
    for post in posts:
        if post.get('is_published', '').strip().lower() not in ['true', 'yes', '1']:
            continue
        slug = slugify(post.get('slug') or post.get('title', ''))
        filename = f'blog-{slug}.html'
        output_path = output_dir / filename
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{post.get('title', 'Blog Post')} | Ibn Sina Hospital</title>
    <meta name="description" content="{post.get('short_summary', post.get('title', ''))}">
    <link rel="canonical" href="{SITE_URL}/blog/{filename}">
    <meta property="og:title" content="{post.get('title', 'Blog Post')} | Ibn Sina Hospital">
    <meta property="og:description" content="{post.get('short_summary', post.get('title', ''))}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{SITE_URL}/blog/{filename}">
    <meta property="og:image" content="{post.get('cover_image_url', 'https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp')}">
    <link rel="stylesheet" href="../css/style.css">
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
                <h1>{post.get('title', '')}</h1>
                <time>{post.get('published_at', '')}</time>
                <div class="blog-body">{post.get('body', '')}</div>
            </article>
        </div>
    </main>
    <footer class="site-footer">
        <div class="footer-main container">
            <p>&copy; 2025 Ibn Sina Hospital. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>"""
        output_path.write_text(html, encoding='utf-8')
        urls.append(f'{SITE_URL}/blog/{filename}')
    return urls

# ========== GENERATE DEPARTMENT PAGES ==========
def generate_department_pages(departments):
    output_dir = Path('departments')
    output_dir.mkdir(exist_ok=True)
    urls = []
    for dept in departments:
        slug = slugify(dept.get('slug') or dept.get('name', ''))
        filename = f'department-{slug}.html'
        output_path = output_dir / filename
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{dept.get('name', 'Department')} | Ibn Sina Hospital</title>
    <meta name="description" content="Learn about {dept.get('name', 'Department')} services at Ibn Sina Hospital, Budgam.">
    <link rel="canonical" href="{SITE_URL}/departments/{filename}">
    <link rel="stylesheet" href="../css/style.css">
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
            <h1>{dept.get('name', 'Department')}</h1>
            <p>Services and specialists in {dept.get('name', 'Department')} department.</p>
            <a href="../doctors.html?dept={dept.get('name', '')}" class="btn btn-primary">View Doctors</a>
        </div>
    </main>
    <footer class="site-footer">
        <div class="footer-main container">
            <p>&copy; 2025 Ibn Sina Hospital. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>"""
        output_path.write_text(html, encoding='utf-8')
        urls.append(f'{SITE_URL}/departments/{filename}')
    return urls

# ========== UPDATE SITEMAP ==========
def update_sitemap(extra_urls):
    sitemap_path = Path('sitemap.xml')
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
    all_urls = static_urls + extra_urls
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for url in all_urls:
        xml_content += f'  <url>\n    <loc>{url}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'
    xml_content += '</urlset>'
    sitemap_path.write_text(xml_content, encoding='utf-8')

# ========== MAIN ==========
if __name__ == "__main__":
    print("Fetching doctors...")
    doctors = fetch_csv(DOCTORS_URL)
    print(f"Found {len(doctors)} doctors.")
    doctor_urls = generate_doctor_pages(doctors)

    print("Fetching blog posts...")
    posts = fetch_csv(BLOG_URL)
    print(f"Found {len(posts)} blog posts.")
    blog_urls = generate_blog_pages(posts)

    print("Fetching departments...")
    departments = fetch_csv(DEPARTMENTS_URL)
    print(f"Found {len(departments)} departments.")
    dept_urls = generate_department_pages(departments)

    all_dynamic = doctor_urls + blog_urls + dept_urls
    update_sitemap(all_dynamic)
    print("Sitemap updated with dynamic pages.")
    print("Generation complete.")

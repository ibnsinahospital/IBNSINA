import csv
import datetime
import hashlib
import html
import io
import json
import re
import urllib.request
from pathlib import Path
from urllib.parse import quote

# ========== CONFIGURATION ==========
INDEXNOW_KEY = "78ee931b79be4739af08e1e0b0af036f"
HOST = "ibnsinahospital.in"
INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"
SITE_URL = "https://ibnsinahospital.in"

DOCTORS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_H8Rgr6VOjrap91SR_3nbBQLVf7QOQOHqZSs-pT6SfoNpyHjpj-QD0nNtcHDr5ip439naZ0sTr62Y/pub?output=csv"
BLOG_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRyksX4tU5UEPKPVbRGUiCe7lXxS-Z0WqSgB1vghBBqEvddzZ9M5ZSMtvfoCFPXRZoLojgWjIEmbQH8/pub?output=csv"
DEPARTMENTS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSY7cmsIsfCzFSfe6Gf6wG-XWffYscBhXHqnFqv0RvwuqbG7kNnPG7eSmSaR_E-ztlY8qLkHZ2yuL-t/pub?output=csv"

LASTMOD_CACHE_FILE = Path("lastmod_cache.json")

# ========== FETCH CSV ==========
def fetch_csv(url):
    request = urllib.request.Request(url, headers={"User-Agent": "IbnSinaHospital-SEO-Generator/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        content = response.read().decode("utf-8-sig")
    return list(csv.DictReader(io.StringIO(content)))

# ========== HELPERS ==========
def slugify(text):
    text = (text or "").lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def clean_name(raw_name):
    name = (raw_name or "").strip().rstrip(".")
    name = re.sub(r"^dr\.?\s*", "", name, flags=re.IGNORECASE).strip()
    name = " ".join(w.capitalize() for w in name.split())
    return f"Dr. {name}" if name else "Doctor"


def first_name_of(full_clean_name):
    parts = full_clean_name.replace("Dr.", "").strip().split()
    return parts[0] if parts else "the doctor"


def esc(value):
    return html.escape(str(value or ""), quote=True)


def build_about(doc, full_name):
    about = (doc.get("about") or "").strip()
    if about:
        return about

    first_name = first_name_of(full_name)
    specialty = (doc.get("specialty") or "doctor").strip().lower()
    department = (doc.get("department") or "").strip().title()
    qualifications = (doc.get("qualifications") or "").strip()
    qual_line = f" ({qualifications})" if qualifications else ""

    return (
        f"{full_name}{qual_line} is a {specialty} at Ibn Sina Hospital, Budgam, "
        f"serving patients across the Kashmir Valley. {first_name} provides "
        f"patient-focused {specialty} care through the {department} department."
    )


def load_lastmod_cache():
    if LASTMOD_CACHE_FILE.exists():
        try:
            return json.loads(LASTMOD_CACHE_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def save_lastmod_cache(cache):
    LASTMOD_CACHE_FILE.write_text(json.dumps(cache, indent=2, sort_keys=True), encoding="utf-8")


def get_lastmod(url, content, cache, today):
    content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
    entry = cache.get(url)
    if entry and entry.get("hash") == content_hash and entry.get("lastmod"):
        return entry["lastmod"]
    cache[url] = {"hash": content_hash, "lastmod": today}
    return today


def breadcrumb_html(items):
    links = ['<a href="/">Home</a>']
    for label, href in items:
        links.append(f'<a href="{esc(href)}">{esc(label)}</a>')
    return '<nav class="breadcrumbs" aria-label="Breadcrumb">' + " &raquo; ".join(links) + "</nav>"


def cleanup_generated_files(directory, prefix):
    directory = Path(directory)
    directory.mkdir(exist_ok=True)
    for path in directory.glob(f"{prefix}-*.html"):
        path.unlink()

# ========== GENERATE DOCTOR PAGES ==========
def generate_doctor_pages(doctors):
    output_dir = Path("doctors")
    cleanup_generated_files(output_dir, "doctor")
    urls, pages = [], []

    for doc in doctors:
        raw_name = (doc.get("name") or "").strip()
        if not raw_name:
            continue

        full_name = clean_name(raw_name)
        slug = slugify(raw_name)
        if not slug:
            continue

        filename = f"doctor-{slug}.html"
        page_url = f"{SITE_URL}/doctors/{filename}"
        dept_name = (doc.get("department") or "").strip()
        dept_slug = slugify(dept_name)
        specialty = (doc.get("specialty") or "Doctor").strip()
        qualifications = (doc.get("qualifications") or "").strip()
        photo_url = (doc.get("photo_url") or "https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp").strip()
        about_text = build_about(doc, full_name)

        title = f"{full_name} | {specialty.title()} | Ibn Sina Hospital, Budgam"
        description = f"{full_name} is a {specialty} at Ibn Sina Hospital, Budgam. View qualifications, department, expertise and book an appointment."
        appointment_link = f"../appointment.html?doctor={quote(full_name)}"

        same_dept = [
            d for d in doctors
            if (d.get("department") or "").strip().lower() == dept_name.lower()
            and (d.get("name") or "").strip().lower() != raw_name.lower()
        ][:4]
        related_links = ""
        if same_dept:
            items = "".join(
                f'<li><a href="doctor-{esc(slugify(d.get("name", "")))}.html">{esc(clean_name(d.get("name", "")))}</a></li>'
                for d in same_dept if slugify(d.get("name", ""))
            )
            if items:
                related_links = f'<section class="related-doctors"><h2>Other {esc(dept_name.title())} Specialists</h2><ul>{items}</ul></section>'

        dept_link_html = ""
        breadcrumb_items = [("Doctors", "../doctors.html")]
        if dept_name and dept_slug:
            dept_href = f"../departments/department-{dept_slug}.html"
            dept_link_html = f'<p><a href="{dept_href}">View {esc(dept_name.title())} Department &rarr;</a></p>'
            breadcrumb_items.append((dept_name.title(), dept_href))
        breadcrumb_items.append((full_name, page_url))

        json_ld = {
            "@context": "https://schema.org",
            "@type": "Physician",
            "name": full_name,
            "medicalSpecialty": specialty,
            "url": page_url,
            "image": photo_url,
            "worksFor": {
                "@type": "Hospital",
                "name": "Ibn Sina Hospital",
                "url": SITE_URL,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Budgam",
                    "addressRegion": "Jammu and Kashmir",
                    "addressCountry": "IN"
                }
            }
        }
        if qualifications:
            json_ld["hasCredential"] = qualifications
        if about_text:
            json_ld["description"] = about_text

        html_doc = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{esc(title)}</title>
    <meta name="description" content="{esc(description)}">
    <meta name="robots" content="index,follow,max-image-preview:large">
    <link rel="canonical" href="{esc(page_url)}">
    <meta property="og:title" content="{esc(title)}">
    <meta property="og:description" content="{esc(description)}">
    <meta property="og:type" content="profile">
    <meta property="og:url" content="{esc(page_url)}">
    <meta property="og:image" content="{esc(photo_url)}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="stylesheet" href="../css/style.css">
    <script type="application/ld+json">{json.dumps(json_ld, ensure_ascii=False)}</script>
</head>
<body>
<header class="site-header"><div class="header-inner container">
    <a href="../index.html" class="logo">Ibn Sina <strong>Hospital</strong></a>
    <nav class="main-nav"><ul class="nav-list">
        <li><a href="../index.html">Home</a></li><li><a href="../doctors.html">Doctors</a></li>
        <li><a href="../services.html">Services</a></li><li><a href="../contact.html">Contact</a></li>
    </ul></nav>
</div></header>
<main class="section"><div class="container">
    {breadcrumb_html(breadcrumb_items)}
    <img src="{esc(photo_url)}" alt="{esc(full_name)} - {esc(specialty)} at Ibn Sina Hospital" class="doctor-photo" width="200" height="200" loading="eager">
    <h1>{esc(full_name)}</h1>
    <p><strong>Specialty:</strong> {esc(specialty.title())}</p>
    <p><strong>Department:</strong> {esc(dept_name.title() or "Medical Services")}</p>
    <p><strong>Qualifications:</strong> {esc(qualifications or "N/A")}</p>
    {dept_link_html}
    <section class="doctor-bio"><h2>About {esc(full_name)}</h2><p>{esc(about_text)}</p></section>
    {related_links}
    <p><a href="{esc(appointment_link)}" class="btn btn-primary">Book Appointment</a></p>
</div></main>
<footer class="site-footer"><div class="footer-main container"><p>&copy; 2026 Ibn Sina Hospital, Budgam. All rights reserved.</p></div></footer>
</body></html>'''
        (output_dir / filename).write_text(html_doc, encoding="utf-8")
        urls.append(page_url)
        pages.append((page_url, html_doc))

    return urls, pages

# ========== GENERATE BLOG PAGES ==========
def generate_blog_pages(posts):
    output_dir = Path("blog")
    cleanup_generated_files(output_dir, "blog")
    urls, pages = [], []

    for post in posts:
        if (post.get("is_published") or "").strip().lower() not in {"true", "yes", "1"}:
            continue

        slug = slugify(post.get("slug") or post.get("title") or "")
        if not slug:
            continue
        filename = f"blog-{slug}.html"
        page_url = f"{SITE_URL}/blog/{filename}"
        title = (post.get("title") or "Health Article").strip()
        summary = (post.get("short_summary") or title).strip()
        image = (post.get("cover_image_url") or "https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp").strip()
        published_at = (post.get("published_at") or "").strip()
        body = post.get("body") or ""

        json_ld = {
            "@context": "https://schema.org",
            "@type": "Article",
            "mainEntityOfPage": {"@type": "WebPage", "@id": page_url},
            "headline": title,
            "description": summary,
            "image": image,
            "author": {"@type": "Organization", "name": "Ibn Sina Hospital", "url": SITE_URL},
            "publisher": {"@type": "Hospital", "name": "Ibn Sina Hospital", "url": SITE_URL},
        }
        if published_at:
            json_ld["datePublished"] = published_at
            json_ld["dateModified"] = published_at

        html_doc = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{esc(title)} | Ibn Sina Hospital</title>
    <meta name="description" content="{esc(summary)}">
    <meta name="robots" content="index,follow,max-image-preview:large">
    <link rel="canonical" href="{esc(page_url)}">
    <meta property="og:title" content="{esc(title)} | Ibn Sina Hospital">
    <meta property="og:description" content="{esc(summary)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{esc(page_url)}">
    <meta property="og:image" content="{esc(image)}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="stylesheet" href="../css/style.css">
    <script type="application/ld+json">{json.dumps(json_ld, ensure_ascii=False)}</script>
</head>
<body>
<header class="site-header"><div class="header-inner container">
    <a href="../index.html" class="logo">Ibn Sina <strong>Hospital</strong></a>
    <nav class="main-nav"><ul class="nav-list"><li><a href="../index.html">Home</a></li><li><a href="../blog.html">Blog</a></li><li><a href="../contact.html">Contact</a></li></ul></nav>
</div></header>
<main class="section"><div class="container">
    {breadcrumb_html([("Blog", "../blog.html"), (title, page_url)])}
    <article><h1>{esc(title)}</h1>
    {f'<time datetime="{esc(published_at)}">{esc(published_at)}</time>' if published_at else ''}
    <div class="blog-body">{body}</div></article>
</div></main>
<footer class="site-footer"><div class="footer-main container"><p>&copy; 2026 Ibn Sina Hospital, Budgam. All rights reserved.</p></div></footer>
</body></html>'''
        (output_dir / filename).write_text(html_doc, encoding="utf-8")
        urls.append(page_url)
        pages.append((page_url, html_doc))

    return urls, pages

# ========== GENERATE DEPARTMENT PAGES ==========
def generate_department_pages(departments, doctors):
    output_dir = Path("departments")
    cleanup_generated_files(output_dir, "department")
    urls, pages = [], []

    for dept in departments:
        dept_name = (dept.get("name") or "").strip()
        slug = slugify(dept.get("slug") or dept_name)
        if not dept_name or not slug:
            continue

        filename = f"department-{slug}.html"
        page_url = f"{SITE_URL}/departments/{filename}"
        title = f"{dept_name.title()} Department | Ibn Sina Hospital, Budgam"
        description = f"{dept_name.title()} department at Ibn Sina Hospital, Budgam — expert specialists and patient-focused care for Jammu and Kashmir."

        dept_doctors = [d for d in doctors if (d.get("department") or "").strip().lower() == dept_name.lower()]
        doctor_list_html = ""
        if dept_doctors:
            items = "".join(
                f'<li><a href="../doctors/doctor-{esc(slugify(d.get("name", "")))}.html">{esc(clean_name(d.get("name", "")))} — {esc((d.get("specialty") or "").title())}</a></li>'
                for d in dept_doctors if slugify(d.get("name", ""))
            )
            if items:
                doctor_list_html = f'<section class="dept-doctors"><h2>Our {esc(dept_name.title())} Specialists</h2><ul>{items}</ul></section>'

        json_ld = {
            "@context": "https://schema.org",
            "@type": "MedicalOrganization",
            "name": f"{dept_name.title()} Department, Ibn Sina Hospital",
            "url": page_url,
            "medicalSpecialty": dept_name.title(),
            "parentOrganization": {"@type": "Hospital", "name": "Ibn Sina Hospital", "url": SITE_URL},
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Budgam",
                "addressRegion": "Jammu and Kashmir",
                "addressCountry": "IN"
            }
        }

        html_doc = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{esc(title)}</title>
    <meta name="description" content="{esc(description)}">
    <meta name="robots" content="index,follow,max-image-preview:large">
    <link rel="canonical" href="{esc(page_url)}">
    <meta property="og:title" content="{esc(title)}">
    <meta property="og:description" content="{esc(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{esc(page_url)}">
    <meta name="twitter:card" content="summary">
    <link rel="stylesheet" href="../css/style.css">
    <script type="application/ld+json">{json.dumps(json_ld, ensure_ascii=False)}</script>
</head>
<body>
<header class="site-header"><div class="header-inner container">
    <a href="../index.html" class="logo">Ibn Sina <strong>Hospital</strong></a>
    <nav class="main-nav"><ul class="nav-list"><li><a href="../index.html">Home</a></li><li><a href="../doctors.html">Doctors</a></li><li><a href="../services.html">Services</a></li><li><a href="../contact.html">Contact</a></li></ul></nav>
</div></header>
<main class="section"><div class="container">
    {breadcrumb_html([("Departments", "../services.html"), (dept_name.title(), page_url)])}
    <h1>{esc(dept_name.title())} Department</h1>
    <p>The {esc(dept_name.title())} department at Ibn Sina Hospital, Budgam provides expert care to patients across Jammu and Kashmir.</p>
    {doctor_list_html}
    <p><a href="../doctors.html" class="btn btn-primary">View All Doctors</a> <a href="../appointment.html" class="btn btn-primary">Book an Appointment</a></p>
</div></main>
<footer class="site-footer"><div class="footer-main container"><p>&copy; 2026 Ibn Sina Hospital, Budgam. All rights reserved.</p></div></footer>
</body></html>'''
        (output_dir / filename).write_text(html_doc, encoding="utf-8")
        urls.append(page_url)
        pages.append((page_url, html_doc))

    return urls, pages

# ========== SITEMAP ==========
def update_sitemap(all_pages_with_content):
    cache = load_lastmod_cache()
    today = datetime.date.today().isoformat()

    static_files = [
        ("/", "index.html", "1.0"),
        ("/about.html", "about.html", "0.7"),
        ("/services.html", "services.html", "0.7"),
        ("/doctors.html", "doctors.html", "0.8"),
        ("/gallery.html", "gallery.html", "0.6"),
        ("/blog.html", "blog.html", "0.8"),
        ("/careers.html", "careers.html", "0.5"),
        ("/faq.html", "faq.html", "0.6"),
        ("/contact.html", "contact.html", "0.7"),
        ("/appointment.html", "appointment.html", "0.7"),
    ]

    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url_path, file_name, priority in static_files:
        file_path = Path(file_name)
        if not file_path.exists():
            continue
        content = file_path.read_text(encoding="utf-8")
        url = f"{SITE_URL}{url_path}"
        lastmod = get_lastmod(url, content, cache, today)
        xml_parts.append(f"  <url>\n    <loc>{url}</loc>\n    <lastmod>{lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>{priority}</priority>\n  </url>")

    seen = set()
    for url, content in all_pages_with_content:
        if url in seen:
            continue
        seen.add(url)
        lastmod = get_lastmod(url, content, cache, today)
        xml_parts.append(f"  <url>\n    <loc>{url}</loc>\n    <lastmod>{lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>")

    xml_parts.append("</urlset>")
    Path("sitemap.xml").write_text("\n".join(xml_parts) + "\n", encoding="utf-8")
    save_lastmod_cache(cache)

# ========== INDEXNOW ==========
def submit_to_indexnow(url_list):
    if not url_list:
        return
    data = {
        "host": HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": f"https://{HOST}/{INDEXNOW_KEY}.txt",
        "urlList": list(dict.fromkeys(url_list))
    }
    req = urllib.request.Request(
        INDEXNOW_ENDPOINT,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "IbnSinaHospital-SEO-Generator/1.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            print(f"IndexNow submitted {len(data['urlList'])} URLs. Status: {response.status}")
    except Exception as exc:
        print(f"IndexNow submission failed: {exc}")

# ========== MAIN ==========
if __name__ == "__main__":
    print("Fetching doctors...")
    doctors = fetch_csv(DOCTORS_URL)
    print(f"Found {len(doctors)} doctors.")
    if not doctors:
        raise RuntimeError("Doctors feed is empty; refusing to delete generated doctor pages.")

    print("Fetching departments...")
    departments = fetch_csv(DEPARTMENTS_URL)
    print(f"Found {len(departments)} departments.")
    if not departments:
        raise RuntimeError("Departments feed is empty; refusing to delete generated department pages.")

    print("Fetching blog posts...")
    posts = fetch_csv(BLOG_URL)
    print(f"Found {len(posts)} blog rows.")

    doctor_urls, doctor_pages = generate_doctor_pages(doctors)
    blog_urls, blog_pages = generate_blog_pages(posts)
    dept_urls, dept_pages = generate_department_pages(departments, doctors)

    all_dynamic_urls = doctor_urls + blog_urls + dept_urls
    all_pages_with_content = doctor_pages + blog_pages + dept_pages

    update_sitemap(all_pages_with_content)
    submit_to_indexnow(all_dynamic_urls)
    print("Generation, sitemap update, and IndexNow submission complete.")

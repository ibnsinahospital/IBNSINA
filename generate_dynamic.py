import csv
import io
import re
import json
import hashlib
import datetime
import urllib.request
import html as html_mod
from pathlib import Path
from urllib.parse import quote


# =====================================================================
# CONFIGURATION
# =====================================================================
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
GALLERY_TEMPLATE_PATH = Path("gallery_template.html")


# =====================================================================
# SPECIALTY → PROFESSION (for "is a nephrologist" style descriptions)
# =====================================================================
SPECIALTY_TO_PROFESSION = {
    "cardiology": "consultant cardiologist",
    "ctvs": "cardiothoracic surgeon",
    "dental": "dental surgeon",
    "dentistry": "dental surgeon",
    "dermatology": "dermatologist",
    "endocrinology": "endocrinologist",
    "ent": "ENT specialist",
    "gastroenterology": "gastroenterologist",
    "general surgery": "general surgeon",
    "general-surgery": "general surgeon",
    "general medicine": "internal medicine specialist",
    "general-medicine": "internal medicine specialist",
    "gynaecology": "consultant gynaecologist",
    "gynecology": "consultant gynaecologist",
    "nephrology": "consultant nephrologist",
    "neurosurgery": "neurosurgeon",
    "neurology": "neurologist",
    "ophthalmology": "ophthalmologist",
    "orthopaedics": "orthopaedic surgeon",
    "orthopedics": "orthopaedic surgeon",
    "pediatrics": "paediatrician",
    "pediatric surgery": "paediatric surgeon",
    "pediatric-surgery": "paediatric surgeon",
    "physiotherapy": "physiotherapist",
    "plastic surgery": "plastic surgeon",
    "plastic-surgery": "plastic surgeon",
    "psychiatry": "psychiatrist",
    "pulmonology": "pulmonologist",
    "radiology": "consultant radiologist",
    "rheumatology": "rheumatologist",
    "urology": "consultant urologist",
}


# Schema.org MedicalSpecialty enum values
SPECIALTY_TO_SCHEMA = {
    "cardiology": "Cardiovascular",
    "ctvs": "Cardiovascular",
    "dental": "Dentistry",
    "dentistry": "Dentistry",
    "dermatology": "Dermatology",
    "endocrinology": "Endocrine",
    "ent": "Otolaryngologic",
    "gastroenterology": "Gastroenterologic",
    "general surgery": "Surgical",
    "general-surgery": "Surgical",
    "general medicine": "PrimaryCare",
    "general-medicine": "PrimaryCare",
    "gynaecology": "Gynecologic",
    "gynecology": "Gynecologic",
    "nephrology": "Nephrology",
    "neurosurgery": "Surgical",
    "neurology": "Neurologic",
    "ophthalmology": "Ophthalmology",
    "orthopaedics": "Musculoskeletal",
    "orthopedics": "Musculoskeletal",
    "pediatrics": "Pediatric",
    "pediatric surgery": "Pediatric",
    "pediatric-surgery": "Pediatric",
    "physiotherapy": "Physiotherapy",
    "plastic surgery": "PlasticSurgery",
    "plastic-surgery": "PlasticSurgery",
    "psychiatry": "Psychiatric",
    "pulmonology": "Pulmonary",
    "radiology": "Radiography",
    "rheumatology": "Rheumatologic",
    "urology": "Urologic",
}


DEPT_DISPLAY_NAMES = {
    "optholmology": "Ophthalmology",
    "opthalmology": "Ophthalmology",
    "ophthalmology": "Ophthalmology",
    "orthropedics": "Orthopaedics",
    "orthropedics & joint replacement": "Orthopaedics & Joint Replacement",
    "orthropedics-joint-replacement": "Orthopaedics & Joint Replacement",
    "orthopedics": "Orthopaedics",
    "orthopedics & joint replacement": "Orthopaedics & Joint Replacement",
    "gynecology": "Gynaecology",
    "gynaecology": "Gynaecology",
    "neonatal intensive care unit": "Neonatal Intensive Care Unit",
    "nicu": "Neonatal Intensive Care Unit",
}


DEPT_SLUG_OVERRIDES = {
    "optholmology": "ophthalmology",
    "opthalmology": "ophthalmology",
    "orthropedics": "orthopaedics",
    "orthropedics & joint replacement": "orthopaedics",
    "orthropedics-joint-replacement": "orthopaedics",
    "orthopedics": "orthopaedics",
    "orthopedics & joint replacement": "orthopaedics",
    "gynecology": "gynaecology",
    "pediatric surgery": "pediatric-surgery",
    "pediatrics": "pediatric-surgery",
    "general surgery": "general-surgery",
    "general medicine": "general-medicine",
    "plastic surgery": "plastic-surgery",
    "ent": "ent",
    "urology": "urology",
    "gastroenterology": "gastroenterology",
    "cardiology": "cardiology",
    "nephrology": "nephrology",
    "radiology": "radiology",
    "dermatology": "dermatology",
    "pulmonology": "pulmonology",
    "rheumatology": "rheumatology",
    "physiotherapy": "physiotherapy",
    "dentistry": "dentistry",
    "neonatal intensive care unit": "neonatal-intensive-care-unit",
    "nicu": "neonatal-intensive-care-unit",
}


# =====================================================================
# HELPERS
# =====================================================================
def slugify(text):
    text = (text or "").lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text


def resolve_dept_slug(dept_name):
    key = (dept_name or "").strip().lower()
    if key in DEPT_SLUG_OVERRIDES:
        return DEPT_SLUG_OVERRIDES[key]
    return slugify(dept_name)


def display_dept_name(dept_name):
    key = (dept_name or "").strip().lower()
    if key in DEPT_DISPLAY_NAMES:
        return DEPT_DISPLAY_NAMES[key]
    return (dept_name or "").title()


def profession_for(specialty):
    key = (specialty or "").strip().lower()
    return SPECIALTY_TO_PROFESSION.get(key, "consultant specialist")


def schema_specialty_for(specialty):
    key = (specialty or "").strip().lower()
    return SPECIALTY_TO_SCHEMA.get(key, (specialty or "").title())


def clean_name(raw_name):
    name = (raw_name or "").strip().rstrip(".")
    name = re.sub(r"^dr\.?\s*", "", name, flags=re.IGNORECASE).strip()
    name = " ".join(w.capitalize() for w in name.split())
    return f"Dr. {name}" if name else "Doctor"


def first_name_of(full_clean_name):
    parts = full_clean_name.replace("Dr.", "").strip().split()
    return parts[0] if parts else "the doctor"


def smart_truncate(text, limit=160):
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[: limit - 3].rsplit(" ", 1)[0] + "..."


def build_about(doc, full_name):
    about = (doc.get("about") or "").strip()
    if about:
        return about
    first_name = first_name_of(full_name)
    specialty = (doc.get("specialty") or "").strip().lower()
    department = display_dept_name(doc.get("department") or "")
    qualifications = (doc.get("qualifications") or "").strip()
    qual_line = f" ({qualifications})" if qualifications else ""
    return (
        f"{full_name}{qual_line} is a consultant {profession_for(specialty)} "
        f"at Ibn Sina Hospital, Budgam, in the {department} department. "
        f"{first_name} combines clinical precision with a warm, patient-first approach, "
        f"providing dependable care to patients across the Kashmir Valley."
    )


# =====================================================================
# BLOG BODY FORMATTER (fixed — no backslashes inside f-strings)
# =====================================================================
def format_blog_body(raw):
    if not raw:
        return ""
    text = str(raw).replace("\u200b", "").replace("\u200d", "").replace("\ufeff", "")

    if re.search(r"<(p|div|ul|ol|h2|h3|br)\b", text, re.I):
        return text

    blocks = re.split(r"\n\s*\n", text)
    html_out = ""
    lead_assigned = False

    for block in blocks:
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        if not lines:
            continue

        # --- FIX: extract regex matches BEFORE f-string ---
        if len(lines) == 1 and re.match(r"^##\s+", lines[0]):
            heading_text = html_mod.escape(re.sub(r"^##\s+", "", lines[0]))
            html_out += f"<h2>{heading_text}</h2>"
            continue
        if len(lines) == 1 and re.match(r"^###\s+", lines[0]):
            heading_text = html_mod.escape(re.sub(r"^###\s+", "", lines[0]))
            html_out += f"<h3>{heading_text}</h3>"
            continue

        is_bulleted = all(re.match(r"^[-•*]\s+", l) for l in lines)
        is_numbered = all(re.match(r"^\d+[.)]\s+", l) for l in lines)

        if is_bulleted:
            items = ""
            for l in lines:
                item_text = html_mod.escape(re.sub(r"^[-•*]\s+", "", l))
                items += f"<li>{item_text}</li>"
            html_out += f"<ul>{items}</ul>"
        elif is_numbered:
            items = ""
            for l in lines:
                item_text = html_mod.escape(re.sub(r"^\d+[.)]\s+", "", l))
                items += f"<li>{item_text}</li>"
            html_out += f"<ol>{items}</ol>"
        else:
            joined = " ".join(lines)
            if len(lines) == 1 and joined.endswith("?") and len(joined.split()) <= 20:
                pq = html_mod.escape(joined)
                html_out += f'<p class="blog-pull-quote">{pq}</p>'
            elif (
                len(lines) == 1
                and len(joined.split()) <= 8
                and not re.search(r"[.!?:;,]$", joined)
                and re.match(r"^[A-Z]", joined)
            ):
                sub = html_mod.escape(joined)
                html_out += f'<h3 class="blog-subheading">{sub}</h3>'
            else:
                if not lead_assigned:
                    html_out += f'<p class="blog-lead-paragraph">{html_mod.escape(joined)}</p>'
                    lead_assigned = True
                else:
                    html_out += f"<p>{html_mod.escape(joined)}</p>"

    return html_out


def fix_relative_links(html_body):
    if not html_body:
        return ""
    safe_prefixes = ("/", "http://", "https://", "#", "../", "mailto:", "tel:", "whatsapp:")

    def replacer(match):
        quote_char = match.group(1)
        url = match.group(2)
        if url.startswith(safe_prefixes):
            return f"href={quote_char}{url}{quote_char}"
        return f"href={quote_char}../{url}{quote_char}"

    return re.sub(r'href=(["\'])([^"\']+)\1', replacer, html_body)


def build_toc(body_html, min_headings=3):
    headings = re.findall(r"<h2[^>]*>(.*?)</h2>", body_html, re.I | re.S)
    if len(headings) < min_headings:
        return ""
    items = ""
    for i, h in enumerate(headings, start=1):
        clean = re.sub(r"<[^>]+>", "", h).strip()
        items += f'<li><a href="#section-{i}">{html_mod.escape(clean)}</a></li>'
    return (
        '<nav class="blog-toc" aria-label="Table of contents">'
        "<h2>In this article</h2>"
        f"<ul>{items}</ul>"
        "</nav>"
    )


def inject_heading_ids(body_html):
    # --- FIX: extract nested quote lookup to a local variable ---
    counter = {"n": 0}

    def replacer(match):
        counter["n"] += 1
        n = counter["n"]
        attrs = match.group(1) or ""
        inner = match.group(2)
        if "id=" in attrs:
            return match.group(0)
        return f'<h2{attrs} id="section-{n}">{inner}</h2>'

    return re.sub(r"<h2([^>]*)>(.*?)</h2>", replacer, body_html, flags=re.I | re.S)


def build_byline_html(post):
    author_name = (post.get("author_name") or "").strip()
    author_slug = (post.get("author_slug") or "").strip()
    reviewer_name = (post.get("reviewer_name") or "").strip()
    reviewer_slug = (post.get("reviewer_slug") or "").strip()
    published = (post.get("published_at") or post.get("date") or "").strip()
    updated = (post.get("updated_at") or "").strip()

    parts = []

    if author_name:
        a_e = html_mod.escape(author_name)
        if author_slug:
            parts.append(f'By <a href="../doctors/{html_mod.escape(author_slug)}.html">{a_e}</a>')
        else:
            parts.append(f"By {a_e}")
    else:
        parts.append("By <strong>Ibn Sina Hospital Medical Team</strong>")

    if reviewer_name:
        r_e = html_mod.escape(reviewer_name)
        if reviewer_slug:
            parts.append(f'Medically reviewed by <a href="../doctors/{html_mod.escape(reviewer_slug)}.html">{r_e}</a>')
        else:
            parts.append(f"Medically reviewed by {r_e}")

    if published:
        try:
            d = datetime.datetime.fromisoformat(published).strftime("%d %B %Y")
        except Exception:
            d = published
        parts.append(f'<time datetime="{html_mod.escape(published)}">Published {d}</time>')

    if updated and updated != published:
        try:
            d = datetime.datetime.fromisoformat(updated).strftime("%d %B %Y")
        except Exception:
            d = updated
        parts.append(f'<time datetime="{html_mod.escape(updated)}">Updated {d}</time>')

    return '<div class="blog-byline">' + ' <span aria-hidden="true">·</span> '.join(parts) + "</div>"


def fetch_csv(url):
    with urllib.request.urlopen(url) as response:
        content = response.read().decode("utf-8")
    return list(csv.DictReader(io.StringIO(content)))


# =====================================================================
# LASTMOD CACHE
# =====================================================================
def load_lastmod_cache():
    if LASTMOD_CACHE_FILE.exists():
        return json.loads(LASTMOD_CACHE_FILE.read_text(encoding="utf-8"))
    return {}


def save_lastmod_cache(cache):
    LASTMOD_CACHE_FILE.write_text(json.dumps(cache, indent=2), encoding="utf-8")


def get_lastmod(url, content, cache, today):
    content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
    entry = cache.get(url)
    if entry and entry.get("hash") == content_hash:
        return entry["lastmod"]
    cache[url] = {"hash": content_hash, "lastmod": today}
    return today


def save_json_data(doctors, departments, posts, gallery_items, updates):
    data_dir = Path("data")
    data_dir.mkdir(exist_ok=True)
    (data_dir / "doctors.json").write_text(json.dumps(doctors, ensure_ascii=False), encoding="utf-8")
    (data_dir / "departments.json").write_text(json.dumps(departments, ensure_ascii=False), encoding="utf-8")
    (data_dir / "blog.json").write_text(json.dumps(posts, ensure_ascii=False), encoding="utf-8")
    (data_dir / "gallery.json").write_text(json.dumps(gallery_items, ensure_ascii=False), encoding="utf-8")
    (data_dir / "updates.json").write_text(json.dumps(updates, ensure_ascii=False), encoding="utf-8")


# =====================================================================
# SHARED CSS WRITER
# =====================================================================
DOCTOR_PROFILE_CSS = """
.doctor-profile-page { --doc-green: #2d4a2b; --doc-gold: #c9b99a; --doc-bg: #f8faf6; }
.doctor-profile-page .breadcrumb-premium { font-size: .85rem; font-weight: 500; color: #71806d; padding: 1rem 0; }
.doctor-profile-page .breadcrumb-premium a { color: var(--doc-green); text-decoration: none; }
.doctor-profile-page .breadcrumb-premium a:hover { text-decoration: underline; }
.doctor-profile-page .breadcrumb-premium span { margin: 0 6px; color: #a4ac86; }
.doctor-profile-page .profile-hero { display: flex; flex-wrap: wrap; gap: 40px; background: linear-gradient(145deg, #f5f8f2, #eaf1e6); border-radius: 28px; padding: 40px 40px 30px; margin: 0 0 30px 0; border: 1px solid rgba(164,172,134,.2); box-shadow: 0 10px 40px rgba(45,74,43,.04); align-items: center; }
.doctor-profile-page .profile-hero .hero-image { flex: 0 0 180px; text-align: center; }
.doctor-profile-page .profile-hero .hero-image img { width: 180px; height: 180px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; box-shadow: 0 12px 30px rgba(45,74,43,.12); }
.doctor-profile-page .profile-hero .hero-image .no-img { width: 180px; height: 180px; border-radius: 50%; background: linear-gradient(135deg,#eaf1e6,#d4dfcd); display: flex; align-items: center; justify-content: center; font-size: 4rem; border: 4px solid #fff; box-shadow: 0 12px 30px rgba(45,74,43,.12); margin: 0 auto; }
.doctor-profile-page .profile-hero .hero-text { flex: 1; }
.doctor-profile-page .profile-hero .hero-text h1 { font-family: 'Poppins', sans-serif; font-size: clamp(1.8rem,3.5vw,2.8rem); color: var(--doc-green); margin-bottom: .2rem; letter-spacing: -.02em; }
.doctor-profile-page .profile-hero .hero-text .hero-specialty { font-size: 1.1rem; font-weight: 700; color: #82907d; letter-spacing: .05em; margin-bottom: .3rem; }
.doctor-profile-page .profile-hero .hero-text .hero-qual { font-size: .95rem; color: #5a6b4a; margin-bottom: .5rem; }
.doctor-profile-page .profile-hero .hero-text .hero-dept { font-size: .9rem; color: #4e5c4a; margin-bottom: 1rem; }
.doctor-profile-page .profile-hero .hero-text .hero-dept a { color: var(--doc-green); font-weight: 700; text-decoration: none; border-bottom: 2px solid var(--doc-gold); padding-bottom: 2px; }
.doctor-profile-page .profile-hero .hero-text .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: .5rem; }
.doctor-profile-page .profile-hero .hero-text .btn-appointment-hero { display: inline-block; padding: 12px 32px; border-radius: 60px; background: var(--doc-green); color: #fff; text-decoration: none; font-weight: 700; transition: all .3s ease; border: none; cursor: pointer; }
.doctor-profile-page .profile-hero .hero-text .btn-appointment-hero:hover { background: #1d321c; transform: scale(1.02); }
.doctor-profile-page .profile-hero .hero-text .btn-secondary-hero { display: inline-block; padding: 12px 32px; border-radius: 60px; background: transparent; color: var(--doc-green); border: 2px solid var(--doc-green); text-decoration: none; font-weight: 700; }
.doctor-profile-page .profile-hero .hero-text .btn-secondary-hero:hover { background: var(--doc-green); color: #fff; }
.doctor-profile-page .profile-layout { display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 40px; margin: 30px 0; align-items: start; }
.doctor-profile-page .profile-content { min-width: 0; }
.doctor-profile-page .profile-sidebar { position: sticky; top: 100px; }
.doctor-profile-page .bio-card { background: rgba(255,255,255,.7); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.8); border-radius: 20px; padding: 30px; box-shadow: 0 8px 30px rgba(45,74,43,.04); margin-bottom: 30px; }
.doctor-profile-page .bio-card h2 { font-family: 'Poppins', sans-serif; color: var(--doc-green); font-size: 1.4rem; margin-bottom: .5rem; }
.doctor-profile-page .bio-card h2::after { content: ''; display: block; width: 40px; height: 4px; background: var(--doc-gold); border-radius: 4px; margin-top: 6px; }
.doctor-profile-page .bio-card p { color: #4e5c4a; line-height: 1.8; font-size: 1.02rem; }
.doctor-profile-page .related-doctors-section { background: rgba(255,255,255,.5); backdrop-filter: blur(4px); border-radius: 16px; padding: 24px; border: 1px solid #edf3e9; }
.doctor-profile-page .related-doctors-section h3 { font-family: 'Poppins', sans-serif; color: var(--doc-green); font-size: 1.1rem; margin-bottom: 1rem; }
.doctor-profile-page .related-doctors-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.doctor-profile-page .related-doctor-card { background: #fff; border-radius: 12px; padding: 12px; border: 1px solid #edf3e9; transition: all .25s ease; }
.doctor-profile-page .related-doctor-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(45,74,43,.06); border-color: var(--doc-green); }
.doctor-profile-page .related-doctor-card a { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #2d4a2b; }
.doctor-profile-page .related-doctor-card .related-avatar { font-size: 2rem; flex-shrink: 0; }
.doctor-profile-page .related-doctor-card strong { display: block; font-size: .85rem; line-height: 1.2; }
.doctor-profile-page .related-doctor-card .related-specialty { display: block; font-size: .7rem; color: #82907d; font-weight: 600; text-transform: uppercase; letter-spacing: .03em; }
.doctor-profile-page .sidebar-card { background: rgba(255,255,255,.7); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.8); border-radius: 20px; padding: 24px; margin-bottom: 20px; box-shadow: 0 8px 30px rgba(45,74,43,.04); }
.doctor-profile-page .sidebar-card h3 { font-family: 'Poppins', sans-serif; color: var(--doc-green); font-size: 1.05rem; margin-bottom: .8rem; }
.doctor-profile-page .sidebar-card .cta-btn { display: block; width: 100%; padding: 14px; border-radius: 60px; background: var(--doc-green); color: #fff; text-align: center; text-decoration: none; font-weight: 700; }
.doctor-profile-page .sidebar-card .emergency-phone { display: block; text-align: center; font-size: 1.2rem; font-weight: 700; color: var(--doc-green); text-decoration: none; margin-top: .5rem; }
.doctor-profile-page .sidebar-card .quick-links { list-style: none; padding: 0; margin: 0; }
.doctor-profile-page .sidebar-card .quick-links li { padding: 8px 0; border-bottom: 1px solid #edf3e9; }
.doctor-profile-page .sidebar-card .quick-links a { color: #4e5c4a; text-decoration: none; }
@media (max-width: 900px) {
    .doctor-profile-page .profile-layout { grid-template-columns: 1fr; }
    .doctor-profile-page .profile-sidebar { position: static; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .doctor-profile-page .profile-hero { flex-direction: column; text-align: center; padding: 30px 20px; }
    .doctor-profile-page .related-doctors-grid { grid-template-columns: 1fr; }
}
@media (max-width: 650px) {
    .doctor-profile-page .profile-sidebar { grid-template-columns: 1fr; }
    .doctor-profile-page .profile-hero .hero-image img { width: 140px; height: 140px; }
    .doctor-profile-page .bio-card { padding: 20px; }
}
"""


BLOG_POST_CSS = """
.blog-post-page { background: #f8faf6; color: #26312a; }
.blog-post-page .blog-shell { max-width: 820px; margin: 0 auto; padding: 2rem 1.25rem 3rem; }
.blog-post-page .blog-breadcrumb { font-size: .85rem; color: #71806d; margin-bottom: 1.5rem; }
.blog-post-page .blog-breadcrumb a { color: #2d4a2b; text-decoration: none; }
.blog-post-page .blog-breadcrumb a:hover { text-decoration: underline; }
.blog-post-page article h1 { font-family: 'Poppins', sans-serif; font-size: clamp(1.8rem,4vw,2.4rem); line-height: 1.2; color: #2d4a2b; margin: 0 0 1rem; }
.blog-post-page .blog-byline { display: flex; flex-wrap: wrap; gap: .5rem; font-size: .88rem; color: #66755f; margin: 0 0 1.5rem; }
.blog-post-page .blog-byline a { color: #2d4a2b; font-weight: 600; text-decoration: none; }
.blog-post-page .blog-hero-image { margin: 0 0 2rem; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(45,74,43,.08); }
.blog-post-page .blog-hero-image img { width: 100%; height: auto; display: block; }
.blog-post-page .blog-toc { background: #fff; border: 1px solid #e2e8df; border-radius: 14px; padding: 20px 24px; margin: 1.5rem 0 2rem; }
.blog-post-page .blog-toc h2 { font-family: 'Poppins', sans-serif; font-size: 1rem; color: #2d4a2b; margin: 0 0 .75rem; text-transform: uppercase; letter-spacing: .05em; }
.blog-post-page .blog-toc ul { list-style: none; padding: 0; margin: 0; }
.blog-post-page .blog-toc li { padding: 6px 0; border-bottom: 1px solid #f0f4ec; }
.blog-post-page .blog-toc a { color: #2d4a2b; text-decoration: none; font-weight: 500; }
.blog-post-page .blog-body { font-size: 1.05rem; line-height: 1.8; color: #2c332c; }
.blog-post-page .blog-body p { margin: 0 0 1.35rem; }
.blog-post-page .blog-body .blog-lead-paragraph { font-size: 1.15rem; color: #2d4a2b; font-weight: 500; }
.blog-post-page .blog-body h2 { font-family: 'Poppins', sans-serif; font-size: clamp(1.35rem,2.6vw,1.75rem); color: #2d4a2b; margin: 2.5rem 0 1rem; line-height: 1.3; }
.blog-post-page .blog-body h3 { font-family: 'Poppins', sans-serif; font-size: 1.2rem; color: #33492f; margin: 1.8rem 0 .75rem; }
.blog-post-page .blog-body ul, .blog-post-page .blog-body ol { margin: 1rem 0 1.5rem 1.4rem; padding-left: 0; }
.blog-post-page .blog-body li { margin-bottom: .5rem; }
.blog-post-page .blog-body img { max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0; }
.blog-post-page .blog-body table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; background: #fff; border-radius: 12px; overflow: hidden; }
.blog-post-page .blog-body th, .blog-post-page .blog-body td { padding: 12px 14px; border: 1px solid #e2e8df; text-align: left; font-size: .95rem; }
.blog-post-page .blog-body th { background: #edf3e9; color: #2d4a2b; font-weight: 700; }
.blog-post-page .blog-body a { color: #2d6840; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
.blog-post-page .blog-body blockquote { margin: 1.75rem 0; padding: 18px 22px; border-left: 5px solid #81956d; background: #edf3e9; border-radius: 0 12px 12px 0; color: #3c5138; font-style: italic; }
.blog-post-page .blog-disclaimer { margin-top: 2.5rem; padding: 20px 24px; background: #f5f8f2; border-radius: 14px; border: 1px solid #e2e8df; font-size: .88rem; color: #66755f; line-height: 1.7; }
.blog-post-page .blog-disclaimer strong { color: #2d4a2b; }
.blog-post-page .blog-cta { margin-top: 2.5rem; padding: 32px 28px; background: linear-gradient(135deg,#2d4a2b,#486742); color: #fff; border-radius: 20px; text-align: center; }
.blog-post-page .blog-cta h2 { color: #fff; font-family: 'Poppins', sans-serif; font-size: 1.4rem; margin: 0 0 .75rem; }
.blog-post-page .blog-cta p { margin: 0 0 1.5rem; opacity: .9; }
.blog-post-page .blog-cta .btn-group { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.blog-post-page .blog-cta .btn-primary-light { display: inline-block; padding: 12px 28px; border-radius: 60px; background: #fff; color: #2d4a2b; text-decoration: none; font-weight: 700; }
.blog-post-page .blog-cta .btn-outline-light { display: inline-block; padding: 12px 28px; border-radius: 60px; background: transparent; color: #fff; border: 2px solid #fff; text-decoration: none; font-weight: 700; }
"""


def write_shared_css():
    css_dir = Path("css")
    css_dir.mkdir(exist_ok=True)
    (css_dir / "doctor-profile.css").write_text(DOCTOR_PROFILE_CSS, encoding="utf-8")
    (css_dir / "blog-post.css").write_text(BLOG_POST_CSS, encoding="utf-8")


# =====================================================================
# GENERATE BLOG PAGES
# =====================================================================
def generate_blog_pages(posts):
    output_dir = Path("blog")
    output_dir.mkdir(exist_ok=True)
    urls = []
    pages = []

    for post in posts:
        if (post.get("is_published", "") or "").strip().lower() not in ["true", "yes", "1"]:
            continue

        slug = slugify(post.get("slug") or post.get("title", ""))
        filename = f"blog-{slug}.html"
        page_url = f"{SITE_URL}/blog/{filename}"

        title = (post.get("title") or "Health Article").strip()
        title_e = html_mod.escape(title)

        summary = (
            post.get("short_summary")
            or post.get("short summary")
            or post.get("summary")
            or ""
        ).strip()

        if not summary:
            raw_body = post.get("body", "") or ""
            plain = re.sub(r"<[^>]+>", " ", raw_body)
            plain = re.sub(r"\s+", " ", plain).strip()
            first = re.split(r"(?<=[.!?])\s+", plain)[0] if plain else title
            summary = first.strip()

        summary_short = smart_truncate(summary, 158)
        summary_e = html_mod.escape(summary_short)

        image = (post.get("cover_image_url") or "").strip() or "https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp"
        image_e = html_mod.escape(image, quote=True)
        published = (post.get("published_at") or post.get("date") or "").strip()
        updated = (post.get("updated_at") or "").strip() or published

        raw_body = post.get("body", "") or ""
        body_html = format_blog_body(raw_body)
        body_html = fix_relative_links(body_html)
        body_html = inject_heading_ids(body_html)

        toc_html = build_toc(body_html)
        byline_html = build_byline_html(post)

        ga_id = (post.get("ga_measurement_id") or "").strip()
        ga_snippet = ""
        if ga_id:
            ga_id_e = html_mod.escape(ga_id, quote=True)
            ga_snippet = f"""
    <script async src="https://www.googletagmanager.com/gtag/js?id={ga_id_e}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', '{ga_id_e}');
    </script>"""

        author = None
        if (post.get("author_name") or "").strip():
            author_slug = (post.get("author_slug") or "").strip()
            author = {
                "@type": "Physician",
                "name": post["author_name"].strip(),
                "url": f"{SITE_URL}/doctors/{author_slug}.html" if author_slug else SITE_URL,
            }
        else:
            author = {"@type": "Organization", "name": "Ibn Sina Hospital", "url": SITE_URL}

        reviewer = None
        if (post.get("reviewer_name") or "").strip():
            reviewer_slug = (post.get("reviewer_slug") or "").strip()
            reviewer = {
                "@type": "Physician",
                "name": post["reviewer_name"].strip(),
                "url": f"{SITE_URL}/doctors/{reviewer_slug}.html" if reviewer_slug else SITE_URL,
            }

        json_ld = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "BlogPosting",
                    "@id": f"{page_url}#article",
                    "headline": title,
                    "description": summary_short,
                    "url": page_url,
                    "mainEntityOfPage": {"@id": f"{page_url}#webpage"},
                    "image": image,
                    "datePublished": published or None,
                    "dateModified": updated or None,
                    "inLanguage": "en-IN",
                    "author": author,
                    "reviewedBy": reviewer,
                    "publisher": {"@id": f"{SITE_URL}/#hospital"},
                },
                {
                    "@type": "WebPage",
                    "@id": f"{page_url}#webpage",
                    "url": page_url,
                    "name": title,
                    "isPartOf": {"@id": f"{SITE_URL}/#website"},
                    "inLanguage": "en-IN",
                },
                {
                    "@type": "BreadcrumbList",
                    "@id": f"{page_url}#breadcrumb",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_URL}/"},
                        {"@type": "ListItem", "position": 2, "name": "Health Blog", "item": f"{SITE_URL}/blog.html"},
                        {"@type": "ListItem", "position": 3, "name": title, "item": page_url},
                    ],
                },
                {
                    "@type": "Hospital",
                    "@id": f"{SITE_URL}/#hospital",
                    "name": "Ibn Sina Hospital",
                    "url": f"{SITE_URL}/",
                    "logo": "https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp",
                    "telephone": "+919622552553",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Near Railway Station, Ompora Railway Station Road, Ompora",
                        "addressLocality": "Budgam",
                        "addressRegion": "Jammu and Kashmir",
                        "postalCode": "191111",
                        "addressCountry": "IN",
                    },
                },
                {
                    "@type": "WebSite",
                    "@id": f"{SITE_URL}/#website",
                    "url": f"{SITE_URL}/",
                    "name": "Ibn Sina Hospital",
                    "publisher": {"@id": f"{SITE_URL}/#hospital"},
                },
            ],
        }

        for node in json_ld["@graph"]:
            for k in list(node.keys()):
                if node[k] is None:
                    del node[k]

        schema_json = json.dumps(json_ld, ensure_ascii=False)

        html = f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title_e} | Ibn Sina Hospital, Budgam</title>
    <meta name="description" content="{summary_e}">
    <link rel="canonical" href="{page_url}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="{title_e}">
    <meta property="og:description" content="{summary_e}">
    <meta property="og:url" content="{page_url}">
    <meta property="og:image" content="{image_e}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Ibn Sina Hospital">
    <meta property="og:locale" content="en_IN">
    <meta property="article:published_time" content="{html_mod.escape(published)}">
    <meta property="article:modified_time" content="{html_mod.escape(updated)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title_e}">
    <meta name="twitter:description" content="{summary_e}">
    <meta name="twitter:image" content="{image_e}">
    <link rel="icon" type="image/webp" href="https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/blog-post.css">
    <script type="application/ld+json">{schema_json}</script>{ga_snippet}
</head>
<body class="blog-post-page">
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
                <li><a href="../blog.html" class="nav-link active">Blog</a></li>
                <li><a href="../contact.html" class="nav-link">Contact</a></li>
            </ul>
        </nav>
        <div class="header-actions">
            <a href="tel:9622552553" class="emergency-badge"><span>Emergency: 9622552553</span></a>
            <a href="../appointment.html" class="btn btn-primary btn-book">Book Appointment</a>
            <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false"><span class="hamburger-line"></span><span class="hamburger-line"></span><span class="hamburger-line"></span></button>
        </div>
    </div>
</header>
<main class="blog-shell">
    <nav class="blog-breadcrumb" aria-label="Breadcrumb">
        <a href="../index.html">Home</a> ›
        <a href="../blog.html">Health Blog</a> ›
        <span>{title_e}</span>
    </nav>
    <article>
        <h1>{title_e}</h1>
        {byline_html}
        <figure class="blog-hero-image">
            <img src="{image_e}" alt="{title_e}" width="1200" height="630" loading="eager" decoding="async">
        </figure>
        {toc_html}
        <div class="blog-body">
            {body_html}
        </div>
        <aside class="blog-disclaimer">
            <strong>Medical Disclaimer:</strong> The information in this article is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional regarding your specific health concerns.
        </aside>
        <section class="blog-cta">
            <h2>Need medical advice?</h2>
            <p>Our consultant-led team at Ibn Sina Hospital, Budgam is available 24/7 for OPD, emergency, and diagnostic services.</p>
            <div class="btn-group">
                <a href="../appointment.html" class="btn-primary-light">Book an Appointment</a>
                <a href="tel:9622552553" class="btn-outline-light">Call 9622552553</a>
            </div>
        </section>
    </article>
</main>
<footer class="site-footer">
    <div class="footer-main container">
        <p>&copy; 2026 Ibn Sina Hospital, Budgam. All rights reserved.</p>
    </div>
</footer>
<script src="../js/main.js" defer></script>
</body>
</html>"""

        (output_dir / filename).write_text(html, encoding="utf-8")
        urls.append(page_url)
        pages.append((page_url, html))
        print(f"Generated blog post: {filename}")

    return urls, pages


# =====================================================================
# GENERATE DOCTOR PAGES
# =====================================================================
def generate_doctor_pages(doctors, departments_by_name):
    output_dir = Path("doctors")
    output_dir.mkdir(exist_ok=True)
    urls = []
    pages = []

    for doc in doctors:
        full_name = clean_name(doc.get("name", ""))
        slug = slugify(doc.get("name", ""))
        filename = f"doctor-{slug}.html"
        page_url = f"{SITE_URL}/doctors/{filename}"

        dept_name = (doc.get("department") or "").strip()
        dept_display = display_dept_name(dept_name)
        dept_slug = resolve_dept_slug(dept_name)
        specialty = (doc.get("specialty") or "Doctor").strip()
        profession = profession_for(specialty)
        schema_specialty = schema_specialty_for(specialty)
        qualifications = (doc.get("qualifications") or "").strip()
        photo_url = (doc.get("photo_url") or "").strip() or "https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp"

        about_text = build_about(doc, full_name)
        about_short = smart_truncate(about_text, 300)

        full_name_e = html_mod.escape(full_name)
        specialty_display_e = html_mod.escape(specialty.title())
        qualifications_e = html_mod.escape(qualifications)
        dept_display_e = html_mod.escape(dept_display)
        about_text_e = html_mod.escape(about_text)
        about_short_e = html_mod.escape(about_short)
        photo_url_e = html_mod.escape(photo_url, quote=True)

        description = (
            f"{full_name} is a {profession} at Ibn Sina Hospital, Budgam, "
            f"in the {dept_display} department. View qualifications, OPD schedule, "
            f"and book an appointment."
        )
        description_e = html_mod.escape(smart_truncate(description, 158))

        title = f"{full_name} | {specialty_display_e} | Ibn Sina Hospital, Budgam"

        has_photo = bool(photo_url) and photo_url != "https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp"
        if has_photo:
            photo_block = (
                f'<img src="{photo_url_e}" alt="{full_name_e} - {specialty_display_e} at Ibn Sina Hospital" '
                f'width="180" height="180" loading="eager">'
            )
        else:
            photo_block = '<div class="no-img">👨‍⚕️</div>'

        dept_page_file = Path("department-pages") / f"{dept_slug}.html"
        if dept_name and dept_page_file.exists():
            dept_link_html = (
                f'<div class="hero-dept">Department: '
                f'<a href="../department-pages/{dept_slug}.html">{dept_display_e}</a></div>'
            )
        elif dept_name:
            dept_link_html = f'<div class="hero-dept">Department: {dept_display_e}</div>'
        else:
            dept_link_html = ""

        same_dept = [
            d for d in doctors
            if (d.get("department") or "").strip().lower() == dept_name.lower()
            and (d.get("name") or "") != doc.get("name", "")
        ][:4]

        related_html = ""
        if same_dept:
            items = ""
            for d in same_dept:
                dname = clean_name(d.get("name", ""))
                dspec = (d.get("specialty") or "").title()
                dslug = slugify(d.get("name", ""))
                items += (
                    f'<div class="related-doctor-card">'
                    f'<a href="doctor-{dslug}.html">'
                    f'<div class="related-avatar">👨‍⚕️</div>'
                    f'<div><strong>{html_mod.escape(dname)}</strong>'
                    f'<span class="related-specialty">{html_mod.escape(dspec)}</span></div>'
                    f"</a></div>"
                )
            related_html = (
                f'<div class="related-doctors-section">'
                f"<h3>Other {dept_display_e} Specialists</h3>"
                f'<div class="related-doctors-grid">{items}</div></div>'
            )

        credentials = []
        ql = qualifications.lower()
        for cred_keyword, cred_name in [
            ("mbbs", "MBBS"), ("md", "MD"), ("ms", "MS"), ("dnb", "DNB"),
            ("dm", "DM"), ("mch", "MCh"), ("bds", "BDS"), ("bpt", "BPT"),
            ("mpt", "MPT"), ("dgo", "DGO"),
        ]:
            if cred_keyword in ql:
                credentials.append({
                    "@type": "EducationalOccupationalCredential",
                    "credentialCategory": "degree",
                    "name": cred_name,
                })

        json_ld_physician = {
            "@type": "Physician",
            "@id": f"{page_url}#physician",
            "name": full_name,
            "url": page_url,
            "image": photo_url,
            "description": about_short,
            "medicalSpecialty": schema_specialty,
            "worksFor": {"@id": f"{SITE_URL}/#hospital"},
        }
        if credentials:
            json_ld_physician["hasCredential"] = credentials
        if qualifications:
            json_ld_physician["knowsAbout"] = qualifications

        json_ld = {
            "@context": "https://schema.org",
            "@graph": [
                json_ld_physician,
                {
                    "@type": "BreadcrumbList",
                    "@id": f"{page_url}#breadcrumb",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_URL}/"},
                        {"@type": "ListItem", "position": 2, "name": "Doctors", "item": f"{SITE_URL}/doctors.html"},
                        {"@type": "ListItem", "position": 3, "name": full_name, "item": page_url},
                    ],
                },
                {
                    "@type": "Hospital",
                    "@id": f"{SITE_URL}/#hospital",
                    "name": "Ibn Sina Hospital",
                    "url": f"{SITE_URL}/",
                    "logo": "https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp",
                    "telephone": "+919622552553",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Near Railway Station, Ompora Railway Station Road, Ompora",
                        "addressLocality": "Budgam",
                        "addressRegion": "Jammu and Kashmir",
                        "postalCode": "191111",
                        "addressCountry": "IN",
                    },
                },
            ],
        }

        schema_json = json.dumps(json_ld, ensure_ascii=False)
        appointment_link = f"../appointment.html?doctor={quote(full_name)}"

        html = f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html_mod.escape(title)}</title>
    <meta name="description" content="{description_e}">
    <meta name="robots" content="index,follow">
    <link rel="canonical" href="{page_url}">
    <meta property="og:type" content="profile">
    <meta property="og:title" content="{full_name_e} — {specialty_display_e} | Ibn Sina Hospital">
    <meta property="og:description" content="{description_e}">
    <meta property="og:url" content="{page_url}">
    <meta property="og:image" content="{photo_url_e}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{full_name_e} — {specialty_display_e}">
    <meta name="twitter:description" content="{description_e}">
    <meta name="twitter:image" content="{photo_url_e}">
    <link rel="icon" type="image/webp" href="https://i.ibb.co/NgNyCQgf/8e1694fa3791.webp">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/mobile-fix.css">
    <link rel="stylesheet" href="../css/doctor-profile.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">{schema_json}</script>
</head>
<body class="doctor-profile-page">
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
                    <li><a href="../doctors.html" class="nav-link active">Doctors</a></li>
                    <li><a href="../blog.html" class="nav-link">Blog</a></li>
                    <li><a href="../contact.html" class="nav-link">Contact</a></li>
                </ul>
            </nav>
            <div class="header-actions">
                <a href="tel:9622552553" class="emergency-badge"><span>Emergency: 9622552553</span></a>
                <a href="../appointment.html" class="btn btn-primary btn-book">Book Appointment</a>
                <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false"><span class="hamburger-line"></span><span class="hamburger-line"></span><span class="hamburger-line"></span></button>
            </div>
        </div>
    </header>
    <main id="main-content" class="container" style="padding: 0 20px;">
        <nav class="breadcrumb-premium" aria-label="Breadcrumb">
            <a href="../index.html">Home</a> <span>›</span>
            <a href="../doctors.html">Doctors</a> <span>›</span>
            <span>{full_name_e}</span>
        </nav>
        <section class="profile-hero">
            <div class="hero-image">{photo_block}</div>
            <div class="hero-text">
                <h1>{full_name_e}</h1>
                <div class="hero-specialty">{specialty_display_e}</div>
                <div class="hero-qual">{qualifications_e}</div>
                {dept_link_html}
                <div class="hero-actions">
                    <a href="{appointment_link}" class="btn-appointment-hero">📅 Book Appointment</a>
                    <a href="tel:9622552553" class="btn-secondary-hero">📞 Call Hospital</a>
                </div>
            </div>
        </section>
        <div class="profile-layout">
            <div class="profile-content">
                <div class="bio-card">
                    <h2>About {full_name_e}</h2>
                    <p>{about_text_e}</p>
                </div>
                {related_html}
            </div>
            <aside class="profile-sidebar">
                <div class="sidebar-card" style="background: linear-gradient(145deg, #2d4a2b, #1d321c); color: #fff; border: none;">
                    <h3 style="color:#fff;">📋 Book an Appointment</h3>
                    <p style="color: rgba(255,255,255,.8); font-size: .9rem; margin-bottom: 1rem;">Consult with {full_name_e} at Ibn Sina Hospital, Budgam.</p>
                    <a href="{appointment_link}" class="cta-btn" style="background:#fff; color:#2d4a2b;">Book Now</a>
                </div>
                <div class="sidebar-card">
                    <h3>🚑 Emergency</h3>
                    <p style="color: #4e5c4a; font-size: .9rem; margin-bottom: .5rem;">For urgent help, call:</p>
                    <a href="tel:9622552553" class="emergency-phone">📞 9622552553</a>
                    <p style="font-size: .75rem; color:#82907d; margin-top:.5rem; text-align:center;">Available 24/7</p>
                </div>
                <div class="sidebar-card">
                    <h3>Quick Links</h3>
                    <ul class="quick-links">
                        <li><a href="../doctors.html">All Doctors</a></li>
                        <li><a href="../department-pages/specialties-directory.html">All Specialties</a></li>
                        <li><a href="../services.html">Our Services</a></li>
                        <li><a href="../appointment.html">Book Appointment</a></li>
                        <li><a href="../contact.html">Contact Us</a></li>
                    </ul>
                </div>
            </aside>
        </div>
    </main>
    <footer class="site-footer">
        <div class="footer-main container">
            <p>&copy; 2026 Ibn Sina Hospital, Budgam. All rights reserved.</p>
        </div>
    </footer>
    <script src="../js/main.js" defer></script>
</body>
</html>"""

        (output_dir / filename).write_text(html, encoding="utf-8")
        urls.append(page_url)
        pages.append((page_url, html))
        print(f"Generated doctor profile: {filename}")

    return urls, pages


# =====================================================================
# GENERATE DEPARTMENT PAGES (RESTORED)
# =====================================================================
def generate_department_pages(departments, doctors):
    output_dir = Path("departments")
    manual_dir = Path("department-pages")
    urls = []
    pages = []

    for dept in departments:
        dept_name = (dept.get("name") or "").strip()
        slug = resolve_dept_slug(dept.get("slug") or dept_name)
        dept_display = display_dept_name(dept_name)

        # Skip if a hand-built page exists
        if (manual_dir / f"{slug}.html").exists():
            continue

        output_dir.mkdir(exist_ok=True)
        filename = f"department-{slug}.html"
        page_url = f"{SITE_URL}/departments/{filename}"
        title = f"{dept_display} Department | Ibn Sina Hospital, Budgam"
        description = f"{dept_display} department at Ibn Sina Hospital, Budgam — serving patients across Jammu and Kashmir with expert specialists."

        dept_doctors = [d for d in doctors if (d.get("department") or "").strip().lower() == dept_name.lower()]
        doctor_list_html = ""
        if dept_doctors:
            items = "".join(
                f'<li><a href="../doctors/doctor-{slugify(d.get("name",""))}.html">{html_mod.escape(clean_name(d.get("name","")))}</a></li>'
                for d in dept_doctors
            )
            doctor_list_html = f'<div class="dept-doctors"><h2>Our {html_mod.escape(dept_display)} Specialists</h2><ul>{items}</ul></div>'

        json_ld = {
            "@context": "https://schema.org",
            "@type": "MedicalClinic",
            "name": f"{dept_display} Department, Ibn Sina Hospital",
            "medicalSpecialty": schema_specialty_for(slug),
            "url": page_url,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Budgam",
                "addressRegion": "Jammu and Kashmir",
                "addressCountry": "IN",
            },
        }

        html = f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html_mod.escape(title)}</title>
    <meta name="description" content="{html_mod.escape(description)}">
    <link rel="canonical" href="{page_url}">
    <meta property="og:title" content="{html_mod.escape(title)}">
    <meta property="og:description" content="{html_mod.escape(description)}">
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
                <li><a href="../doctors.html">Doctors</a></li>
                <li><a href="../contact.html">Contact</a></li>
            </ul></nav>
        </div>
    </header>
    <main class="section">
        <div class="container">
            <h1>{html_mod.escape(dept_display)} Department</h1>
            <p>The {html_mod.escape(dept_display)} department at Ibn Sina Hospital, Budgam provides expert care to patients across Jammu and Kashmir.</p>
            {doctor_list_html}
            <a href="../doctors.html" class="btn btn-primary">View All Doctors</a>
        </div>
    </main>
    <footer class="site-footer">
        <div class="footer-main container">
            <p>&copy; 2026 Ibn Sina Hospital, Budgam. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>"""
        (output_dir / filename).write_text(html, encoding="utf-8")
        urls.append(page_url)
        pages.append((page_url, html))

    return urls, pages


# =====================================================================
# GALLERY (RESTORED)
# =====================================================================
def build_photo_items(items):
    html_items = []
    for item in items:
        img_url = (item.get("image_url") or "").strip()
        if not img_url:
            continue
        title = (item.get("title") or "").strip()
        alt_text = (item.get("alt_text") or "").strip() or title or "Ibn Sina Hospital, Budgam"
        html_items.append(
            f'<div class="photo-item">\n'
            f'    <img src="{html_mod.escape(img_url, quote=True)}" alt="{html_mod.escape(alt_text, quote=True)}" loading="lazy" width="400" height="300">\n'
            f'    <div class="photo-caption">{html_mod.escape(title)}</div>\n'
            f"</div>"
        )
    return "\n".join(html_items)


def generate_gallery_page(gallery_items):
    def sort_key(item):
        try:
            return int(item.get("display_order") or 0)
        except ValueError:
            return 0

    sorted_items = sorted(gallery_items, key=sort_key)
    photo_html = build_photo_items(sorted_items)

    if not GALLERY_TEMPLATE_PATH.exists():
        print(f"⚠️  Gallery template not found at {GALLERY_TEMPLATE_PATH}. Skipping gallery generation.")
        return None, None

    template = GALLERY_TEMPLATE_PATH.read_text(encoding="utf-8")
    output_html = template.replace("<!--PHOTO_ITEMS-->", photo_html)
    Path("gallery.html").write_text(output_html, encoding="utf-8")
    return f"{SITE_URL}/gallery.html", output_html


# =====================================================================
# COLLECT MANUAL PAGES (department-pages + service-areas)
# =====================================================================
def collect_manual_pages():
    pages = []
    for folder in ["department-pages", "service-areas"]:
        dir_path = Path(folder)
        if not dir_path.exists():
            continue
        for html_file in dir_path.glob("*.html"):
            content = html_file.read_text(encoding="utf-8")
            url = f"{SITE_URL}/{folder}/{html_file.name}"
            pages.append((url, content))
    return pages


# =====================================================================
# SITEMAP
# =====================================================================
def update_sitemap(all_pages_with_content):
    cache = load_lastmod_cache()
    today = datetime.date.today().isoformat()

    static_urls = [
        f"{SITE_URL}/", f"{SITE_URL}/about.html", f"{SITE_URL}/services.html",
        f"{SITE_URL}/doctors.html", f"{SITE_URL}/gallery.html", f"{SITE_URL}/blog.html",
        f"{SITE_URL}/careers.html", f"{SITE_URL}/faq.html", f"{SITE_URL}/contact.html",
        f"{SITE_URL}/appointment.html", f"{SITE_URL}/health-checkup-packages.html",
        f"{SITE_URL}/insurance-pmjay.html", f"{SITE_URL}/service-areas.html",
    ]

    xml_parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for url in static_urls:
        priority = "1.0" if url == f"{SITE_URL}/" else "0.7"
        xml_parts.append(
            f"  <url>\n    <loc>{url}</loc>\n    <lastmod>{today}</lastmod>"
            f"\n    <changefreq>weekly</changefreq>\n    <priority>{priority}</priority>\n  </url>"
        )

    for url, content in all_pages_with_content:
        lastmod = get_lastmod(url, content, cache, today)
        xml_parts.append(
            f"  <url>\n    <loc>{url}</loc>\n    <lastmod>{lastmod}</lastmod>"
            f"\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>"
        )

    xml_parts.append("</urlset>")
    Path("sitemap.xml").write_text("\n".join(xml_parts), encoding="utf-8")
    save_lastmod_cache(cache)


# =====================================================================
# INDEXNOW
# =====================================================================
def submit_to_indexnow(url_list):
    if not url_list:
        return
    data = {
        "host": HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": f"https://{HOST}/{INDEXNOW_KEY}.txt",
        "urlList": url_list,
    }
    req = urllib.request.Request(
        INDEXNOW_ENDPOINT,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as response:
            print(f"IndexNow submitted {len(url_list)} URLs. Status: {response.status}")
    except Exception as e:
        print(f"IndexNow submission failed: {e}")


# =====================================================================
# MAIN
# =====================================================================
if __name__ == "__main__":
    print("Writing shared CSS files...")
    write_shared_css()

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

    departments_by_name = {(d.get("name") or "").strip().lower(): d for d in departments}

    doctor_urls, doctor_pages = generate_doctor_pages(doctors, departments_by_name)
    blog_urls, blog_pages = generate_blog_pages(posts)
    dept_urls, dept_pages = generate_department_pages(departments, doctors)

    gallery_result = generate_gallery_page(gallery_items)
    if gallery_result and gallery_result[0]:
        gallery_url, gallery_html = gallery_result
    else:
        gallery_url, gallery_html = None, None

    manual_pages = collect_manual_pages()
    print(f"Found {len(manual_pages)} manual pages.")

    all_dynamic_urls = doctor_urls + blog_urls + dept_urls + [url for url, _ in manual_pages]
    all_pages_with_content = doctor_pages + blog_pages + dept_pages + manual_pages

    if gallery_url:
        all_dynamic_urls.append(gallery_url)
        all_pages_with_content.append((gallery_url, gallery_html))

    update_sitemap(all_pages_with_content)
    submit_to_indexnow(all_dynamic_urls)

    print("\n✅ Build complete.")

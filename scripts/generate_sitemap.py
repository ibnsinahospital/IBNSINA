#!/usr/bin/env python3
"""
Regenerates sitemap.xml for Ibn Sina Hospital's website.
- Includes all static pages (always the same).
- Fetches the published Blog Posts Google Sheet (CSV) and adds one
  <url> entry per row where is_published is TRUE, using the post's slug.

Run manually with:  python3 scripts/generate_sitemap.py
Runs automatically via .github/workflows/update-sitemap.yml
"""

import csv
import io
import urllib.request

DOMAIN = "https://ibnsinahospital.in"

# ---- Static pages (edit this list if you add/remove real .html pages) ----
STATIC_PAGES = [
    "/",
    "/about.html",
    "/services.html",
    "/doctors.html",
    "/gallery.html",
    "/blog.html",
    "/careers.html",
    "/faq.html",
    "/contact.html",
    "/appointment.html",
]

# ---- Your published Blog Posts sheet, as CSV ----
BLOG_CSV_URL = (
    "https://docs.google.com/spreadsheets/d/e/"
    "2PACX-1vRyksX4tU5UEPKPVbRGUiCe7lXxS-Z0WqSgB1vghBBqEvddzZ9M5ZSMtvfoCFPXRZoLojgWjIEmbQH8"
    "/pub?output=csv"
)


def normalize_key(key: str) -> str:
    return "".join(c if c.isalnum() else "_" for c in key.strip()).strip("_").lower()


def fetch_blog_slugs():
    """Returns a list of slugs for every row where is_published is TRUE."""
    try:
        with urllib.request.urlopen(BLOG_CSV_URL, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
    except Exception as e:
        print(f"Warning: could not fetch blog CSV ({e}). Skipping blog posts this run.")
        return []

    reader = csv.reader(io.StringIO(raw))
    rows = list(reader)
    if len(rows) < 2:
        return []

    headers = [normalize_key(h) for h in rows[0]]
    slugs = []
    for row in rows[1:]:
        if not any(cell.strip() for cell in row):
            continue
        record = dict(zip(headers, row))
        is_published = record.get("is_published", "").strip().upper()
        slug = record.get("slug", "").strip()
        if is_published == "TRUE" and slug:
            slugs.append(slug)
    return slugs


def build_sitemap(static_pages, blog_slugs):
    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for path in static_pages:
        lines.append(f"    <url><loc>{DOMAIN}{path}</loc></url>")
    for slug in blog_slugs:
        lines.append(f"    <url><loc>{DOMAIN}/blog-post.html?slug={slug}</loc></url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main():
    slugs = fetch_blog_slugs()
    xml = build_sitemap(STATIC_PAGES, slugs)
    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"sitemap.xml written with {len(STATIC_PAGES)} static pages and {len(slugs)} blog posts.")


if __name__ == "__main__":
    main()

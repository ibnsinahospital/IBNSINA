# SEO audit

This file documents the current SEO implementation and the next automation checks.

## Current infrastructure

- `robots.txt` allows crawling and references `/sitemap.xml`.
- `sitemap.xml` contains homepage, core pages, doctor pages, blog pages, and department pages.
- Dynamic content is generated from Google Sheets via `generate_dynamic.py` and GitHub Actions.

## Priority checks

1. Ensure every generated doctor and department page has a unique title, meta description, canonical URL, H1, and appropriate structured data.
2. Ensure sitemap entries are generated only for intended indexable pages and use real content modification dates.
3. Validate generated internal links and canonical URLs.
4. Keep legacy misspelled department URLs stable until redirects to corrected URLs are implemented.
5. Validate structured data against visible page content before expanding schema coverage.

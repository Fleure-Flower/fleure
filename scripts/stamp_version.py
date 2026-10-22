"""Add a version number to the CSS and JS links in every page.

Browsers keep old copies of scripts for a while. Run this before each push so
visitors always get the newest code:  python3 scripts/stamp_version.py
"""
import pathlib
import re
import time

version = time.strftime("%Y%m%d%H%M")
root = pathlib.Path(__file__).resolve().parent.parent
for page in root.glob("*.html"):
    text = page.read_text()
    new = re.sub(r'(assets/(?:css|js)/[\w-]+\.(?:css|js))(\?v=\w+)?', rf"\1?v={version}", text)
    if new != text:
        page.write_text(new)
        print(f"stamped {page.name} with v={version}")

"""
Automated Frontend DOM Hook Validator
File: validate_frontend.py
Purpose: Parses app.js to extract all document.getElementById() calls, parses index.html
to extract all DOM id attributes, and verifies that 100% of JS DOM IDs exist in HTML.
"""

import re
import sys

def validate_dom():
    html_file = "index.html"
    js_file = "app.js"

    with open(html_file, "r", encoding="utf-8") as f:
        html_content = f.read()

    with open(js_file, "r", encoding="utf-8") as f:
        js_content = f.read()

    # Extract all ids from index.html
    html_ids = set(re.findall(r'id=["\']([^"\']+)["\']', html_content))

    # Extract all getElementById from app.js
    js_ids = set(re.findall(r'getElementById\(["\']([^"\']+)["\']\)', js_content))

    print(f"[FRONTEND VALIDATOR] Found {len(html_ids)} unique IDs in {html_file}")
    print(f"[FRONTEND VALIDATOR] Found {len(js_ids)} getElementById hooks in {js_file}")

    missing_in_html = js_ids - html_ids
    unused_in_js = html_ids - js_ids

    print("\n--- AUDIT RESULTS ---")
    if missing_in_html:
        print(f"❌ ERROR: {len(missing_in_html)} JS DOM IDs missing in HTML:")
        for m in sorted(missing_in_html):
            print(f"   - {m}")
        sys.exit(1)
    else:
        print(f"✅ SUCCESS: 100% of JavaScript DOM IDs ({len(js_ids)} hooks) exist in HTML with zero missing hooks!")
        print(f"ℹ️ Info: {len(unused_in_js)} HTML IDs are static markup/styling anchors.")
        sys.exit(0)

if __name__ == "__main__":
    validate_dom()

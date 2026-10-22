# Fleure – Handmade Flowers

Static website for a handmade pipe-cleaner and satin ribbon flower bouquet shop, built from the Canva design "Handmade flower shop website". Orders are sent through WhatsApp.

Live site: https://sahil-sinha-11.github.io/flower-website/

## Editing

- **Prices, products, WhatsApp number, Instagram, email:** `assets/js/data.js`
- **Colours, fonts, spacing:** design tokens at the top of `assets/css/styles.css`
- **Product images:** `assets/products/`

No build step: push to `main` and GitHub Pages publishes it.

Before pushing, run `python3 scripts/stamp_version.py` so browsers load the newest CSS and JS.

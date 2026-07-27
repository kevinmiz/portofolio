# Kevin Muhamad Iqbal Zarkasyi — Personal Branding Site

Static site (HTML/CSS/vanilla JS only). No build step, no frameworks.

## Running locally

`fetch()` is used to load JSON content, which browsers block under the
`file://` protocol. Serve the folder instead:

```bash
# Python (Mac/Linux)
python3 -m http.server 8000

# Python (Windows)
python -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000`.

## Folder structure

```
index.html        Page skeleton (all sections)
css/
  variables.css   Design tokens (colors, type, spacing) — edit here first
  reset.css       Browser normalization
  main.css        Actual component styling
js/
  i18n.js         Loads i18n/en.json + id.json, switches language instantly
  data-loader.js  Loads data/*.json, renders content into the page
  main.js         Boot sequence
data/             Bilingual content — edit these to update the site
i18n/             UI label translations (nav, buttons, etc.)
images/ icons/ docs/   Static assets (photos, favicons, resume PDF)
```

## Updating content

- Text that appears once per page (hero bio, about text, experience
  entries, etc.) lives in `data/*.json`. Edit the JSON, refresh the page.
- Reusable UI labels (nav items, button text) live in `i18n/en.json` and
  `i18n/id.json` — always update both languages together.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository (root of the repo, or a
   `docs/` folder if you prefer — either works with GitHub Pages).
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment", choose **Deploy from a branch**.
4. Pick your branch (e.g. `main`) and the folder (`/ (root)` or `/docs`).
5. Save. GitHub gives you a URL like `https://<username>.github.io/<repo>/`
   within a minute or two.

No build step is needed — this repo IS the deployed site.

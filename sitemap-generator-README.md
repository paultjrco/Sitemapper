# Sitemap Generator

A self-contained HTML tool for creating and exporting IA sitemaps.

## How to use

### Option A — Run locally
Just open `index.html` in any browser. No server needed.

### Option B — GitHub Pages
1. Push this repo to GitHub
2. Go to Settings → Pages
3. Set source to `main` branch, `/ (root)` folder
4. Your tool will be live at `https://yourusername.github.io/your-repo-name/`

## CSV format

The tool expects CSV with four columns:

```
Page,Parent,Section,Bullets
```

- **Page** — the page name
- **Parent** — the parent page name, or `—` for the root/homepage
- **Section** — `main`, `header`, or `footer`
- **Bullets** — content bullets separated by `;`

### Example

```csv
Page,Parent,Section,Bullets
Homepage,—,main,Hero with audience cards;Featured content;Quick links
Job Seekers,Homepage,main,Career Services;Workshops;Job Board
About,Homepage,main,About Us;Our Team;Contact
Career Services,Job Seekers,main,One-on-one counseling;Orientation required
Job Board,,header,External link to job board
Newsletter,,footer,Newsletter signup link
```

## Features

- **Auto-layout** — tree structure built automatically from Parent column
- **Orientation toggles** — click ↕↔ on any box to switch its children between vertical and horizontal layout
- **Drag to reposition** — grab any box to fine-tune its position; connector lines update in real time
- **Header / Footer nav zones** — separate areas for utility nav and footer links, unconnected to main tree
- **Export SVG** — scalable vector export, opens in browser or Figma/Illustrator
- **Export PNG (2×)** — high-resolution raster export for slides and docs

## Color coding

- **Purple** — Root / Homepage
- **Teal** — Level 1 pages
- **Gray** — Level 2 pages
- **Coral** — Level 3 pages
- **Green** — Level 4 pages
- **Light gray** — Header / Footer nav items

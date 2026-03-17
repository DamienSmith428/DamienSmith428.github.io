# NexAuth — Landing Page

Static GitHub Pages site for NexAuth — licensing & authentication infrastructure for indie developers.

## Pages

- `index.html` — Landing page with features, pricing, CTA
- `docs.html` — Documentation
- `dashboard.html` — Interactive dashboard preview (Visitor / Customer / Support / Admin views)

## Structure

```
nexauth/
├── index.html          ← Landing page
├── docs.html           ← Documentation
├── dashboard.html      ← Dashboard preview with role switcher
├── _config.yml         ← GitHub Pages config
├── css/
│   ├── style.css       ← Global design system
│   └── dashboard.css   ← Dashboard & ticket styles
└── js/
    ├── main.js         ← Particles, cursor, animations
    └── dashboard.js    ← Role switching, ticket system
```

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to Settings → Pages
3. Set source to `main` branch, root folder
4. Your site will be live at `https://yourusername.github.io/nexauth`

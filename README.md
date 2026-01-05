# Urban Legends - Website

Website pentru serverul de roleplay FiveM **Urban Legends**.

## 🚀 Quick Start

### Instalare

```bash
# Instalează dependințele
pnpm install

# Pornește serverul de development
pnpm dev
```

Site-ul se va deschide automat la `http://localhost:3000`

### Comenzi disponibile

| Comandă | Descriere |
|---------|-----------|
| `pnpm install` | Instalează dependințele |
| `pnpm dev` | Pornește live server cu auto-reload |
| `pnpm start` | Pornește serverul fără auto-open |

## 📁 Structura proiectului

```
ulrp-website/
├── src/
│   ├── css/
│   │   └── style.css       # Stylesheet principal
│   ├── js/
│   │   └── main.js         # JavaScript principal
│   ├── assets/             # Imagini, fonturi, etc.
│   └── index.html          # Pagina principală
├── package.json
└── README.md
```

## 🎨 Customizare

### Culori
Editează variabilele CSS în `src/css/style.css`:

```css
:root {
    --primary: #38bdf8;        /* Albastru principal */
    --primary-light: #7dd3fc;  /* Albastru deschis */
    --primary-dark: #0ea5e9;   /* Albastru închis */
    --bg-primary: #030712;     /* Fundal principal */
    --bg-secondary: #0a0f1a;   /* Fundal secundar */
    /* ... */
}
```

### Informații Server
Actualizează informațiile în `src/index.html`:
- IP Server
- Discord link
- Statistici
- Update-uri

## 🔧 Development

### Live Server
Proiectul folosește `live-server` pentru hot-reload în timpul development-ului.

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Pagini

- `index.html` - Pagina principală (Home)
- `terms.html` - Termeni și Condiții (de creat)
- `privacy.html` - Politica de Confidențialitate (de creat)
- `rules.html` - Regulament (de creat)

## 🌐 Deploy

Pentru producție, poți folosi:
- **Vercel**: `vercel --prod`
- **Netlify**: drag & drop folder `src`
- **GitHub Pages**: push la branch `gh-pages`
- **Hostinger/cPanel**: upload conținutul din `src`

## 📄 License

© 2026 Urban Legends. Toate drepturile rezervate.

---

Made by GV-Productions with ❤️ for Urban Legends Community

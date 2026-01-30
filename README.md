# Pooja's Chai Academy

A browser-based cooking sim where you (as Sean) learn to make authentic chai across 5 levels of increasing difficulty. Pooja judges your chai with witty commentary, and Tara provides hints by asking questions.

## How to Run

Open `index.html` in any modern browser. No build step or server required.

```bash
# Or use a local server:
npx serve .
# or
python3 -m http.server 8000
```

## How to Deploy

This is a fully static site — just upload the `chai-game/` folder to any static host:

- **GitHub Pages**: Push to a repo, enable Pages in settings
- **Netlify/Vercel**: Drag and drop the folder
- **Any web server**: Copy the files

## Game Structure

- **5 Levels**: Basic Chai → Adrak Chai → Masala Chai → Cutting Chai → Pooja's Special
- **5 Gameplay Phases**: Ingredient Selection → Preparation → Cooking → Timing → Serving
- **Scoring**: 100 points across 5 categories (20 each). 85+ = 3 stars.
- **Tara Mode**: Hard mode with no hints. Earn 3 stars for a badge.
- **Progress**: Saved to localStorage. Share scores via URL.

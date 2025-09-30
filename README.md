# Recovery Reflections — Michael Montgomery

A private, single-page, mobile-first reading experience for reflective recovery insights. Beautiful typography, minimal UI, maximum focus.

## Features

- **10 Concise Chapters** — Insights, sparks, and micro-practices tailored to recovery themes
- **Highlight & Save** — Select any sentence to save as a resonant line
- **Personal Notes** — Write and save 3-sentence reflections for each chapter
- **AI Reflection Prompts** — Generate tailored questions with contextual awareness (with fallback for offline)
- **Local-First** — All data stays on your device (localStorage)
- **Light & Dark Themes** — Gorgeous typography optimized for both
- **Focus Mode** — Hide navigation for distraction-free reading
- **Export Data** — Download all your notes and reflections as JSON
- **Accessible** — WCAG AA compliant with full keyboard navigation

## Quick Start

### Option 1: Open Locally

Simply open `index.html` in a modern web browser. All features work offline except AI generation.

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

### Option 2: Local Server (for AI features)

For the AI reflection feature to work, you need a server that can handle the `/ai/generate` endpoint.

```bash
# Python 3
python3 -m http.server 8000

# Node.js with http-server
npx http-server -p 8000

# Then visit: http://localhost:8000
```

## AI Integration

The app expects a `POST /ai/generate` endpoint that accepts this payload:

```json
{
  "profile": {
    "name": "Michael Montgomery",
    "spouse": "Jean",
    "timezone": "America/Los_Angeles",
    "eveningWindow": {"start":"17:00","end":"20:00"},
    "medication": {"type":"oral_naltrexone","doseTime":"14:00"}
  },
  "chapterId": "c1",
  "chapterSummary": "How to be seen without feeling graded...",
  "priorNotes": ["Note 1", "Note 2", "Note 3"],
  "recentResonances": ["Resonant line 1", "..."],
  "userContext": {"localTime":"17:12","companionship":"alone"}
}
```

And returns:

```json
{
  "prompts": [
    "Question 1...",
    "Question 2...",
    "Question 3..."
  ],
  "supportiveNotes": [
    "Context note 1...",
    "Context note 2..."
  ]
}
```

### System Prompt for LLM

Use this system prompt when configuring your AI provider:

```
You are a compassionate, succinct recovery coach writing for a 62-year-old investigative journalist in San Francisco named Michael who is several weeks into daily oral naltrexone. Evenings (5–8 pm) are his risk window. He tends to isolate when anticipating evaluation by others ('audience problem'), uses secrecy as competence protection, and historically drank alone to 'get lost' (amnesty from roles). He values exercise, walking/hiking, music/jazz, and wants more social/structured activities as he approaches retirement. Tone: non-judgmental, specific, pragmatic, never shaming. Output only 2–4 reflection questions plus 1–2 supportive context notes. Keep total under 180 words.
```

### Creating a Simple AI Proxy

Here's a minimal Node.js proxy example:

```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('.'));

app.post('/ai/generate', async (req, res) => {
  // Forward to your AI provider (OpenAI, Anthropic, etc.)
  // Include the system prompt and user context
  
  const response = await yourAIProvider.generate({
    system: "You are a compassionate recovery coach...",
    messages: [
      { role: "user", content: JSON.stringify(req.body) }
    ]
  });
  
  res.json(response);
});

app.listen(8000, () => console.log('Server running on port 8000'));
```

**If no AI endpoint is available**, the app automatically falls back to pre-written reflection questions for each chapter.

## Data Storage

All data is stored in `localStorage` under the key `mm_recovery_page_v1`:

```json
{
  "profile": { ... },
  "resonantLines": [ ... ],
  "notes": [ ... ],
  "aiPrompts": [ ... ],
  "theme": "dark",
  "focusMode": false
}
```

**To clear all data**: Open browser console and run:
```javascript
localStorage.removeItem('mm_recovery_page_v1');
```

## Keyboard Shortcuts

- `Cmd/Ctrl + D` — Toggle dark/light theme
- `Cmd/Ctrl + F` — Toggle focus mode
- `Cmd/Ctrl + E` — Export data
- `Escape` — Close modal

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Typography

- **Headings**: Inter (sans-serif)
- **Body**: Source Serif Pro (serif)
- **Base size**: 18px mobile, 20px desktop
- **Line height**: 1.65
- **Max text width**: 700px

## Design Principles

1. **Text-first** — No dashboards, charts, or heavy UI
2. **Mobile-optimized** — Designed for phone reading
3. **Performance** — Fast first paint, minimal JS/CSS
4. **Privacy** — No tracking, no analytics, no cloud sync
5. **Accessibility** — Semantic HTML, keyboard nav, screen reader friendly

## Customization

### Change Colors

Edit CSS custom properties in `styles.css`:

```css
:root {
  --accent: #7AC4FF;
  --bg-primary: #FFFFFF;
  --text-primary: #18202A;
  /* ... */
}
```

### Modify Content

Edit chapter content directly in `index.html` or update the `chapterData` object in `app.js` for fallback questions and summaries.

### Adjust Typography

Change font families in `styles.css`:

```css
:root {
  --font-sans: 'Inter', sans-serif;
  --font-serif: 'Source Serif Pro', serif;
}
```

## Privacy Note

This page saves data **only on your device**. There is:
- No tracking
- No analytics
- No cloud sync
- No login required
- No cookies (except localStorage)

AI calls are the only network activity, and only when you click "Generate AI Reflection."

## License

Private use only. Created for Michael Montgomery.

## Support

For questions or issues, contact the developer.

---

**Built with**: HTML, CSS, JavaScript  
**Fonts**: Inter, Source Serif Pro (via Google Fonts)  
**Storage**: localStorage  
**AI**: Optional endpoint integration

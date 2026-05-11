# SpendLens V1

Personal finance tracker — upload a statement screenshot, get instant spending insights.

## Stack
- Pure HTML/CSS/JS frontend (no framework, no build step)
- Netlify serverless function to proxy Anthropic API
- All data stored in browser `localStorage`

## Project structure
```
spendlens/
├── index.html                   ← Entire frontend
├── netlify.toml                 ← Routes /api/extract → function
├── netlify/
│   └── functions/
│       └── extract.js           ← Anthropic API proxy
└── README.md
```

## Deploy to Netlify (5 min)

1. **Push to GitHub**
   ```bash
   git init && git add . && git commit -m "SpendLens V1"
   gh repo create spendlens --public --push
   ```

2. **Connect on Netlify**
   - netlify.com → Add new site → Import from GitHub → pick your repo
   - Build command: _(leave empty)_
   - Publish directory: `.` (root)
   - Click Deploy

3. **Add your API key**
   - Netlify → Site → Site configuration → Environment variables
   - Add: `ANTHROPIC_API_KEY` = your key from console.anthropic.com
   - Redeploy (Deploys → Trigger deploy)

4. Your app is live at `https://your-site.netlify.app`

## Run locally (no server needed for UI testing)

Open `index.html` directly in a browser.
Note: The `/api/extract` call will fail locally without a server.
For local API testing use the Netlify CLI:
```bash
npm install -g netlify-cli
netlify dev
```
Then open http://localhost:8888

## Privacy notes
- Uploaded images are read into memory, sent once to the API, then discarded.
- No image is stored anywhere — not in the browser, not on the server.
- Only structured transaction JSON is persisted (in localStorage).

## V2 ideas
- PWA / offline mode (service worker)
- Export to CSV
- Multi-month trend charts
- Category rename / custom categories
- Optional PIN lock

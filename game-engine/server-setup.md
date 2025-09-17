# 🚀 Server Setup Instructions

The game engine uses ES6 modules which require a web server due to CORS policies. Here are several easy ways to run it:

## Option 1: Python (Easiest if you have Python)
```bash
# Navigate to the game-engine folder
cd /path/to/game-engine

# Python 3
python -m http.server 8000

# Python 2 (if needed)
python -m SimpleHTTPServer 8000
```
Then open: `http://localhost:8000`

## Option 2: Node.js
```bash
# Install a simple server globally
npm install -g http-server

# Navigate to game-engine folder and run
cd /path/to/game-engine
http-server -p 8000
```
Then open: `http://localhost:8000`

## Option 3: Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Option 4: Browser-based (Chrome)
```bash
# Start Chrome with disabled security (NOT recommended for regular browsing)
chrome.exe --disable-web-security --user-data-dir="c:/chrome-dev-session"
```

## Option 5: Online Hosting
Upload the files to:
- GitHub Pages
- Netlify
- Vercel
- CodePen
- Any web hosting service

## Troubleshooting
- **CORS Error**: You're opening the file directly (file://). Use a server.
- **Module not found**: Check file paths and ensure server is serving from the correct directory.
- **Blank page**: Check browser console for JavaScript errors.

## Current Status
The `index.html` has been modified with a simple demo that works without a server, but for the full engine experience, please use one of the server options above!

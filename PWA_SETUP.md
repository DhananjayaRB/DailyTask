# Progressive Web App (PWA) Setup

## Icon Generation

You need to create PWA icons. You can use any image editor or online tool:

1. Create a 192x192px PNG icon
2. Create a 512x512px PNG icon
3. Place them in the `public` folder as:
   - `public/icon-192.png`
   - `public/icon-512.png`

### Quick Icon Creation

You can use online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/

Or create simple icons with:
- A crown emoji (👑) on a colored background
- Primary color: #6366F1 (Indigo)
- Background: #F8FAFC (Light gray)

## Installation

After creating the icons, install dependencies:

```bash
npm install
```

## Testing PWA

1. Build the app:
```bash
npm run build
```

2. Serve the build:
```bash
npm run preview
```

3. Open in Chrome and check:
   - DevTools > Application > Manifest
   - DevTools > Application > Service Workers
   - Look for "Install" prompt in address bar

## Mobile Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap Share button
3. Select "Add to Home Screen"

### Android (Chrome)
1. Open the app in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home Screen" or "Install App"

## Features Enabled

✅ Offline support (service worker)
✅ Installable on mobile devices
✅ App-like experience
✅ Responsive design for all screen sizes
✅ Touch-optimized interactions


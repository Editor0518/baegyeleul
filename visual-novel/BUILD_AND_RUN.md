# Build and Run Guide

This project is a static-exported Next.js visual novel. The build output is a folder of static files that can be served by any HTTP server (no Node.js runtime required once built).

## What the built output does
- Runs the visual novel entirely in the browser using pre-bundled HTML, JS, CSS, and assets.
- No server-side rendering or API calls are required after export; serving the static files is enough.
- Suitable for sharing as a zip or hosting on any static host (S3, GitHub Pages, Netlify, etc.).

## Prerequisites
- Node.js 18.18+ (20 LTS recommended)
- npm installed with Node

## Build steps
1) Install dependencies (first time only):
   ```bash
   npm install
   ```
2) Build the static export (writes to `out/`):
   ```bash
   npm run build
   ```

## Package for sharing
- Build and create a zip in one step:
  ```bash
  npm run build:package
  ```
  - Output: `visual-novel-out.zip` in the `visual-novel` folder.
  - Internally runs `npm run build` then zips the `out/` directory.
- If you only need the folder (not a zip), use `npm run build` and share the `out/` directory as-is.

## Run the built output locally
Because the export is static, you just need a static file server (for correct routing and MIME types).

- Using `serve` (recommended):
  ```bash
  npx serve out -l 3000
  ```
- Using Python (comes with Python 3):
  ```bash
  cd out
  python -m http.server 3000
  ```
- Then open: http://localhost:3000

## Notes
- The build output is ignored by git (`out/` and `visual-novel-out.zip`).
- If the zip step fails on macOS/Linux, ensure `zip` is available. On Windows, PowerShell's `Compress-Archive` is required.

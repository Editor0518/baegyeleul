# Visual Novel (Next.js static export)

This project is a static-exported Next.js visual novel. The build produces a folder of static files that can be hosted anywhere or zipped and shared.

## Quick start
- Requirements: Node.js 18.18+ (20 LTS recommended) and npm.
- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Build static export: `npm run build`
- Build and zip in one step: `npm run build:package` (creates `visual-novel-out.zip`)

## Running the built output
Serve the `out/` directory with any static file server (e.g., `npx serve out -l 3000` or `python -m http.server 3000` inside `out`).

Detailed build and distribution steps are in [visual-novel/BUILD_AND_RUN.md](visual-novel/BUILD_AND_RUN.md).

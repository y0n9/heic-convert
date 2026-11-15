# heicconvert

<p align="center">
  English · <a href="./README_ZH.md">简体中文</a>
</p>

> Free, private HEIC to JPG / PNG / WebP conversion, entirely in your browser.

heicconvert is a fully client-side HEIC/HEIF image conversion tool site. The homepage is the converter itself: select or drop in photos and conversion starts automatically, outputting JPG, PNG, or WebP — downloadable individually or packaged as a ZIP.

The entire conversion runs locally in the browser — no backend, no upload endpoint, no account, no watermark. The site UI is in English; this file is the English project documentation.

## Features

- **Three output formats**: JPG (adjustable quality), PNG (lossless), WebP (adjustable quality). No other formats.
- **Batch conversion**: supports `.heic` / `.heif` via drag-and-drop or file picker; after upload, files are converted in sequence, with an overall progress percentage and the current file name shown.
- **Quality settings**: JPG / WebP quality ranges 10%–100%, default 90%; the quality slider is hidden for PNG. Changing format or quality after conversion prompts a re-conversion.
- **Multi-image containers**: when a HEIC contains multiple images, they are exported as separate, numerically-suffixed files.
- **Download**: download one by one, or package with JSZip as `heic-to-<format>-photos.zip`, with automatic handling of duplicate names.
- **Result info**: preview image, output dimensions, output size, and output file name.
- **Resilience**: batch format validation, per-file failure reasons with retry, remove single / clear list, and a warning (not a hard rejection) when a file exceeds 50 MB about device-memory risk.
- **Privacy**: photos are never uploaded and no watermark is injected; closing the tab clears the current workspace. Image conversion is 100% local. The page does load Google Tag Manager (GTM-WR382QHR) for anonymous usage analytics, so the site makes outbound requests to Google — but no photo or file data is ever included in those requests.
- **SEO content pages**: four guides — iPhone settings, HEIC vs JPG, opening on Windows, converting on Mac — with route-level title / description.
- **Responsive**: one light-cream / deep-green visual system for both desktop and mobile.

## Tech Stack

| Category    | Choice                                                             |
| ----------- | ------------------------------------------------------------------ |
| Framework   | React 19 + TypeScript 5.9                                          |
| Build       | Vite 7 (`base: '/'`), ESLint 9                                     |
| Styling     | Tailwind CSS 3 + hand-written CSS (`src/App.css`, `src/index.css`) |
| Routing     | react-router-dom 7 (`BrowserRouter`)                               |
| Icons       | lucide-react                                                       |
| HEIC decode | heic2any 0.0.4 (dynamically imported on demand)                    |
| ZIP         | jszip 3 (dynamically imported on demand)                           |

The project was initialized from the modern-web-app template, so `package.json` still carries a batch of template-bundled shadcn/ui and Radix UI dependencies; only the few items in the table above are required at runtime.

## Local Development

Requires Node.js **20.19+ or 22.12+** (Vite 7 requirement; this project was verified on `v22.22.2` / npm `10.9.7`).

```bash
npm ci                # or npm install
npm run dev           # start dev server, default http://localhost:5173
npm run lint          # ESLint check
npm run build         # tsc -b + vite build, output in dist/
npm run preview       # preview the production build locally
```

## Directory Structure

```text
.
├── index.html                    # static fallback title / description / favicon
├── public/_redirects             # SPA fallback: /* /index.html 200
├── README.md                    # English project documentation (default)
├── README_ZH.md                 # Chinese project documentation
├── src/
│   ├── App.tsx                   # routes, tool-page content, FAQ
│   ├── App.css / index.css       # site-wide styles
│   ├── main.tsx                  # entry point
│   ├── heic2any.d.ts             # decoder library type declarations
│   ├── lib/formats.ts            # output format types and display names (shared constants)
│   └── components/
│       ├── Converter.tsx         # conversion state machine, upload, convert, download, ZIP
│       ├── SiteLayout.tsx        # brand wordmark, nav, footer, dynamic copyright year
│       ├── GuidePages.tsx        # four guides and related reading
│       ├── Seo.tsx               # updates title / meta per route
│       └── FaqList.tsx
└── vite.config.ts
```

## Pages & Routes

| Path                           | Content                                                        | Default format |
| ------------------------------ | -------------------------------------------------------------- | -------------- |
| `/`                            | HEIC to JPG converter (home)                                   | JPG            |
| `/heic-to-png`                 | HEIC to PNG converter                                          | PNG            |
| `/heic-to-webp`                | HEIC to WebP converter                                         | WebP           |
| `/iphone-heic-to-jpg`          | iPhone HEIC settings & conversion guide                        | —              |
| `/heic-vs-jpg`                 | HEIC vs JPG comparison                                         | —              |
| `/how-to-open-heic-on-windows` | Open HEIC on Windows                                           | —              |
| `/how-to-convert-heic-on-mac`  | Convert HEIC on Mac (browser / Preview / Finder Quick Actions) | —              |

Unmatched paths redirect to the home page.

## Conversion Implementation Notes

- `heic2any` and `jszip` are dynamically imported, so the decoder and bundler are not loaded on first paint.
- Decoding uses `multiple: true`, so multiple images inside one HEIC container produce multiple output records.
- **WebP cannot be passed directly to `heic2any`**: it only accepts `image/png`, `image/jpeg`, `image/gif`; passing `image/webp` silently falls back to PNG. This project first decodes to an intermediate PNG via `toType: "image/png"`, then re-encodes through `createImageBitmap` + `canvas.toBlob(..., "image/webp", quality)`, and uses canvas capability detection to surface a readable error early. When modifying this logic, keep the two-stage flow.
- Outputs use `URL.createObjectURL` for previews and download links; `revokeObjectURL` is called on file removal, list clearing, or component unmount.
- The footer copyright year is taken from the current year at runtime and synced when the tab becomes visible again or the window regains focus, so it updates across the new year without a refresh.

## Deployment

The build output is static files, suitable for static hosting such as Cloudflare Pages or Netlify:

```text
Build command:      npm run build
Output directory:   dist
Node version:       22
```

`public/_redirects` contains `/* /index.html 200` to ensure direct visits to sub-routes like `/heic-to-webp` fall back to the SPA entry.

If deploying to **GitHub Pages**, `_redirects` will not take effect: you need to provide a `404.html` fallback yourself or switch to HashRouter; if deploying under `https://<user>.github.io/<repo>/`, you must also update `base` in `vite.config.ts` and the `basename` of `BrowserRouter`.

## Verified

- `npm run lint` and `npm run build` pass.
- End-to-end tested with the heic2any official demo sample `1.heic` (41,389 bytes, container header `ftypmif1`): JPG output has a standard JPEG/JFIF header, PNG output `89504e47`, WebP output `RIFF....WEBP`; dimensions 1440×960; single download and ZIP contents/names are correct; the two-file batch WebP ZIP passes.
- Format-switch re-conversion, PNG hiding the quality slider, and invalid-HEIC failure prompts with retry all pass; the conversion flow makes no external fetch / XHR and uploads no photos. Note: the page now loads Google Tag Manager for analytics, so the browser makes outbound requests to Google (analytics only — no image data).

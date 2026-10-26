# Steamwave

Live Steam discounts in a glassmorphism UI with light and dark modes. Click any game to open its Steam store page.

## Structure
- `public/index.html` – the whole front end (HTML, CSS, JS)
- `api/deals.js` – serverless function that fetches Steam's store API (Steam blocks direct browser calls with CORS) and caches the result at the edge for 2 minutes

## Deploy on Vercel
1. Push this folder to a GitHub repo, then choose **Add New > Project** in Vercel and import it. No build settings needed.
2. Or from this folder: `npm i -g vercel && vercel --prod`

## Run locally
`vercel dev` (a plain static server will not serve `/api/deals`).

## Notes
- Regions: edit the `REGIONS` list in `api/deals.js` and the `<select>` in `public/index.html`.
- Not affiliated with Valve. Prices come from the public Steam store feed.

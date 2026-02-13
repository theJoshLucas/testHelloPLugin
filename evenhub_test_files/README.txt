# Even Hub test files

This bundle contains:

1) `random.json` — a safe JSON file to confirm URL/QR fetching works.
2) `not-a-plugin.html` — basic HTML to see whether Even Hub renders HTML or just shows source.
3) `evenhub-hello/` — a tiny no-build web app that imports `@evenrealities/even_hub_sdk` and attempts:
   - getUserInfo()
   - getDeviceInfo()
   - createStartUpPageContainer(...)
   - audioControl(true/false)
   - subscribes to onEvenHubEvent(...)

To test #3, host `evenhub-hello/` over HTTPS (GitHub Pages, Vercel, Netlify, Cloudflare Pages).
Then point Even Hub at the hosted `index.html`.

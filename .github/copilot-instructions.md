# Project Instructions

- This is a single-restaurant digital menu. Customer UI is Persian RTL; code, comments, logs, and technical documentation are English.
- Keep runtime requests same-origin. Bundle fonts and icons locally; store product images under `public/uploads`.
- Before changing Next.js conventions, read the matching guide under `node_modules/next/dist/docs/` for the installed version.
- Protect admin pages and every write API with both proxy-level and server-side session checks. Validate request data with Zod.
- Run `npm run lint`, `npx prisma validate`, and `npm run build` after meaningful changes.
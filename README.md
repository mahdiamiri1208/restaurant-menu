# Restaurant Digital Menu

A single-restaurant, Persian RTL digital menu and admin panel built with Next.js, PostgreSQL, and Prisma. Customers can browse the menu and tell their order to the waiter; this application does not accept online orders.

## Requirements

- Docker Engine and Docker Compose for the production-like setup
- Node.js 22 and npm for local development
- An HTTPS domain and TLS certificate for production

## First Run

1. Copy `.env.example` to `.env` and replace all sample passwords and secrets. Keep `JWT_SECRET` at least 32 characters and use a strong `ADMIN_PASSWORD` of at least 12 characters.
2. Start the stack with `docker compose up -d --build`.
3. Open `PUBLIC_URL` and sign in at `/admin/login` with `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
4. Change the admin password immediately in the admin panel.

The app container waits for PostgreSQL, applies migrations, creates the initial admin/settings and sample menu idempotently, then serves Next.js. Products and categories can be edited in the admin panel. Every write invalidates the public menu route.

For local development, set `DATABASE_URL` in `.env` to a local PostgreSQL instance (host `localhost`), then run:

```sh
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

## Self-Hosted / Offline Runtime

The browser only loads assets from this app's own origin. Vazirmatn is bundled locally and loaded through `next/font/local`; icons are inline SVG; product images are stored in the `uploads` Docker volume and served by this app. There are no analytics, hosted font, CDN, third-party auth, or external image/API requests.

In browser DevTools, inspect Network and confirm every request uses the restaurant domain. After one successful visit, the service worker caches the menu document, images, fonts, scripts, and styles for weak or interrupted connections. The service worker does not make uncached database updates available while the server is offline; it shows the last cached menu page instead.

Build the image on an internet-connected machine, then transfer both the app and PostgreSQL images if the VPS cannot reach public registries:

```sh
docker pull postgres:16-alpine
docker build -t restaurant-menu:latest .
docker save -o restaurant-menu-images.tar restaurant-menu:latest postgres:16-alpine
scp restaurant-menu-images.tar user@vps:/srv/restaurant-menu/
```

On the VPS, copy the project files and `.env` into `/srv/restaurant-menu`, then load the transferred images and start without building or pulling:

```sh
docker load -i restaurant-menu-images.tar
docker compose up -d --no-build
```

Alternatively, build in Iran using a trusted npm/Docker mirror reachable from the build machine. No registry access is needed at runtime after the images are loaded. Keep the `.ir` domain's DNS with an operator hosted inside Iran; do not put Cloudflare or another foreign DNS/proxy service in front of the VPS.

## HTTPS and Nginx

Use `nginx.conf.example` as the reverse-proxy template. Replace `menu.example.ir` and certificate paths, install a TLS certificate from a certificate provider reachable under your deployment conditions, and reload Nginx. Compose binds the app to `127.0.0.1:3000`; only Nginx should be exposed publicly. Restrict PostgreSQL to the internal Compose network.

## QR Code

Set `PUBLIC_URL` to the permanent HTTPS menu URL, then run:

```sh
npm run qr
```

This writes `menu-qr.svg` and a 1200px `menu-qr.png` with error correction level H and margin 2. Print at least 3-4 cm wide, use high contrast, avoid glossy glare, and test the print with several phones before placing it on tables. The QR encodes the permanent `PUBLIC_URL`, so menu changes do not require reprinting it.

## Backups and Restore

The backup script saves a compressed PostgreSQL dump and a compressed archive of uploaded images. Run it daily on the host; for example, add this to root's crontab after making the script executable:

```cron
0 2 * * * cd /srv/restaurant-menu && BACKUP_DIR=/srv/backups/restaurant-menu ./scripts/backup.sh >> /var/log/restaurant-menu-backup.log 2>&1
```

Run `chmod +x scripts/backup.sh scripts/restore.sh` once after copying the scripts to the VPS.

Keep backups on a separate disk or a trusted storage location and periodically verify them. To restore, stop app writes, then run:

```sh
./scripts/restore.sh /srv/backups/restaurant-menu/database-YYYYMMDD-HHMMSS.sql.gz /srv/backups/restaurant-menu/uploads-YYYYMMDD-HHMMSS.tar.gz
docker compose restart app
```

## Useful Commands

```sh
npm run lint
npm run build
npx prisma validate
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Security Notes

- Set unique production values for `ADMIN_PASSWORD`, `POSTGRES_PASSWORD`, and `JWT_SECRET` before the first start.
- The login route applies an in-process IP rate limit. Keep Nginx in front and preserve `X-Forwarded-For` from a trusted proxy only.
- Admin pages and write APIs check the session in both the Next.js proxy and server-side handlers.
- Uploaded files are restricted to JPEG, PNG, and WebP, capped at 5 MB, decoded and resized with Sharp, and stored as WebP.

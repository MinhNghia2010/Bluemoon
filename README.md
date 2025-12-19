# Apartment Fee Management App

Simple Next.js 14 app for managing apartment fees, households, parking, utilities, and payments. Uses Prisma with SQLite by default.

## Prerequisites
- Node.js 18+ and npm
- Git (for cloning)

## Quick start
1) Clone and install
```bash
git clone <your-repo-url>
cd "Apartment Fee Management App"
npm install
```

2) (Optional) Set a custom JWT secret
Create `.env.local` in the project root:
```bash
JWT_SECRET=change-me
```
The app falls back to a default value if unset, but setting your own is recommended.

3) Prepare the database (SQLite `prisma/dev.db`)
```bash
npx prisma migrate dev --name init
npm run db:seed
```

4) Run the app
```bash
npm run dev
# open http://localhost:3000
```

## Default login
- Username: `admin`
- Password: `admin123`

## Common scripts
- `npm run dev` – start Next.js in dev mode
- `npm run build` – production build
- `npm run start` – start production server (after build)
- `npm run lint` – lint the codebase
- `npm run db:migrate` – run Prisma migrations
- `npm run db:push` – push schema changes without migrations
- `npm run db:seed` – seed sample data
- `npm run db:studio` – open Prisma Studio

## Notes
- Database is SQLite by default; update `datasource db` in `prisma/schema.prisma` if you switch providers.
- Seeding wipes existing records for payments, utilities, parking, categories, households, and settings before inserting sample data; users are preserved or upserted.
- Tailwind CSS 4/PostCSS and Radix UI are used for UI components.
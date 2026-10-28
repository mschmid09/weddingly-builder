# 🚀 Quick Start Guide

## Prerequisites

Before you begin, make sure you have:

- Node.js (v18 or higher)
- A PostgreSQL database (local or cloud)

## Option 1: Automated Setup (Recommended)

1. **Clone and navigate to the project**:

   ```bash
   cd /Users/dannydwicahyono/Projects/weddingly-builder
   ```

2. **Run the setup script**:

   ```bash
   ./setup.sh
   ```

3. **Follow the prompts** to configure your database

4. **Start the server**:
   ```bash
   npm run dev
   ```

## Option 2: Manual Setup

### Step 1: Database Setup

Choose one of these options:

#### A. Supabase (Recommended - Free)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection string → URI
4. Copy the connection string

#### B. Neon (Alternative - Free)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

#### C. Local PostgreSQL

1. Install PostgreSQL
2. Create database:
   ```bash
   createdb weddingly
   ```

### Step 2: Configure Environment

1. **Copy the environment template**:

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** and update the DATABASE_URL:
   ```env
   DATABASE_URL="postgresql://username:password@host:5432/database"
   ```

### Step 3: Install and Setup

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

### Step 4: Access the App

1. Open your browser to `http://localhost:4321/admin`
2. Click "Sign up" to create your account
3. Start building your wedding website!
4. Publish the wedding, then visit `http://localhost:4321` for the guest invitation.

## Deploy to Vercel

1. Import your GitHub repository into Vercel.
2. Use the **Astro** framework preset, with the repository root as the root
   directory. Leave the output directory at its framework default; do not
   override it to `dist/client` or `dist/server`.
3. Use `npm run build` as the build command. This generates Prisma Client
   before building the app with the Vercel adapter.
4. Set `DATABASE_URL` to your PostgreSQL connection string in Vercel's
   environment variables. Configure the Cloudinary variables from
   [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) if you need uploads.
5. Apply the checked-in migrations to your production database from a trusted
   environment with `npx prisma migrate deploy`, using the production
   `DATABASE_URL`.
6. Deploy, or redeploy after changing environment variables or project settings.
   The home page should redirect to `/login` when you are signed out.

### Vercel `404 NOT_FOUND` after a successful build

This app requires server-side rendering, including authentication and API
routes. A standalone Node build does not create Vercel serverless routes.
Keep `@astrojs/vercel` configured in `astro.config.mjs`; a successful build
should create `.vercel/output/config.json` and a server function under
`.vercel/output/functions/`.

If the adapter is correct but the error persists, check the framework preset,
root directory, and output-directory overrides above, then redeploy and visit
the new deployment URL. Protected preview URLs also require Vercel login.

## 🎯 What You'll See

### First Time

- **Landing page** → Redirects to login
- **Login page** → Create account or login
- **Admin dashboard** → Builder form (empty)

### After Setup

- **Builder tab** → Fill in your wedding details
- **RSVP List tab** → View guest responses (empty initially)

## 📋 Checklist

- [ ] Database is running and accessible
- [ ] `.env` file is created with correct DATABASE_URL
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Migrations applied (`npx prisma migrate dev`)
- [ ] Server is running (`npm run dev`)
- [ ] Can access `http://localhost:4321`
- [ ] Can register a new account
- [ ] Can see the admin dashboard

## 🐛 Troubleshooting

### "Cannot connect to database"

- Check DATABASE_URL in `.env`
- Verify database is running
- Test connection with: `npx prisma db pull`

### "Prisma Client not found"

- Run: `npx prisma generate`

### "Migration failed"

- Reset database: `npx prisma migrate reset`
- Or manually: `npx prisma migrate dev`

### Port 4321 already in use

- Stop other processes or change port in `astro.config.mjs`

### Build errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 🛠️ Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# View database in Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

## 📚 Documentation

- **Setup Guide**: `ADMIN_SETUP.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Product Requirements**: `docs/PRD.md`

## ✅ Test Your Setup

After setup, verify everything works:

1. **Register**: Create a new account
2. **Login**: Sign in with your credentials
3. **Builder**: Fill in at least:
   - Couple names
   - Wedding date
   - One event
4. **Save**: Click "Save Draft"
5. **Publish**: Click "Publish Website"
6. **RSVP Tab**: Switch to RSVP List (will be empty)

If all steps work, you're ready to go! 🎉

## 🎨 Next Steps

1. Fill in all wedding details in the Builder
2. Upload images (use image URLs for now)
3. Customize colors and fonts
4. Enable/disable sections as needed
5. Set a wedding identifier (used internally, not in guest URLs)
6. Publish your website

---

**Need help?** Check the troubleshooting section above or refer to `ADMIN_SETUP.md` for detailed instructions.
